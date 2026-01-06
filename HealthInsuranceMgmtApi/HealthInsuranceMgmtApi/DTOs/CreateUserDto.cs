using System.ComponentModel.DataAnnotations;
using HealthInsuranceMgmtApi.Models;

namespace HealthInsuranceMgmtApi.DTOs;

public class CreateUserDto
{
    [Required]
    [StringLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PhoneNumber { get; set; } = string.Empty;

    public string? Address { get; set; }

    [Required]
    public DateTime DateOfBirth { get; set; }

    [Required]
    public UserRole Role { get; set; }

    public int? HospitalId { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 6)]
    public string Password { get; set; } = string.Empty;
}