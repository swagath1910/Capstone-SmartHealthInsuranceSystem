using System.ComponentModel.DataAnnotations;
using HealthInsuranceMgmtApi.Models;

namespace HealthInsuranceMgmtApi.DTOs;

public class InsurancePlanDto
{
    public int PlanId { get; set; }
    public string PlanName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal PremiumAmount { get; set; }
    public decimal CoverageLimit { get; set; }
    public int DurationInMonths { get; set; }
    public decimal DeductiblePercentage { get; set; }
    public PlanType PlanType { get; set; }
    public bool IsActive { get; set; }
}

public class CreateInsurancePlanDto
{
    [Required]
    [StringLength(200)]
    public string PlanName { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal PremiumAmount { get; set; }

    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal CoverageLimit { get; set; }

    [Required]
    [Range(1, 120)]
    public int DurationInMonths { get; set; }

    [Range(0, 100)]
    public decimal DeductiblePercentage { get; set; }

    [Required]
    public PlanType PlanType { get; set; }

    public bool IsActive { get; set; } = true;
}

public class PolicyDto
{
    public int PolicyId { get; set; }
    public string PolicyNumber { get; set; } = string.Empty;
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? UserEmail { get; set; }
    public int PlanId { get; set; }
    public string PlanName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal PremiumPaid { get; set; }
    public decimal RemainingCoverage { get; set; }
    public DateTime? LastPremiumPaymentDate { get; set; }
    public decimal? CoverageLimit { get; set; }
    public PolicyStatus Status { get; set; }
    public bool AutoRenew { get; set; }
    public DateTime? RenewedOn { get; set; }
}

public class CreatePolicyDto
{
    [Required]
    public int UserId { get; set; }

    [Required]
    public int PlanId { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal PremiumPaid { get; set; }

    public bool AutoRenew { get; set; } = false;
    
    public PolicyStatus? Status { get; set; }
}