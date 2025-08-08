using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[ApiController]
[Route("board")]
public class BoardController : ControllerBase
{
    private readonly MainDbContext _context;

    public BoardController(MainDbContext context)
    {
        _context = context;
    }

    private string? GetUserName() =>
        User.Claims.FirstOrDefault(c => c.Type == "userName")?.Value;

    private bool IsAdmin() =>
        User.Claims.FirstOrDefault(c => c.Type == "isAdmin")?.Value == "true";

    [HttpPost("comments")]
    [Authorize]
    public async Task<IActionResult> AddComment([FromBody] CreateCommentRequest request)
    {
        var userName = GetUserName();
        if (userName == null) return Unauthorized();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
        if (user == null) return Unauthorized();

        var post = await _context.Posts.FindAsync(request.PostId);
        if (post == null)
            return NotFound("Post not found");

        var comment = new Comment
        {
            Text = request.Text,
            CreatedAt = DateTime.UtcNow,
            UserId = user.Id,
            PostId = post.Id
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        return Ok(comment);
    }

    [HttpDelete("comments/{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteComment(Guid id)
    {
        var userName = GetUserName();
        if (userName == null) return Unauthorized();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
        if (user == null) return Unauthorized();

        var comment = await _context.Comments
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == user.Id);

        if (comment == null)
            return NotFound("Comment not found or not owned by user");

        var reactions = await _context.Reactions
            .Where(r => r.CommentId == comment.Id)
            .ToListAsync();

        _context.Reactions.RemoveRange(reactions);
        _context.Comments.Remove(comment);

        await _context.SaveChangesAsync();

        return Ok(new { success = true });
    }

    [HttpPut("comments/{id}")]
    [Authorize]
    public async Task<IActionResult> EditComment(Guid id, [FromBody] EditCommentRequest request)
    {
        var userName = GetUserName();
        if (userName == null) return Unauthorized();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
        if (user == null) return Unauthorized();

        var comment = await _context.Comments.FirstOrDefaultAsync(c => c.Id == id && c.UserId == user.Id);
        if (comment == null)
            return NotFound("Comment not found or not owned by user");

        if (string.IsNullOrWhiteSpace(request.Text))
            return BadRequest("Text cannot be empty");

        comment.Text = request.Text;
        comment.Edited = DateTime.UtcNow;

        _context.Comments.Update(comment);
        await _context.SaveChangesAsync();

        return Ok(comment);
    }

    [HttpPost("posts")]
    [Authorize]
    public async Task<IActionResult> AddPost([FromBody] CreatePostRequest request)
    {
        if (!IsAdmin())
            return Forbid();

        var post = new Post
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Content = request.Content,
            CreatedAt = DateTime.UtcNow
        };

        _context.Posts.Add(post);
        await _context.SaveChangesAsync();

        return Ok(post);
    }

    [HttpDelete("posts/{id}")]
    [Authorize]
    public async Task<IActionResult> DeletePost(Guid id)
    {
        if (!IsAdmin())
            return Forbid();

        var post = await _context.Posts.FindAsync(id);
        if (post == null)
            return NotFound("Post not found");

        _context.Posts.Remove(post);
        await _context.SaveChangesAsync();

        return Ok(new { success = true });
    }

    [HttpGet]
    public async Task<IActionResult> GetBoard()
    {
        var posts = await _context.Posts
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        var comments = await _context.Comments
            .Include(c => c.User)
            .ToListAsync();

        var reactions = await _context.Reactions.ToListAsync();

        var reactionsByPostId = reactions
            .Where(r => r.PostId.HasValue)
            .ToLookup(r => r.PostId.Value);

        var reactionsByCommentId = reactions
            .Where(r => r.CommentId.HasValue)
            .ToLookup(r => r.CommentId.Value);

        var postsWithComments = posts.Select(post => new PostWithCommentsDto
        {
            Id = post.Id,
            Title = post.Title,
            Content = post.Content,
            CreatedAt = post.CreatedAt,

            Reactions = reactionsByPostId[post.Id]
                .Select(r => new ReactionDto
                {
                    Id = r.Id,
                    Type = r.Type,
                    UserId = r.UserId
                }).ToList(),

            Comments = comments
                .Where(c => c.PostId == post.Id)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new CommentDto
                {
                    Id = c.Id,
                    Text = c.Text,
                    CreatedAt = c.CreatedAt,
                    Edited = c.Edited,
                    User = new UserDto
                    {
                        Id = c.User.Id,
                        UserName = c.User.UserName,
                        AvatarIcon = c.User.AvatarIcon ?? "faUser",
                        AvatarColor = c.User.AvatarColor ?? "rgb(137, 143, 150)"
                    },
                    Reactions = reactionsByCommentId[c.Id]
                        .Select(r => new ReactionDto
                        {
                            Id = r.Id,
                            Type = r.Type,
                            UserId = r.UserId
                        }).ToList()
                }).ToList()
        }).ToList();

        var response = new BoardResponse
        {
            Posts = postsWithComments
        };

        return Ok(response);
    }

    [HttpPost("reactions")]
    [Authorize]
    public async Task<IActionResult> AddReaction([FromBody] CreateReactionRequest request)
    {
        var userName = GetUserName();
        if (userName == null) return Unauthorized();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
        if (user == null) return Unauthorized();

        if ((request.PostId == null && request.CommentId == null) || (request.PostId != null && request.CommentId != null))
        {
            return BadRequest("Specify exactly one of PostId or CommentId.");
        }

        if (request.PostId != null)
        {
            var postExists = await _context.Posts.AnyAsync(p => p.Id == request.PostId);
            if (!postExists) return NotFound("Post not found.");
        }

        if (request.CommentId != null)
        {
            var commentExists = await _context.Comments.AnyAsync(c => c.Id == request.CommentId);
            if (!commentExists) return NotFound("Comment not found.");
        }

        var reaction = new Reaction
        {
            UserId = user.Id,
            Type = request.Type,
            PostId = request.PostId,
            CommentId = request.CommentId
        };

        _context.Reactions.Add(reaction);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, id = reaction.Id });
    }

    [HttpDelete("reactions/{id}")]
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
