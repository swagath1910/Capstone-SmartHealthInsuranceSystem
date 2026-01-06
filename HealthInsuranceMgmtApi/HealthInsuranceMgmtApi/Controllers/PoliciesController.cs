using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using HealthInsuranceMgmtApi.DTOs;
using HealthInsuranceMgmtApi.Models;
using HealthInsuranceMgmtApi.Services.Interfaces;
using HealthInsuranceMgmtApi.Services;

namespace HealthInsuranceMgmtApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PoliciesController : ControllerBase
{
    private readonly IPolicyService _policyService;

    public PoliciesController(IPolicyService policyService)
    {
        _policyService = policyService;
    }

    [HttpGet]
    [Authorize(Roles = "InsuranceAgent,ClaimsOfficer")]
    public async Task<ActionResult<IEnumerable<PolicyDto>>> GetAllPolicies()
    {
        var policies = await _policyService.GetAllPoliciesAsync();
        return Ok(policies);
    }

    [HttpGet("paged")]
    [Authorize(Roles = "InsuranceAgent,ClaimsOfficer")]
    public async Task<ActionResult<object>> GetPagedPolicies(
        [FromQuery] int pageNumber = 1, 
        [FromQuery] int pageSize = 10, 
        [FromQuery] string? sortBy = null, 
        [FromQuery] bool ascending = true)
    {
        var pagedPolicies = await _policyService.GetPagedPoliciesAsync(pageNumber, pageSize, sortBy, ascending);
        return Ok(pagedPolicies);
    }

    [HttpGet("my-policies")]
    [Authorize(Roles = "PolicyHolder")]
    public async Task<ActionResult<IEnumerable<PolicyDto>>> GetMyPolicies()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException("User ID not found in token"));
        var policies = await _policyService.GetPoliciesByUserIdAsync(userId);
        return Ok(policies);
    }

    [HttpGet("user/{userId}")]
    [Authorize(Roles = "InsuranceAgent,ClaimsOfficer")]
    public async Task<ActionResult<IEnumerable<PolicyDto>>> GetPoliciesByUserId(int userId)
    {
        var policies = await _policyService.GetPoliciesByUserIdAsync(userId);
        return Ok(policies);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PolicyDto>> GetPolicy(int id)
    {
        var policy = await _policyService.GetPolicyByIdAsync(id);
        if (policy == null)
            return NotFound();

        // Check if user can access this policy or not
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? throw new UnauthorizedAccessException("User role not found in token");
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException("User ID not found in token"));

        if (userRole == "PolicyHolder" && policy.UserId != userId)
            return Forbid();

        return Ok(policy);
    }

    [HttpPost]
    [Authorize(Roles = "InsuranceAgent")]
    public async Task<ActionResult<PolicyDto>> CreatePolicy([FromBody] CreatePolicyDto createPolicyDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException("User ID not found in token"));
            var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value ?? throw new UnauthorizedAccessException("User role not found in token");

            var policy = await _policyService.CreatePolicyAsync(createPolicyDto, currentUserId);
            
            // Role-specific  notifications for policy holder
            var notifications = new Dictionary<string, (string title, string message)>
            {
                ["Admin"] = (
                    "Policy Created by Administration", 
                    $"Your policy {policy.PolicyNumber} has been set up by our administrative team. All benefits are now active."
                ),
                ["InsuranceAgent"] = (
                    "Policy Enrollment Complete", 
                    $"Your policy {policy.PolicyNumber} has been enrolled by your dedicated insurance agent. Coverage is now effective."
                )
            };

            var (title, message) = notifications[currentUserRole];
            
            // Notify the policy holder
            await NotificationQueue.EnqueueAsync(new NotificationEvent
            {
                UserId = policy.UserId,
                Type = NotificationType.PolicyEnrollment,
                Title = title,
                Message = message,
                PolicyId = policy.PolicyId
            });

            // Notify the Admin or Insurance Agent first i thought that admin can also able to create policy so added notification for admin as well
            if (currentUserId != policy.UserId)
            {
                var creatorNotifications = new Dictionary<string, (string title, string message)>
                {
                    ["Admin"] = (
                        "Policy Created Successfully",
                        $"You have successfully created policy {policy.PolicyNumber} for {policy.UserName}."
                    ),
                    ["InsuranceAgent"] = (
                        "Commission Earned",
                        $"Congratulations! You have successfully enrolled {policy.UserName} in policy {policy.PolicyNumber}. Your commission will be processed."
                    )
                };

                var (creatorTitle, creatorMessage) = creatorNotifications[currentUserRole];
                
                await NotificationQueue.EnqueueAsync(new NotificationEvent
                {
                    UserId = currentUserId,
                    Type = NotificationType.PolicyEnrollment,
                    Title = creatorTitle,
                    Message = creatorMessage,
                    PolicyId = policy.PolicyId
                });
            }

            return CreatedAtAction(nameof(GetPolicy), new { id = policy.PolicyId }, policy);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "InsuranceAgent")]
    public async Task<ActionResult<PolicyDto>> UpdatePolicy(int id, [FromBody] CreatePolicyDto updatePolicyDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var policy = await _policyService.UpdatePolicyAsync(id, updatePolicyDto);
        return Ok(policy);
    }

    [HttpPut("{id}/renew")]
    [Consumes("application/json")]
    [Authorize(Roles = "InsuranceAgent")]
    public async Task<ActionResult<PolicyDto>> RenewPolicy(int id)
    {
        var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException("User ID not found in token"));
        var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value ?? throw new UnauthorizedAccessException("User role not found in token");
        
        var policy = await _policyService.RenewPolicyAsync(id);
        
        // Sends policy renewal notification to Policy Holder
        await NotificationQueue.EnqueueAsync(new NotificationEvent
        {
            UserId = policy.UserId,
            Type = NotificationType.PolicyRenewal,
            Title = "Renewal Confirmed",
            Message = $"Your policy {policy.PolicyNumber} has been renewed until {policy.EndDate:MMM dd, yyyy}. Your coverage continues without interruption.",
            PolicyId = policy.PolicyId
        });
        
        // Sends commission notification to Insurance Agent
        if (currentUserRole == "InsuranceAgent" && currentUserId != policy.UserId)
        {
            await NotificationQueue.EnqueueAsync(new NotificationEvent
            {
                UserId = currentUserId,
                Type = NotificationType.PolicyRenewal,
                Title = "Renewal Commission",
                Message = $"You have successfully renewed policy {policy.PolicyNumber} for {policy.UserName}. Your renewal commission will be processed.",
                PolicyId = policy.PolicyId
            });
        }

        return Ok(policy);
    }

    [HttpDelete("{id}")]
    [Consumes("application/json")]
    public async Task<ActionResult> DeletePolicy(int id)
    {
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? throw new UnauthorizedAccessException("User role not found in token");
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException("User ID not found in token"));

        // Get the policy first
        var policy = await _policyService.GetPolicyByIdAsync(id);
        if (policy == null)
            return NotFound();

        // Authorization check: PolicyHolders can only delete their own policies, InsuranceAgents can delete any i didnt implemented this as there are more chances of errors and policy can be kept status as expired rather than deleting
        if (userRole == "PolicyHolder" && policy.UserId != userId)
            return Forbid();
        
        if (userRole != "PolicyHolder" && userRole != "InsuranceAgent")
            return Forbid();

        var result = await _policyService.DeletePolicyAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }
}
