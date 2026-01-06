using Microsoft.AspNetCore.Mvc;
using HealthInsuranceMgmtApi.Controllers;
using HealthInsuranceMgmtApi.DTOs;
using HealthInsuranceMgmtApi.Services.Interfaces;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace HealthInsuranceTesting;

public class PoliciesControllerTests
{
    private readonly Mock<IPolicyService> _mockPolicyService;
    private readonly PoliciesController _controller;

    public PoliciesControllerTests()
    {
        _mockPolicyService = new Mock<IPolicyService>();
        _controller = new PoliciesController(_mockPolicyService.Object);
        
        // Setup user context
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, "1"),
            new Claim(ClaimTypes.Role, "InsuranceAgent")
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);
        
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };
    }

    [Fact]
    public async Task GetAllPolicies_ReturnsOkResult()
    {
        // Arrange
        var policies = new List<PolicyDto>
        {
            new PolicyDto { PolicyNumber = "POL001" },
            new PolicyDto { PolicyNumber = "POL002" }
        };
        _mockPolicyService.Setup(s => s.GetAllPoliciesAsync()).ReturnsAsync(policies);

        // Act
        var result = await _controller.GetAllPolicies();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnValue = Assert.IsType<List<PolicyDto>>(okResult.Value);
        Assert.Equal(2, returnValue.Count);
    }

    [Fact]
    public async Task GetPolicy_ExistingId_ReturnsPolicy()
    {
        // Arrange
        var policy = new PolicyDto { PolicyNumber = "POL001", UserId = 1 };
        _mockPolicyService.Setup(s => s.GetPolicyByIdAsync(1)).ReturnsAsync(policy);

        // Act
        var result = await _controller.GetPolicy(1);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnValue = Assert.IsType<PolicyDto>(okResult.Value);
        Assert.Equal("POL001", returnValue.PolicyNumber);
    }

    [Fact]
    public async Task GetPolicy_NonExistingId_ReturnsNotFound()
    {
        // Arrange
        _mockPolicyService.Setup(s => s.GetPolicyByIdAsync(999)).ReturnsAsync((PolicyDto?)null);

        // Act
        var result = await _controller.GetPolicy(999);

        // Assert
        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task CreatePolicy_ValidData_ReturnsCreatedResult()
    {
        // Arrange
        var createDto = new CreatePolicyDto 
        { 
            UserId = 1, 
            PlanId = 1, 
            StartDate = DateTime.Now
        };
        var createdPolicy = new PolicyDto { PolicyNumber = "POL001", PolicyId = 1 };
        
        _mockPolicyService.Setup(s => s.CreatePolicyAsync(createDto, 1)).ReturnsAsync(createdPolicy);

        // Act
        var result = await _controller.CreatePolicy(createDto);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        Assert.IsType<PolicyDto>(createdResult.Value);
    }

    [Fact]
    public async Task DeletePolicy_ExistingId_ReturnsNoContent()
    {
        // Arrange
        var policy = new PolicyDto { PolicyNumber = "POL001", UserId = 1 };
        _mockPolicyService.Setup(s => s.GetPolicyByIdAsync(1)).ReturnsAsync(policy);
        _mockPolicyService.Setup(s => s.DeletePolicyAsync(1)).ReturnsAsync(true);

        // Act
        var result = await _controller.DeletePolicy(1);

        // Assert
        Assert.IsType<NoContentResult>(result);
    }
}