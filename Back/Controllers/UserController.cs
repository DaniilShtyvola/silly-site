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

        var response = new AvatarResponse
        {
            AvatarIcon = user.AvatarIcon,
            AvatarColor = user.AvatarColor
        };

        return Ok(response);
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

        user.AvatarIcon = request.AvatarIcon;
        user.AvatarColor = request.AvatarColor;

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

        var commentsCount = await _context.Comments
            .CountAsync(c => c.UserId == user.Id);

        var lastComments = await _context.Comments
            .Where(c => c.UserId == user.Id)
            .OrderByDescending(c => c.CreatedAt)
            .Take(3)
            .ToListAsync();

        var lastCommentIds = lastComments.Select(c => c.Id).ToList();

        var reactionsToLastComments = await _context.Reactions
            .Where(r => r.CommentId != null && lastCommentIds.Contains(r.CommentId.Value))
            .GroupBy(r => new { r.CommentId, r.Type })
            .Select(g => new { g.Key.CommentId, g.Key.Type, Count = g.Count() })
            .ToListAsync();

        var lastCommentDtos = lastComments.Select(comment => new UserCommentDto
        {
            Id = comment.Id,
            Text = comment.Text,
            CreatedAt = comment.CreatedAt,
            Reactions = reactionsToLastComments
                .Where(r => r.CommentId == comment.Id)
                .ToDictionary(r => r.Type, r => r.Count)
        }).ToList();

        var userCommentIds = await _context.Comments
            .Where(c => c.UserId == user.Id)
            .Select(c => c.Id)
            .ToListAsync();

        var receivedReactions = await _context.Reactions
            .Where(r => r.CommentId != null && userCommentIds.Contains(r.CommentId.Value))
            .GroupBy(r => r.Type)
            .Select(g => new { g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.Key, g => g.Count);

        var givenReactions = await _context.Reactions
            .Where(r => r.UserId == user.Id)
            .GroupBy(r => r.Type)
            .Select(g => new { g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.Key, g => g.Count);

        var response = new UserInfoResponse
        {
            RegisteredAt = user.CreatedAt,
            CommentsCount = commentsCount,
            LastComments = lastCommentDtos,
            ReceivedReactionsCountByType = receivedReactions,
            UserReactionsCountByType = givenReactions,
            AvatarIcon = user.AvatarIcon ?? "faUser",
            AvatarColor = user.AvatarColor ?? "#898F96"
        };

        return Ok(response);
    }
}
