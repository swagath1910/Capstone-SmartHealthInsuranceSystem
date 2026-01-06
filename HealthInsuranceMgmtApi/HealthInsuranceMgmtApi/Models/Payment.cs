using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HealthInsuranceMgmtApi.Models;

public class Payment
{
    [Key]
    public int PaymentId { get; set; }

    [Required]
    [StringLength(50)]
    public string PaymentReference { get; set; } = string.Empty;

    public int? PolicyId { get; set; }

    public int? ClaimId { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required]
    public PaymentType PaymentType { get; set; }

    [Required]
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

    [Required]
    public DateTime PaymentDate { get; set; }

    [StringLength(100)]
    public string? PaymentMethod { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    [ForeignKey("PolicyId")]
    public virtual Policy? Policy { get; set; }

    [ForeignKey("ClaimId")]
    public virtual Claim? Claim { get; set; }
}

public enum PaymentType
{
    Premium = 1,
    ClaimPayout = 2
}

public enum PaymentStatus
{
    Pending = 1,
    Completed = 2,
    Failed = 3,
    Cancelled = 4
}