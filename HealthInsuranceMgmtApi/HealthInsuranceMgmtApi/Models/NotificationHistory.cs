using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HealthInsuranceMgmtApi.Models;

public class NotificationHistory
{
    [Key]
    public int NotificationId { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    public NotificationType Type { get; set; }

    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(500)]
    public string Message { get; set; } = string.Empty;

    public int? PolicyId { get; set; }

    public int? ClaimId { get; set; }

    public bool IsRead { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;

    [ForeignKey("PolicyId")]
    public virtual Policy? Policy { get; set; }

    [ForeignKey("ClaimId")]
    public virtual Claim? Claim { get; set; }
}

public enum NotificationType
{
    PolicyEnrollment = 1,
    PolicyRenewal = 2,
    ClaimStatusUpdate = 3
}

public class NotificationEvent
{
    public int UserId { get; set; }
    public NotificationType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int? PolicyId { get; set; }
    public int? ClaimId { get; set; }
}