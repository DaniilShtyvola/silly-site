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
    public async Task<ActionResult<CatResponse>> GetCatByNormalizedName(string normalizedName)
    {
        var cat = await _context.Cats
            .Include(c => c.Images)
            .Include(c => c.SocialLinks)
            .Include(c => c.Comments)
                .ThenInclude(comment => comment.User)
            .FirstOrDefaultAsync(c => c.NormalizedName == normalizedName);

        if (cat == null)
            return NotFound();

        var catReactions = await _context.Reactions
            .Where(r => r.TargetType == "Cat" && r.TargetId == cat.Id)
            .Include(r => r.User)
            .ToListAsync();

        var commentIds = cat.Comments.Select(c => c.Id).ToList();
        var commentReactions = await _context.Reactions
            .Where(r => r.TargetType == "Comment" && commentIds.Contains(r.TargetId))
            .Include(r => r.User)
            .ToListAsync();

        var response = new CatResponse
        {
            Name = cat.Name,
            Description = cat.Description,
            NormalizedName = cat.NormalizedName,
            Images = cat.Images.Select(i => new ImageResponse { Base64 = i.Base64Data }).ToList(),
            Reactions = catReactions.Select(r => new ReactionResponse
            {
                Id = r.Id,
                UserName = r.User?.UserName ?? "Unknown",
                Type = r.Type
            }).ToList(),
            Comments = cat.Comments.Select(c => new CommentResponse
            {
                Id = c.Id,
                UserName = c.User?.UserName ?? "Unknown",
                Text = c.Text,
                CreatedAt = c.CreatedAt,
                Reactions = commentReactions
                    .Where(r => r.TargetId == c.Id)
                    .Select(r => new ReactionResponse
                    {
                        Id = r.Id,
                        UserName = r.User?.UserName ?? "Unknown",
                        Type = r.Type
                    }).ToList()
            }).ToList()
        };

        return Ok(response);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateCatRequest request)
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
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCatRequest request)
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
}
