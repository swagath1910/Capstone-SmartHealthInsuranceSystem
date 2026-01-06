using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HealthInsuranceMgmtApi.DTOs;
using HealthInsuranceMgmtApi.Models;
using HealthInsuranceMgmtApi.Services.Interfaces;

namespace HealthInsuranceMgmtApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,InsuranceAgent")]
    public async Task<ActionResult<IEnumerable<UserListDto>>> GetAllUsers()
    {
        var users = await _userService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpGet("role/{role}")]
    [Authorize(Roles = "Admin,HospitalProvider")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsersByRole(UserRole role)
    {
        var users = await _userService.GetUsersByRoleAsync(role);
        return Ok(users);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,InsuranceAgent")]
    public async Task<ActionResult<UserDto>> GetUser(int id)
    {
        var user = await _userService.GetUserByIdAsync(id);
        if (user == null)
            return NotFound();

        return Ok(user);
    }
    // At first i followed a different claims workflow and policy enrollment in that i used this after i didnt used
    [HttpGet("search-by-email/{email}")]
    [AllowAnonymous]
    [Authorize] 
    public async Task<ActionResult<UserDto>> SearchUserByEmail(string email)
    {
        var user = await _userService.GetUserByEmailAsync(email);
        if (user == null)
            return NotFound(new { message = "User not found" });

        return Ok(user);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,InsuranceAgent")]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserDto createUserDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var user = await _userService.CreateUserAsync(createUserDto);
            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserDto>> UpdateUser(int id, [FromBody] UpdateUserDto updateUserDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var user = await _userService.UpdateUserAsync(id, updateUserDto);
        return Ok(user);
    }

    [HttpPut("{id}/deactivate")]
    [Consumes("application/json")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeactivateUser(int id)
    {
        var result = await _userService.DeactivateUserAsync(id);
        if (!result)
            return NotFound();

        return Ok(new { message = "User deactivated successfully" });
    }

    [HttpPut("{id}/activate")]
    [Consumes("application/json")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> ActivateUser(int id)
    {
        var result = await _userService.ActivateUserAsync(id);
        if (!result)
            return NotFound();

        return Ok(new { message = "User activated successfully" });
    }

    [HttpPut("{id}/role")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> UpdateUserRole(int id, [FromBody] UpdateUserRoleDto updateRoleDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _userService.UpdateUserRoleAsync(id, updateRoleDto.Role);
        if (!result)
            return NotFound();

        return Ok(new { message = "User role updated successfully" });
    }

    [HttpDelete("{id}")]
    [Consumes("application/json")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteUser(int id)
    {
        var result = await _userService.DeleteUserAsync(id);
        if (!result)
            return NotFound();

        return Ok(new { message = "User deleted successfully" });
    }
}
