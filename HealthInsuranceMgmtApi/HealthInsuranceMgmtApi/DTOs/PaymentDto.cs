using System.ComponentModel.DataAnnotations;
using HealthInsuranceMgmtApi.Models;

namespace HealthInsuranceMgmtApi.DTOs;

public class PaymentDto
{
    public int PaymentId { get; set; }
    public string PaymentReference { get; set; } = string.Empty;
    public int? PolicyId { get; set; }
    public string? PolicyNumber { get; set; }
    public int? ClaimId { get; set; }
    public string? ClaimNumber { get; set; }
    public decimal Amount { get; set; }
    public PaymentType PaymentType { get; set; }
    public PaymentStatus Status { get; set; }
    public DateTime PaymentDate { get; set; }
    public string? PaymentMethod { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreatePaymentDto
{
    [Required]
    public int? PolicyId { get; set; }

    public int? ClaimId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Amount { get; set; }

    [Required]
    public PaymentType PaymentType { get; set; }

    [Required]
    public DateTime PaymentDate { get; set; }

    [StringLength(100)]
    public string? PaymentMethod { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }
}

public class ProcessPaymentDto
{
    [Required]
    public int PolicyId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Amount { get; set; }

    [Required]
    [StringLength(100)]
    public string PaymentMethod { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Notes { get; set; }
}