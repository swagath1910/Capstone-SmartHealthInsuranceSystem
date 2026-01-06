using AutoMapper;
using HealthInsuranceMgmtApi.DTOs;
using HealthInsuranceMgmtApi.Models;
using HealthInsuranceMgmtApi.Repositories.Interfaces;
using HealthInsuranceMgmtApi.Services.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace HealthInsuranceMgmtApi.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IPolicyRepository _policyRepository;
    private readonly IClaimRepository _claimRepository;
    private readonly UserManager<User> _userManager;
    private readonly IMapper _mapper;

    public UserService(
        IUserRepository userRepository,
        IPolicyRepository policyRepository,
        IClaimRepository claimRepository,
        UserManager<User> userManager,
        IMapper mapper)
    {
        _userRepository = userRepository;
        _policyRepository = policyRepository;
        _claimRepository = claimRepository;
        _userManager = userManager;
        _mapper = mapper;
    }

    public async Task<UserDto> CreateUserAsync(CreateUserDto createUserDto)
    {
        // Check if email already exists
        var existingUser = await _userRepository.GetByEmailAsync(createUserDto.Email);
        if (existingUser != null)
            throw new InvalidOperationException("Email is already taken");

        // Validate hospital assignment for Hospital Staff role
        if (createUserDto.Role == UserRole.HospitalStaff && !createUserDto.HospitalId.HasValue)
            throw new ArgumentException("Hospital Staff must be assigned to a hospital");

        var user = _mapper.Map<User>(createUserDto);
        user.UserName = createUserDto.Email;
        user.CreatedAt = DateTime.UtcNow;

        var result = await _userManager.CreateAsync(user, createUserDto.Password);
        if (!result.Succeeded)
            throw new InvalidOperationException($"Failed to create user: {string.Join(", ", result.Errors.Select(e => e.Description))}");

        return _mapper.Map<UserDto>(user);
    }

    public async Task<IEnumerable<UserListDto>> GetAllUsersAsync()
    {
        var users = await _userRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<UserListDto>>(users.OrderByDescending(u => u.CreatedAt));
    }

    public async Task<IEnumerable<UserDto>> GetUsersByRoleAsync(UserRole role)
    {
        var users = await _userRepository.GetByRoleAsync(role);
        return _mapper.Map<IEnumerable<UserDto>>(users.OrderBy(u => u.FirstName));
    }

    public async Task<IEnumerable<UserDto>> GetHospitalStaffAsync(int hospitalId)
    {
        var users = await _userRepository.GetHospitalStaffAsync(hospitalId);
        return _mapper.Map<IEnumerable<UserDto>>(users.OrderBy(u => u.FirstName));
    }

    public async Task<UserDto?> GetUserByIdAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        return user != null ? _mapper.Map<UserDto>(user) : null;
    }

    public async Task<UserDto?> GetUserByEmailAsync(string email)
    {
        var user = await _userRepository.GetByEmailAsync(email);
        return user != null ? _mapper.Map<UserDto>(user) : null;
    }

    public async Task<UserDto> UpdateUserAsync(int userId, UpdateUserDto updateUserDto)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new ArgumentException("User not found");

        // Check if email is already taken by another user
        var existingUser = await _userRepository.GetByEmailAsync(updateUserDto.Email);
        if (existingUser != null && existingUser.Id != userId)
            throw new InvalidOperationException("Email is already taken by another user");

        _mapper.Map(updateUserDto, user);
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);
        return _mapper.Map<UserDto>(user);
    }

    public async Task<bool> DeactivateUserAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return false;

        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);
        return true;
    }

    public async Task<bool> ActivateUserAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return false;

        user.IsActive = true;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);
        return true;
    }

    public async Task<bool> UpdateUserRoleAsync(int userId, UserRole role)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return false;

        user.Role = role;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);
        return true;
    }

    public async Task<bool> DeleteUserAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return false;

        // Check if user has active policies or claims
        var policies = await _policyRepository.GetByUserIdAsync(userId);
        var claims = await _claimRepository.GetByUserIdAsync(userId);

        if (policies.Any(p => p.Status == PolicyStatus.Active))
            throw new InvalidOperationException("Cannot delete user with active policies");

        if (claims.Any(c => c.Status == ClaimStatus.Submitted || c.Status == ClaimStatus.InReview))
            throw new InvalidOperationException("Cannot delete user with pending claims");

        await _userRepository.DeleteAsync(user);
        return true;
    }
}
