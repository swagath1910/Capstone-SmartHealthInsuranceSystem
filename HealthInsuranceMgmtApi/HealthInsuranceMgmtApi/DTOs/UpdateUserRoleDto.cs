using System.ComponentModel.DataAnnotations;
using HealthInsuranceMgmtApi.Models;

namespace HealthInsuranceMgmtApi.DTOs;

public class UpdateUserRoleDto
{
    [Required]
    public UserRole Role { get; set; }
}