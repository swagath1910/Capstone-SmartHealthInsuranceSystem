using Microsoft.AspNetCore.Mvc;
using HealthInsuranceMgmtApi.Controllers;
using HealthInsuranceMgmtApi.DTOs;
using HealthInsuranceMgmtApi.Services.Interfaces;

namespace HealthInsuranceTesting;

public class AuthControllerTests
{
    private readonly Mock<IAuthService> _mockAuthService;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _mockAuthService = new Mock<IAuthService>();
        _controller = new AuthController(_mockAuthService.Object);
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsOkResult()
    {
        // Arrange
        var loginDto = new LoginDto { Email = "test@example.com", Password = "password123" };
        var authResponse = new AuthResponseDto 
        { 
            Token = "test-token",
            User = new UserDto { Email = "test@example.com" }
        };
        
        _mockAuthService.Setup(s => s.LoginAsync(loginDto)).ReturnsAsync(authResponse);

        // Act
        var result = await _controller.Login(loginDto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnValue = Assert.IsType<AuthResponseDto>(okResult.Value);
        Assert.Equal("test-token", returnValue.Token);
    }

    [Fact]
    public async Task Login_InvalidCredentials_ReturnsUnauthorized()
    {
        // Arrange
        var loginDto = new LoginDto { Email = "test@example.com", Password = "wrongpassword" };
        _mockAuthService.Setup(s => s.LoginAsync(loginDto)).ReturnsAsync((AuthResponseDto?)null);

        // Act
        var result = await _controller.Login(loginDto);

        // Assert
        Assert.IsType<UnauthorizedObjectResult>(result.Result);
    }

    [Fact]
    public async Task Register_ValidData_ReturnsOkResult()
    {
        // Arrange
        var registerDto = new RegisterDto 
        { 
            FirstName = "John",
            LastName = "Doe",
            Email = "john@example.com", 
            Password = "password123",
            PhoneNumber = "1234567890",
            DateOfBirth = DateTime.Now.AddYears(-25)
        };
        var authResponse = new AuthResponseDto 
        { 
            Token = "test-token",
            User = new UserDto { Email = "john@example.com" }
        };
        
        _mockAuthService.Setup(s => s.RegisterAsync(registerDto)).ReturnsAsync(authResponse);

        // Act
        var result = await _controller.Register(registerDto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.IsType<AuthResponseDto>(okResult.Value);
    }

    [Fact]
    public async Task Register_DuplicateEmail_ReturnsBadRequest()
    {
        // Arrange
        var registerDto = new RegisterDto 
        { 
            Email = "existing@example.com",
            Password = "password123"
        };
        
        _mockAuthService.Setup(s => s.RegisterAsync(registerDto))
            .ThrowsAsync(new InvalidOperationException("Email already exists"));

        // Act
        var result = await _controller.Register(registerDto);

        // Assert
        Assert.IsType<BadRequestObjectResult>(result.Result);
    }
}