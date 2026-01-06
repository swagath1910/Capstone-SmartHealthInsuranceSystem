using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace HealthInsuranceMgmtApi.Models;

public class User : IdentityUser<int>
{
    [Required]
    [StringLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string LastName { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Address { get; set; }

    [Required]
    public DateTime DateOfBirth { get; set; }

    [Required]
    public UserRole Role { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // Foreign Keys
    public int? HospitalId { get; set; }

    // Navigation Properties
    public virtual Hospital? Hospital { get; set; }
    public virtual ICollection<Policy> Policies { get; set; } = new List<Policy>();
    public virtual ICollection<Claim> Claims { get; set; } = new List<Claim>();
}

public enum UserRole
{
    Admin = 1,
    InsuranceAgent = 2,
    ClaimsOfficer = 3,
    HospitalStaff = 4,
    PolicyHolder = 5
}