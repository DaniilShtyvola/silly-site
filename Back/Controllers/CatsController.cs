using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Security.Claims;

[ApiController]
[Route("cats")]
public class CatsController : ControllerBase
{
    private readonly MainDbContext _context;

    public CatsController(MainDbContext context)
    {
        _context = context;
    }

    private bool UserIsAdmin() =>
        User.Claims.FirstOrDefault(c => c.Type == "isAdmin")?.Value == "true";

    private string? GetUserName()
    {
        return User.Claims.FirstOrDefault(c => c.Type == "userName")?.Value;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var cats = await _context.Cats
            .Include(c => c.Images)
            .Include(c => c.SocialLinks)
            .ToListAsync();
        return Ok(cats);
    }
    [HttpGet("minimized")]
    public async Task<ActionResult<List<CatMinimizedResponse>>> GetAllMinimized()
    {
        var cats = await _context.Cats
            .Include(c => c.Images)
            .ToListAsync();

        var result = cats.Select(cat => new CatMinimizedResponse
        {
            Name = cat.Name,
            NormalizedName = cat.NormalizedName,
            FirstImageBase64 = cat.Images.FirstOrDefault()?.Base64Data
        }).ToList();

        return Ok(result);
    }

    [HttpGet("{normalizedName}")]
    public async Task<ActionResult<Cat>> GetCatByNormalizedName(string normalizedName)
    {
        var cat = await _context.Cats
            .Include(c => c.Images)
            .Include(c => c.SocialLinks)
            .Include(c => c.Comments)
            .Include(c => c.Reactions)
            .FirstOrDefaultAsync(c => c.NormalizedName == normalizedName);

        if (cat == null)
            return NotFound();

        return Ok(cat);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CatCreateRequest request)
    {
        if (!UserIsAdmin()) return Forbid();

        var exists = await _context.Cats.AnyAsync(c => c.NormalizedName == request.NormalizedName);
        if (exists)
            return BadRequest("NormalizedName must be unique");

        var cat = new Cat
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            Images = request.Images.Select(i => new CatImage
            {
                Id = Guid.NewGuid(),
                Base64Data = i.Base64Data
            }).ToList(),
            SocialLinks = request.SocialLinks.Select(l => new CatSocialLink
            {
                Id = Guid.NewGuid(),
                Link = l.Link,
                Platform = l.Platform
            }).ToList()
        };

        _context.Cats.Add(cat);
        await _context.SaveChangesAsync();
        return Ok(cat);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(Guid id, [FromBody] CatUpdateRequest request)
    {
        if (!UserIsAdmin()) return Forbid();

        var cat = await _context.Cats
            .Include(c => c.Images)
            .Include(c => c.SocialLinks)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (cat == null) return NotFound();

        cat.Name = request.Name;
        cat.Description = request.Description;

        _context.CatImages.RemoveRange(cat.Images);
        _context.CatImages.AddRange(request.Images.Select(i => new CatImage
        {
            Id = Guid.NewGuid(),
            Base64Data = i.Base64Data,
            CatId = cat.Id
        }));

        _context.CatSocialLinks.RemoveRange(cat.SocialLinks);
        _context.CatSocialLinks.AddRange(request.SocialLinks.Select(l => new CatSocialLink
        {
            Id = Guid.NewGuid(),
            Link = l.Link,
            Platform = l.Platform,
            CatId = cat.Id
        }));

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (!UserIsAdmin()) return Forbid();

        var cat = await _context.Cats.FindAsync(id);
        if (cat == null) return NotFound();

        _context.Cats.Remove(cat);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/reaction")]
    [Authorize]
    public async Task<IActionResult> AddReaction(Guid id, [FromBody] CatReactionRequest request)
    {
        var userName = GetUserName();
        if (userName == null) return Unauthorized();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
        if (user == null) return Unauthorized();

        var cat = await _context.Cats.FindAsync(id);
        if (cat == null) return NotFound();

        var reaction = new CatReaction
        {
            Id = Guid.NewGuid(),
            CatId = id,
            UserId = user.Id,
            Type = request.Type
        };

        _context.CatReactions.Add(reaction);
        await _context.SaveChangesAsync();
        return Ok(reaction);
    }

    [HttpPost("{id}/comment")]
    [Authorize]
    public async Task<IActionResult> AddComment(Guid id, [FromBody] CatCommentRequest request)
    {
        var userName = GetUserName();
        if (userName == null) return Unauthorized();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
        if (user == null) return Unauthorized();

        var cat = await _context.Cats.FindAsync(id);
        if (cat == null) return NotFound();

        var comment = new CatComment
        {
            Id = Guid.NewGuid(),
            CatId = id,
            UserId = user.Id,
            Text = request.Text,
            CreatedAt = DateTime.UtcNow
        };

        _context.CatComments.Add(comment);
        await _context.SaveChangesAsync();
        return Ok(comment);
    }
}
