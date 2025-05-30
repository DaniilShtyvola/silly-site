using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[ApiController]
[Route("comments")]
public class CommentsController : ControllerBase
{
    private readonly MainDbContext _context;

    public CommentsController(MainDbContext context)
    {
        _context = context;
    }

    private string? GetUserName()
    {
        return User.Claims.FirstOrDefault(c => c.Type == "userName")?.Value;
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> AddComment([FromBody] CreateCommentRequest request)
    {
        var userName = GetUserName();
        if (userName == null) return Unauthorized();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
        if (user == null) return Unauthorized();

        var cat = await _context.Cats.FindAsync(request.CatId);
        if (cat == null) return NotFound("Cat not found");

        var comment = new CatComment
        {
            Id = Guid.NewGuid(),
            CatId = request.CatId,
            UserId = user.Id,
            Text = request.Text,
            CreatedAt = DateTime.UtcNow
        };

        _context.CatComments.Add(comment);
        await _context.SaveChangesAsync();

        return Ok(comment);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteComment(Guid id)
    {
        var userName = GetUserName();
        if (userName == null) return Unauthorized();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
        if (user == null) return Unauthorized();

        var comment = await _context.CatComments
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == user.Id);

        if (comment == null)
            return NotFound("Comment not found or not owned by user");

        var relatedReactions = await _context.Reactions
            .Where(r => r.TargetId == comment.Id && r.TargetType == "Comment")
            .ToListAsync();

        _context.Reactions.RemoveRange(relatedReactions);
        _context.CatComments.Remove(comment);
        await _context.SaveChangesAsync();

        return Ok(new { success = true });
    }
}
