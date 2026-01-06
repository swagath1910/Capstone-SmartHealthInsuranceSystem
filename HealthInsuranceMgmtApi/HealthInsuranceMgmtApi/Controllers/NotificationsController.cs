using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using HealthInsuranceMgmtApi.Data;
using HealthInsuranceMgmtApi.Repositories.Interfaces;

namespace HealthInsuranceMgmtApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly HealthInsuranceDbContext _context;
    private readonly INotificationHistoryRepository _notificationRepository;
    private readonly ILogger<NotificationsController> _logger;

    public NotificationsController(
        HealthInsuranceDbContext context,
        INotificationHistoryRepository notificationRepository,
        ILogger<NotificationsController> logger)
    {
        _context = context;
        _notificationRepository = notificationRepository;
        _logger = logger;
    }

    [HttpGet("my-notifications")]
    public async Task<ActionResult<IEnumerable<object>>> GetMyNotifications()
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? 
                throw new UnauthorizedAccessException("User ID not found"));

            var notifications = await _context.NotificationHistories
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Take(50)
                .Select(n => new
                {
                    n.NotificationId,
                    n.Type,
                    n.Title,
                    n.Message,
                    n.IsRead,
                    n.CreatedAt,
                    n.PolicyId,
                    n.ClaimId
                })
                .ToListAsync();

            return Ok(notifications);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching notifications");
            return StatusCode(500, "Error fetching notifications");
        }
    }

    [HttpPut("{id}/mark-read")]
    [Consumes("application/json")]
    public async Task<ActionResult> MarkAsRead(int id)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? 
                throw new UnauthorizedAccessException("User ID not found"));

            var notification = await _context.NotificationHistories
                .FirstOrDefaultAsync(n => n.NotificationId == id && n.UserId == userId);

            if (notification == null)
                return NotFound();

            notification.IsRead = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking notification as read");
            return StatusCode(500, "Error updating notification");
        }
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult<int>> GetUnreadCount()
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? 
                throw new UnauthorizedAccessException("User ID not found"));

            var count = await _context.NotificationHistories
                .CountAsync(n => n.UserId == userId && !n.IsRead);

            return Ok(count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching unread count");
            return StatusCode(500, "Error fetching unread count");
        }
    }

    [HttpDelete("by-policy/{policyId}")]
    [Consumes("application/json")]
    public async Task<ActionResult> DeleteByPolicyId(int policyId)
    {
        try
        {
            var notifications = await _notificationRepository.GetByPolicyIdAsync(policyId);
            foreach (var notification in notifications)
            {
                await _notificationRepository.DeleteAsync(notification);
            }
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting notifications by policy ID");
            return StatusCode(500, "Error deleting notifications");
        }
    }
}