using System.ComponentModel.DataAnnotations;
using HealthInsuranceMgmtApi.Models;

namespace HealthInsuranceMgmtApi.DTOs;

public class ClaimDto
{
    public int ClaimId { get; set; }
    public string ClaimNumber { get; set; } = string.Empty;
    public int PolicyId { get; set; }
    public string PolicyNumber { get; set; } = string.Empty;
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string HospitalName { get; set; } = string.Empty;
    public decimal ClaimAmount { get; set; }
    public decimal? ApprovedAmount { get; set; }
    public DateTime? TreatmentDate { get; set; }
    public string? MedicalNotes { get; set; }
    public string? Notes { get; set; }
    public ClaimStatus Status { get; set; }
    public DateTime SubmittedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? ReviewerName { get; set; }
    public string? RejectionReason { get; set; }
}

public class CreateClaimDto
{
    [Required]
    public int PolicyId { get; set; }

    [Required]
    public int HospitalId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal ClaimAmount { get; set; }

    [StringLength(2000)]
    public string? Notes { get; set; }
}

public class AddMedicalNotesDto
{
    [Required]
    [StringLength(2000)]
    public string MedicalNotes { get; set; } = string.Empty;
}

public class ReviewClaimDto
{
    [Required]
    public ClaimStatus Status { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? ApprovedAmount { get; set; }

    [StringLength(1000)]
    public string? RejectionReason { get; set; }
}

public class HospitalDto
{
    public int HospitalId { get; set; }
    public string HospitalName { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public bool IsNetworkProvider { get; set; }
}