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

    [HttpGet("avatar")]
    public IActionResult GetAvatar([FromHeader] string token)
    {
        var userName = GetUserNameFromToken(token);
        if (string.IsNullOrEmpty(userName))
            return Unauthorized("Invalid token.");

        var user = _context.Users.FirstOrDefault(u => u.UserName == userName);
        if (user == null)
            return NotFound("User not found.");

        return Ok(new { AvatarBase64 = user.AvatarBase64 });
    }

    [HttpPost("avatar")]
    public IActionResult SetAvatar([FromHeader] string token, [FromBody] SetAvatarRequest request)
    {
        var userName = GetUserNameFromToken(token);
        if (string.IsNullOrEmpty(userName))
            return Unauthorized("Invalid token.");

        var user = _context.Users.FirstOrDefault(u => u.UserName == userName);
        if (user == null)
            return NotFound("User not found.");

        user.AvatarBase64 = request.AvatarBase64;
        _context.Users.Update(user);
        _context.SaveChanges();

        return Ok(new { Message = "Avatar updated successfully." });
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

        var catReactionCount = await _context.Reactions
            .CountAsync(r => r.UserId == user.Id && r.TargetType == "Cat");

        var userCommentIds = await _context.CatComments
            .Where(c => c.UserId == user.Id)
            .Select(c => c.Id)
            .ToListAsync();

        var receivedReactionsCount = await _context.Reactions
            .CountAsync(r => r.TargetType == "Comment" && userCommentIds.Contains(r.TargetId));

        var latestComments = await _context.CatComments
            .Where(c => c.UserId == user.Id)
            .OrderByDescending(c => c.CreatedAt)
            .Take(3)
            .Include(c => c.Cat)
            .Select(c => new CommentMinimizedResponse
            {
                Id = c.Id,
                Text = c.Text,
                CreatedAt = c.CreatedAt,
                CatNormalizedName = c.Cat.NormalizedName
            })
            .ToListAsync();

        var response = new UserInfoResponse
        {
            RegisteredAt = user.CreatedAt,
            CatReactionsCount = catReactionCount,
            ReceivedReactionsOnCommentsCount = receivedReactionsCount,
            LatestComments = latestComments
        };

        return Ok(response);
    }
}
