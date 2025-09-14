using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Authorize]
[Route("me")]
public class UserController(MainDbContext context) : ControllerBase
{
    private readonly MainDbContext _context = context;

    private string? GetUserNameFromClaims()
    {
        return User.Claims.FirstOrDefault(c => c.Type == "userName")?.Value;
    }

    [HttpGet("style")]
    public IActionResult GetUserStyle()
    {
        var userName = GetUserNameFromClaims();
        if (string.IsNullOrEmpty(userName))
            return Unauthorized("Invalid token.");

        var user = _context.Users.FirstOrDefault(u => u.UserName == userName);
        if (user == null)
            return NotFound("User not found.");

        var response = new UserStyleDto
        {
            AvatarIcon = user.AvatarIcon ?? string.Empty,
            AvatarColor = user.AvatarColor ?? string.Empty,
            AvatarDirection = user.AvatarDirection ?? "225deg",
            UserNameColor = user.UserNameColor ?? string.Empty
        };

        return Ok(response);
    }

    [HttpPost("style")]
    public IActionResult SetUserStyle([FromBody] SetUserStyleRequest request)
    {
        var userName = GetUserNameFromClaims();
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
                AvatarDirection = user.AvatarDirection ?? "225deg",
                UserNameColor = user.UserNameColor ?? "898F96"
            }
        };

        return Ok(response);
    }
}
