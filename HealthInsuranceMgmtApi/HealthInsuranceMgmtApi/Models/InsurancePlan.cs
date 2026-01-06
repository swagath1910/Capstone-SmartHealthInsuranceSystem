using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HealthInsuranceMgmtApi.Models;

public class InsurancePlan
{
    [Key]
    public int PlanId { get; set; }

    [Required]
    [StringLength(200)]
    public string PlanName { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal PremiumAmount { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal CoverageLimit { get; set; }

    [Required]
    public int DurationInMonths { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal DeductiblePercentage { get; set; }

    public PlanType PlanType { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // Navigation Properties
    public virtual ICollection<Policy> Policies { get; set; } = new List<Policy>();
}

public enum PlanType
{
    Individual = 1,
    Family = 2,
    Corporate = 3
}