using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[ApiController]
[Route("reactions")]
public class ReactionsController : ControllerBase
{
    private readonly MainDbContext _context;

    public ReactionsController(MainDbContext context)
    {
        _context = context;
    }
    private string? GetUserName()
    {
        return User.Claims.FirstOrDefault(c => c.Type == "userName")?.Value;
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> AddReaction([FromBody] CreateReactionRequest request)
    {
        var userName = GetUserName();
        if (userName == null) return Unauthorized();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
        if (user == null) return Unauthorized();

        if (request.TargetType != "Cat" && request.TargetType != "Comment")
            return BadRequest("Invalid TargetType");

        bool targetExists = request.TargetType switch
        {
            "Cat" => await _context.Cats.AnyAsync(c => c.Id == request.TargetId),
            "Comment" => await _context.CatComments.AnyAsync(c => c.Id == request.TargetId),
            _ => false
        };

        if (!targetExists)
            return NotFound("Target not found");

        var reaction = new Reaction
        {
            UserId = user.Id,
            Type = request.Type,
            TargetId = request.TargetId,
            TargetType = request.TargetType
        };

        _context.Reactions.Add(reaction);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, id = reaction.Id });
    }
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteReaction(Guid id)
    {
        var userName = GetUserName();
        if (userName == null) return Unauthorized();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
        if (user == null) return Unauthorized();

        var reaction = await _context.Reactions.FirstOrDefaultAsync(r =>
            r.Id == id && r.UserId == user.Id);

        if (reaction == null)
            return NotFound("Reaction not found or not owned by user");

        _context.Reactions.Remove(reaction);
        await _context.SaveChangesAsync();

        return Ok(new { success = true });
    }
}