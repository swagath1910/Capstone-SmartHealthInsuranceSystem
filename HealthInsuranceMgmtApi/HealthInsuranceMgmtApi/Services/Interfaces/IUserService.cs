using HealthInsuranceMgmtApi.DTOs;
using HealthInsuranceMgmtApi.Models;

namespace HealthInsuranceMgmtApi.Services.Interfaces;

public interface IUserService
{
    Task<IEnumerable<UserListDto>> GetAllUsersAsync();
    Task<IEnumerable<UserDto>> GetUsersByRoleAsync(UserRole role);
    Task<IEnumerable<UserDto>> GetHospitalStaffAsync(int hospitalId);
    Task<UserDto?> GetUserByIdAsync(int userId);
    Task<UserDto?> GetUserByEmailAsync(string email);
    Task<UserDto> CreateUserAsync(CreateUserDto createUserDto);
    Task<UserDto> UpdateUserAsync(int userId, UpdateUserDto updateUserDto);
    Task<bool> UpdateUserRoleAsync(int userId, UserRole role);
    Task<bool> DeactivateUserAsync(int userId);
    Task<bool> ActivateUserAsync(int userId);
    Task<bool> DeleteUserAsync(int userId);
}
