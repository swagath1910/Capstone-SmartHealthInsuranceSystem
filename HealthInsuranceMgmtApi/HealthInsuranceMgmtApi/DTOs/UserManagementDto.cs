using System.ComponentModel.DataAnnotations;
using HealthInsuranceMgmtApi.Models;

namespace HealthInsuranceMgmtApi.DTOs;

public class UpdateUserDto
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

    public bool IsActive { get; set; } = true;
}

public class UserListDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public int PolicyCount { get; set; }
    public int ClaimCount { get; set; }
    public int? HospitalId { get; set; }
    public string? HospitalName { get; set; }
}