using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HealthInsuranceMgmtApi.Models;

public class Policy
{
    [Key]
    public int PolicyId { get; set; }

    [Required]
    [StringLength(50)]
    public string PolicyNumber { get; set; } = string.Empty;

    [Required]
    public int UserId { get; set; }

    [Required]
    public int PlanId { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal PremiumPaid { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal RemainingCoverage { get; set; }

    public DateTime? LastPremiumPaymentDate { get; set; }

    public PolicyStatus Status { get; set; } = PolicyStatus.Active;

    public bool AutoRenew { get; set; } = false;

    public DateTime? RenewedOn { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public int? CreatedByUserId { get; set; }

    // Navigation Properties
    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;

    [ForeignKey("PlanId")]
    public virtual InsurancePlan InsurancePlan { get; set; } = null!;

    [ForeignKey("CreatedByUserId")]
    public virtual User? CreatedByUser { get; set; }

    public virtual ICollection<Claim> Claims { get; set; } = new List<Claim>();
    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
}

public enum PolicyStatus
{
    Active = 1,
    Expired = 2,
    Suspended = 3,
    Cancelled = 4
}