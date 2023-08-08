using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace API.Controllers;

public class AdminController : BaseApiController
{
    private readonly UserManager<AppUser> _userManager;

    public AdminController(UserManager<AppUser> userManager)
    {
        _userManager = userManager;
    }

    [Authorize(Policy = "RequireAdminRole")]
    [HttpGet("users-with-roles")]
    public async Task<ActionResult> GetUsersWithRoles()
    {
        var users = await _userManager.Users
            .OrderBy(u => u.UserName)
            .Select(u => new
            {
                u.Id, u.UserName,
                Roles = u.AppUserRoles.Select(r => r.AppRole.Name).ToList()
            })
            .ToListAsync();

        return Ok(users);
    }

    [Authorize(Policy = "RequireAdminRole")]
    [HttpPost("edit-roles/{userId}")]
    public async Task<ActionResult> EditRoles(int userId, [FromQuery] string roles)
    {
        if (string.IsNullOrEmpty(roles)) return BadRequest("select at least one role");

        var selectedRolesArr = roles.Split(",").ToArray();
        var user = await _userManager.FindByIdAsync(userId.ToString());

        if (user == null) return NotFound();

        var userRoles = await _userManager.GetRolesAsync(user);
        var result = await _userManager.AddToRolesAsync(user, selectedRolesArr.Except(userRoles));

        if (!result.Succeeded) return BadRequest("failed to add roles");
        result = await _userManager.RemoveFromRolesAsync(user, userRoles.Except(selectedRolesArr));

        if (!result.Succeeded) return BadRequest("failed to remove from roles");

        return Ok(await _userManager.GetRolesAsync(user));
    }

    [Authorize(Policy = "ModeratePhotoRole")]
    [HttpGet("photos-to-moderate")]
    public async Task<ActionResult> GetPhotosForModeration()
    {
        return Ok("Eshta!!!!");
    }
}