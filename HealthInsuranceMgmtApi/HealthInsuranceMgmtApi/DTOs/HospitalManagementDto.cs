using System.ComponentModel.DataAnnotations;

namespace HealthInsuranceMgmtApi.DTOs;

public class CreateHospitalDto
{
    [Required]
    [StringLength(200)]
    public string HospitalName { get; set; } = string.Empty;

    [Required]
    [StringLength(500)]
    public string Address { get; set; } = string.Empty;

    [Required]
    [StringLength(15)]
    public string PhoneNumber { get; set; } = string.Empty;

    [StringLength(255)]
    [EmailAddress]
    public string? Email { get; set; }

    [StringLength(100)]
    public string? City { get; set; }

    [StringLength(100)]
    public string? State { get; set; }

    [StringLength(10)]
    public string? ZipCode { get; set; }

    public bool IsNetworkProvider { get; set; } = true;
}

public class UpdateHospitalDto
{
    [Required]
    [StringLength(200)]
    public string HospitalName { get; set; } = string.Empty;

    [Required]
    [StringLength(500)]
    public string Address { get; set; } = string.Empty;

    [Required]
    [StringLength(15)]
    public string PhoneNumber { get; set; } = string.Empty;

    [StringLength(255)]
    [EmailAddress]
    public string? Email { get; set; }

    [StringLength(100)]
    public string? City { get; set; }

    [StringLength(100)]
    public string? State { get; set; }

    [StringLength(10)]
    public string? ZipCode { get; set; }

    public bool IsNetworkProvider { get; set; } = true;
}