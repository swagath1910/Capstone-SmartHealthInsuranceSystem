using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using HealthInsuranceMgmtApi.DTOs;
using HealthInsuranceMgmtApi.Models;
using HealthInsuranceMgmtApi.Services.Interfaces;
using HealthInsuranceMgmtApi.Services;
using HealthInsuranceMgmtApi.Repositories.Interfaces;

namespace HealthInsuranceMgmtApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClaimsController : ControllerBase
{
    private readonly IClaimService _claimService;
    private readonly IUserService _userService;
    private readonly IClaimRepository _claimRepository;

    public ClaimsController(IClaimService claimService, IUserService userService, IClaimRepository claimRepository)
    {
        _claimService = claimService;
        _userService = userService;
        _claimRepository = claimRepository;
    }

    [HttpGet]
    [Authorize(Roles = "ClaimsOfficer")]
    public async Task<ActionResult<IEnumerable<ClaimDto>>> GetAllClaims()
    {
        var claims = await _claimService.GetAllClaimsAsync();
        return Ok(claims);
    }

    [HttpGet("my-claims")]
    [Authorize(Roles = "PolicyHolder")]
    public async Task<ActionResult<IEnumerable<ClaimDto>>> GetMyClaims()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException("User ID not found in token"));
        var claims = await _claimService.GetClaimsByUserIdAsync(userId);
        return Ok(claims);
    }

    [HttpGet("hospital-claims")]
    [Authorize(Roles = "HospitalStaff")]
    public async Task<ActionResult<IEnumerable<ClaimDto>>> GetHospitalClaims()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException("User ID not found in token"));
        var user = await _userService.GetUserByIdAsync(userId);
        
        if (user?.HospitalId == null)
            return BadRequest("User is not associated with a hospital");
            
        var claims = await _claimService.GetHospitalClaimsAsync(user.HospitalId.Value);
        return Ok(claims);
    }

    [HttpPut("{id}/add-medical-notes")]
    [Authorize(Roles = "HospitalStaff")]
    public async Task<ActionResult<ClaimDto>> AddMedicalNotes(int id, [FromBody] AddMedicalNotesDto addMedicalNotesDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException("User ID not found in token"));
        var claim = await _claimService.AddMedicalNotesAsync(id, userId, addMedicalNotesDto);
        
        // Notify Claims Officers about claim ready for review
        var claimsOfficers = await _userService.GetUsersByRoleAsync(UserRole.ClaimsOfficer);
        foreach (var officer in claimsOfficers)
        {
            await NotificationQueue.EnqueueAsync(new NotificationEvent
            {
                UserId = officer.Id,
                Type = NotificationType.ClaimStatusUpdate,
                Title = "Claim Ready for Review",
                Message = $"Claim {claim.ClaimNumber} from {claim.UserName} has medical notes added and is ready for review.",
                ClaimId = claim.ClaimId
            });
        }
        
        return Ok(claim);
    }

    [HttpGet("pending-review")]
    [Authorize(Roles = "ClaimsOfficer")]
    public async Task<ActionResult<IEnumerable<ClaimDto>>> GetClaimsPendingReview()
    {
        var claims = await _claimService.GetClaimsPendingReviewAsync();
        return Ok(claims);
    }

    [HttpPut("{id}/mark-paid")]
    [Consumes("application/json")]
    [Authorize(Roles = "ClaimsOfficer")]
    public async Task<ActionResult<ClaimDto>> MarkAsPaid(int id)
    {
        var claim = await _claimService.MarkAsPaidAsync(id);
        
        // Notify PolicyHolder about payment
        await NotificationQueue.EnqueueAsync(new NotificationEvent
        {
            UserId = claim.UserId,
            Type = NotificationType.ClaimStatusUpdate,
            Title = "Payment Processed",
            Message = $"Payment for claim {claim.ClaimNumber} of ₹{claim.ApprovedAmount:F2} has been processed.",
            ClaimId = claim.ClaimId,
            PolicyId = claim.PolicyId
        });
        
        return Ok(claim);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ClaimDto>> GetClaim(int id)
    {
        var claim = await _claimService.GetClaimByIdAsync(id);
        if (claim == null)
            return NotFound();

        // Check if user can access this claim or not
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? throw new UnauthorizedAccessException("User role not found in token");
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException("User ID not found in token"));

        if (userRole == "PolicyHolder" && claim.UserId != userId)
            return Forbid();

        return Ok(claim);
    }

    [HttpPost]
    [Authorize(Roles = "PolicyHolder")]
    public async Task<ActionResult<ClaimDto>> CreateClaim([FromBody] CreateClaimDto createClaimDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException("User ID not found in token"));
            var claim = await _claimService.CreateClaimAsync(userId, createClaimDto);
            
            // Notify Policy Holder that claim was received
            await NotificationQueue.EnqueueAsync(new NotificationEvent
            {
                UserId = claim.UserId,
                Type = NotificationType.ClaimStatusUpdate,
                Title = "Claim Received",
                Message = $"Your claim {claim.ClaimNumber} has been successfully submitted. We'll review it within 5-7 business days and notify you of the outcome.",
                ClaimId = claim.ClaimId,
                PolicyId = claim.PolicyId
            });
            
            // Notifies Hospital Staff about new claim
            var user = await _userService.GetUserByIdAsync(userId);
            var hospitalStaff = await _userService.GetHospitalStaffAsync(createClaimDto.HospitalId);
            foreach (var staff in hospitalStaff)
            {
                await NotificationQueue.EnqueueAsync(new NotificationEvent
                {
                    UserId = staff.Id,
                    Type = NotificationType.ClaimStatusUpdate,
                    Title = "New Claim Assigned",
                    Message = $"New claim {claim.ClaimNumber} from {claim.UserName} requires medical notes to be added.",
                    ClaimId = claim.ClaimId
                });
            }
            
            return CreatedAtAction(nameof(GetClaim), new { id = claim.ClaimId }, claim);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}/review")]
    [Authorize(Roles = "ClaimsOfficer")]
    public async Task<ActionResult<ClaimDto>> ReviewClaim(int id, [FromBody] ReviewClaimDto reviewClaimDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // here i used additional checking to ensure claim is in correct status for review
        var claim = await _claimService.GetClaimByIdAsync(id);
        if (claim == null)
            return NotFound("Claim not found");
            
        if (claim.Status != ClaimStatus.InReview)
            return BadRequest("Claims can only be reviewed when they are in 'InReview' status");
            
        if (string.IsNullOrEmpty(claim.MedicalNotes))
            return BadRequest("Claims can only be reviewed after medical notes have been added");

        var reviewerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException("User ID not found in token"));
        var updatedClaim = await _claimService.ReviewClaimAsync(id, reviewerId, reviewClaimDto);
        
        // Sends claim status update notification to policy holder
        var statusMessage = updatedClaim.Status switch
        {
            ClaimStatus.Approved => $"Great news! Your claim {updatedClaim.ClaimNumber} has been approved for ₹{updatedClaim.ApprovedAmount:F2}.",
            ClaimStatus.Rejected => $"Your claim {updatedClaim.ClaimNumber} has been rejected. Reason: {updatedClaim.RejectionReason}",
            ClaimStatus.InReview => $"Your claim {updatedClaim.ClaimNumber} is now under review. Expected processing time: 5-7 business days.",
            ClaimStatus.Paid => $"Payment complete! Your claim {updatedClaim.ClaimNumber} payment of ₹{updatedClaim.ApprovedAmount:F2} has been processed.",
            _ => $"Your claim {updatedClaim.ClaimNumber} status has been updated to {updatedClaim.Status}."
        };

        await NotificationQueue.EnqueueAsync(new NotificationEvent
        {
            UserId = updatedClaim.UserId,
            Type = NotificationType.ClaimStatusUpdate,
            Title = "Claim Status Updated",
            Message = statusMessage,
            ClaimId = updatedClaim.ClaimId,
            PolicyId = updatedClaim.PolicyId
        });
        
        // Notifies  Claims Officer about the completion of claim
        var officerMessage = updatedClaim.Status switch
        {
            ClaimStatus.Approved => $"Claim processed: You have approved claim {updatedClaim.ClaimNumber} for ₹{updatedClaim.ApprovedAmount:F2}.",
            ClaimStatus.Rejected => $"Rejection completed: Claim {updatedClaim.ClaimNumber} has been rejected.",
            ClaimStatus.InReview => $"Claim marked for review: Claim {updatedClaim.ClaimNumber} is now under review.",
            ClaimStatus.Paid => $"Payment processed: Claim {updatedClaim.ClaimNumber} has been marked as paid.",
            _ => $"Claim {updatedClaim.ClaimNumber} status updated to {updatedClaim.Status}."
        };
        
        var officerTitle = updatedClaim.Status switch
        {
            ClaimStatus.Approved => "Claim Processed",
            ClaimStatus.Rejected => "Rejection Completed",
            ClaimStatus.InReview => "Claim Under Review",
            ClaimStatus.Paid => "Payment Processed",
            _ => "Claim Status Updated"
        };
        
        await NotificationQueue.EnqueueAsync(new NotificationEvent
        {
            UserId = reviewerId,
            Type = NotificationType.ClaimStatusUpdate,
            Title = officerTitle,
            Message = officerMessage,
            ClaimId = updatedClaim.ClaimId,
            PolicyId = updatedClaim.PolicyId
        });
        
        return Ok(updatedClaim);
    }

    [HttpDelete("by-policy/{policyId}")]
    [Consumes("application/json")]
    public async Task<ActionResult> DeleteByPolicyId(int policyId)
    {
        try
        {
            var claims = await _claimRepository.GetByPolicyIdAsync(policyId);
            foreach (var claim in claims)
            {
                await _claimRepository.DeleteAsync(claim);
            }
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Error deleting claims");
        }
    }
}
