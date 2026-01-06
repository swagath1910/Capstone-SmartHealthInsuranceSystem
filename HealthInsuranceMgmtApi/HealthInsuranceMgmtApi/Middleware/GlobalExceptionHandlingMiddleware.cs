using System.Net;
using System.Text.Json;
using Microsoft.Data.SqlClient;
using System.Data.Common;

namespace HealthInsuranceMgmtApi.Middleware;

public class GlobalExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlingMiddleware> _logger;

    public GlobalExceptionHandlingMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred: {ExceptionType} - {Message}", 
                ex.GetType().Name, ex.Message);
            
            // Ensure response hasn't been started
            if (!context.Response.HasStarted)
            {
                await HandleExceptionAsync(context, ex);
            }
            else
            {
                _logger.LogWarning("Cannot write error response, response has already started");
            }
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = new ErrorResponse();

        switch (exception)
        {
            case UnauthorizedAccessException:
                response.StatusCode = (int)HttpStatusCode.Unauthorized;
                response.Message = "Invalid email or password";
                response.Details = "Authentication failed. Please check your credentials.";
                break;
            case ArgumentNullException:
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                response.Message = "Required field is missing";
                response.Details = "Please provide all required information";
                break;
            case ArgumentException:
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                response.Message = exception.Message;
                response.Details = "Invalid argument provided";
                break;
            case InvalidOperationException:
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                response.Message = exception.Message;
                response.Details = "The operation is not valid for the current state";
                break;
            case KeyNotFoundException:
                response.StatusCode = (int)HttpStatusCode.NotFound;
                response.Message = exception.Message;
                response.Details = "The requested resource was not found";
                break;
            case SqlException sqlEx:
                response.StatusCode = (int)HttpStatusCode.InternalServerError;
                response.Message = "Database operation failed";
                response.Details = sqlEx.Number switch
                {
                    2 => "Database connection timeout",
                    18456 => "Database authentication failed",
                    547 => "Database constraint violation",
                    _ => "Database error occurred"
                };
                break;
            case DbException:
                response.StatusCode = (int)HttpStatusCode.InternalServerError;
                response.Message = "Database operation failed";
                response.Details = "An error occurred while accessing the database";
                break;
            case TaskCanceledException:
            case OperationCanceledException:
                response.StatusCode = (int)HttpStatusCode.RequestTimeout;
                response.Message = "Request timeout";
                response.Details = "The request took too long to complete";
                break;
            case FormatException:
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                response.Message = "Invalid data format";
                response.Details = exception.Message;
                break;
            case OverflowException:
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                response.Message = "Numeric value out of range";
                response.Details = exception.Message;
                break;
            default:
                response.StatusCode = (int)HttpStatusCode.InternalServerError;
                response.Message = "An internal server error occurred";
                response.Details = "An unexpected error occurred. Please try again later.";
                break;
        }

        context.Response.StatusCode = response.StatusCode;

        var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        });

        await context.Response.WriteAsync(jsonResponse);
    }
}

public class ErrorResponse
{
    public int StatusCode { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? Details { get; set; }
}
