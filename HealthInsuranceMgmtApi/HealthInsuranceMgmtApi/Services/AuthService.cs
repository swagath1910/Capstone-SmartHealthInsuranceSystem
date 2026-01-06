using AutoMapper;
using Microsoft.AspNetCore.Identity;
using HealthInsuranceMgmtApi.Helpers;
using HealthInsuranceMgmtApi.DTOs;
using HealthInsuranceMgmtApi.Models;
using HealthInsuranceMgmtApi.Services.Interfaces;

namespace HealthInsuranceMgmtApi.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<User> _userManager;
    private readonly IMapper _mapper;
    private readonly JwtHelper _jwtHelper;

    public AuthService(UserManager<User> userManager, IMapper mapper, JwtHelper jwtHelper)
    {
        _userManager = userManager;
        _mapper = mapper;
        _jwtHelper = jwtHelper;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
    {
        try
        {
            // Validate input
            if (string.IsNullOrEmpty(loginDto.Email) || string.IsNullOrEmpty(loginDto.Password))
                return null;

            var user = await _userManager.FindByEmailAsync(loginDto.Email);
            
            // Check if user exists and is active
            if (user == null || !user.IsActive)
                return null;

            var isPasswordValid = await _userManager.CheckPasswordAsync(user, loginDto.Password);
            if (!isPasswordValid)
                return null;

            var token = _jwtHelper.GenerateToken(user);
            var userDto = _mapper.Map<UserDto>(user);

            return new AuthResponseDto
            {
                Token = token,
                User = userDto
            };
        }
        catch (Exception)
        {
            // Log exception if needed, but don't expose details
            return null;
        }
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
    {
        var existingUser = await _userManager.FindByEmailAsync(registerDto.Email);
        if (existingUser != null)
            throw new InvalidOperationException("User with this email already exists");

        var user = _mapper.Map<User>(registerDto);
        user.UserName = registerDto.Email;
        user.Email = registerDto.Email;
        user.Role = UserRole.PolicyHolder;
        user.EmailConfirmed = true;
        user.CreatedAt = DateTime.UtcNow;

        var result = await _userManager.CreateAsync(user, registerDto.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Failed to create user: {errors}");
        }

        var token = _jwtHelper.GenerateToken(user);
        var userDto = _mapper.Map<UserDto>(user);

        return new AuthResponseDto
        {
            Token = token,
            User = userDto
        };
    }

    public async Task<UserDto?> GetUserByIdAsync(int userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        return user != null ? _mapper.Map<UserDto>(user) : null;
    }
}
