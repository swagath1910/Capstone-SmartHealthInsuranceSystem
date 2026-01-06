using HealthInsuranceMgmtApi.Data;
using HealthInsuranceMgmtApi.Models;

namespace HealthInsuranceMgmtApi.Services;

public class NotificationBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<NotificationBackgroundService> _logger;

    public NotificationBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<NotificationBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Notification Background Service started");

        await foreach (var notification in NotificationQueue.Reader.ReadAllAsync(stoppingToken))
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<HealthInsuranceDbContext>();

                var notificationHistory = new NotificationHistory
                {
                    UserId = notification.UserId,
                    Type = notification.Type,
                    Title = notification.Title,
                    Message = notification.Message,
                    PolicyId = notification.PolicyId,
                    ClaimId = notification.ClaimId,
                    CreatedAt = DateTime.UtcNow
                };

                context.NotificationHistories.Add(notificationHistory);
                await context.SaveChangesAsync(stoppingToken);

                _logger.LogInformation("Notification saved for User {UserId}: {Title}", 
                    notification.UserId, notification.Title);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing notification for User {UserId}", 
                    notification.UserId);
            }
        }
    }
}