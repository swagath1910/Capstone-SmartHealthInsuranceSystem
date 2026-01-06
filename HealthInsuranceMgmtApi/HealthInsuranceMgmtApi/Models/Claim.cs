using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HealthInsuranceMgmtApi.Models;

public class Claim
{
    [Key]
    public int ClaimId { get; set; }

    [Required]
    [StringLength(50)]
    public string ClaimNumber { get; set; } = string.Empty;



    [Required]
    public int PolicyId { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    public int HospitalId { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal ClaimAmount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? ApprovedAmount { get; set; }

    public DateTime? TreatmentDate { get; set; }

    [StringLength(2000)]
    public string? MedicalNotes { get; set; }

    [StringLength(2000)]
    public string? Notes { get; set; }

    public ClaimStatus Status { get; set; } = ClaimStatus.Submitted;

    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ReviewedAt { get; set; }

    public DateTime? ProcessedAt { get; set; }

    public int? ReviewedBy { get; set; }

    [StringLength(1000)]
    public string? RejectionReason { get; set; }

    // Navigation Properties
    [ForeignKey("PolicyId")]
    public virtual Policy Policy { get; set; } = null!;

    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;

    [ForeignKey("HospitalId")]
    public virtual Hospital Hospital { get; set; } = null!;

    [ForeignKey("ReviewedBy")]
    public virtual User? Reviewer { get; set; }
}

public enum ClaimStatus
{
    Submitted = 1,    // PolicyHolder submitted, waiting for hospital
    InReview = 2,     // Hospital added notes, ready for claims officer
    Approved = 3,     // Claims officer approved
    Rejected = 4,     // Claims officer rejected
    Paid = 5         // Payment completed
}