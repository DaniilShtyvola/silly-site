using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

[ApiController]
[Route("me")]
public class UserController : ControllerBase
{
    private readonly MainDbContext _context;

    public UserController(MainDbContext context)
    {
        _context = context;
    }

    private string? GetUserNameFromToken(string token)
    {
        try
        {
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);
            return jwtToken.Claims.FirstOrDefault(c => c.Type == "userName")?.Value;
        }
        catch
        {
            return null;
        }
    }

    private string? GetUserNameFromClaims()
    {
        return User.Claims.FirstOrDefault(c => c.Type == "userName")?.Value;
    }

    [HttpGet("style")]
    public IActionResult GetUserStyle([FromHeader] string token)
    {
        var userName = GetUserNameFromToken(token);
        if (string.IsNullOrEmpty(userName))
            return Unauthorized("Invalid token.");

        var user = _context.Users.FirstOrDefault(u => u.UserName == userName);
        if (user == null)
            return NotFound("User not found.");

        var response = new UserStyleDto
        {
            AvatarIcon = user.AvatarIcon ?? string.Empty,
            AvatarColor = user.AvatarColor ?? string.Empty,
            AvatarDirection = user.AvatarDirection ?? "to right",
            UserNameColor = user.UserNameColor ?? string.Empty
        };

        return Ok(response);
    }

    [HttpPost("style")]
    public IActionResult SetUserStyle([FromHeader] string token, [FromBody] SetUserStyleRequest request)
    {
        var userName = GetUserNameFromToken(token);
        if (string.IsNullOrEmpty(userName))
            return Unauthorized("Invalid token.");

        var user = _context.Users.FirstOrDefault(u => u.UserName == userName);
        if (user == null)
            return NotFound("User not found.");

        user.AvatarIcon = request.AvatarIcon;
        user.AvatarColor = request.AvatarColor;
        user.AvatarDirection = request.AvatarDirection;
        user.UserNameColor = request.UserNameColor;

        _context.Users.Update(user);
        _context.SaveChanges();

        return Ok(new { Message = "Changes saved." });
    }

    [HttpGet("info")]
    [Authorize]
    public async Task<ActionResult<UserInfoResponse>> GetUserInfo()
    {
        var userName = GetUserNameFromClaims();
        if (string.IsNullOrEmpty(userName))
            return Unauthorized("Invalid token.");

        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
        if (user == null)
            return NotFound("User not found.");

        var commentsCount = await _context.Comments.CountAsync(c => c.UserId == user.Id);

        var response = new UserInfoResponse
        {
            UserName = user.UserName,
            RegisteredAt = user.CreatedAt,
            CommentsCount = commentsCount,
            Style = new UserStyleDto
            {
                AvatarIcon = user.AvatarIcon ?? "faUser",
                AvatarColor = user.AvatarColor ?? "898F96",
                AvatarDirection = user.AvatarDirection ?? "to right",
                UserNameColor = user.UserNameColor ?? "898F96"
            }
        };

        return Ok(response);
    }
}
