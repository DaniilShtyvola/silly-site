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

    [Authorize]
    [HttpPost("comments")]
    public async Task<IActionResult> AddComment([FromBody] CreateCommentRequest request)
    {
        var userName = GetUserName();
        if (userName == null) return Unauthorized();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
        if (user == null) return Unauthorized();

        Guid postId;

        if (request.ParentCommentId.HasValue)
        {
            var parentComment = await _context.Comments
                .FirstOrDefaultAsync(c => c.Id == request.ParentCommentId.Value);

            if (parentComment == null)
                return NotFound("Parent comment not found");

            postId = parentComment.PostId;
        }
        else
        {
            var post = await _context.Posts.FindAsync(request.PostId);
            if (post == null)
                return NotFound("Post not found");

            postId = post.Id;
        }

        var comment = new Comment
        {
            Text = request.Text,
            CreatedAt = DateTime.UtcNow,
            UserId = user.Id,
            PostId = postId,
            ParentCommentId = request.ParentCommentId
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        var dto = new CommentDto
        {
            Id = comment.Id,
            UserId = comment.UserId,
            Text = comment.Text,
            CreatedAt = comment.CreatedAt,
            Edited = comment.Edited,
            IsMine = true,
            IsDeleted = false,
            ReactionCounts = new Dictionary<string, int>(),
            MyReactions = new Dictionary<string, string>(),
            Replies = new List<CommentDto>()
        };

        return Ok(dto);
    }

    [Authorize]
    [HttpDelete("comments/{id}")]
    public async Task<IActionResult> DeleteComment(Guid id)
    {
        var userName = GetUserName();
        if (userName == null) return Unauthorized();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
        if (user == null) return Unauthorized();

        var comment = await _context.Comments
            .Include(c => c.Replies)
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == user.Id);

        if (comment == null)
            return NotFound("Comment not found or not owned by user");

        comment.IsDeleted = true;

        await _context.SaveChangesAsync();

        return Ok(new { success = true });
    }

    [Authorize]
    [HttpPut("comments/{id}")]
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

    //[Authorize]
    [HttpPost("posts")]
    public async Task<IActionResult> AddPost([FromBody] CreatePostRequest request)
    {
        //if (!IsAdmin())
            //return Forbid();

        var post = new Post
        {
            Id = Guid.NewGuid(),
            ContentJson = request.ContentJson,
            IsPinned = request.IsPinned,
            CreatedAt = DateTime.UtcNow
        };

        _context.Posts.Add(post);
        await _context.SaveChangesAsync();

        return Ok(post);
    }

    [Authorize]
    [HttpDelete("posts/{id}")]
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

    [Authorize]
    [HttpPost("reactions")]
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

    [Authorize]
    [HttpDelete("reactions/{id}")]
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

    [HttpGet]
    public async Task<IActionResult> GetBoard([FromQuery] int skip = 0, [FromQuery] int take = 4)
    {
        var userName = GetUserName();
        Guid? currentUserId = null;
        bool isAdmin = IsAdmin();
        User? currentUser = null;

        if (userName != null)
        {
            currentUser = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
            if (currentUser == null) return Unauthorized();
            currentUserId = currentUser.Id;
        }

        var totalPosts = await _context.Posts.CountAsync();

        var posts = await _context.Posts
            .OrderByDescending(p => p.IsPinned)
            .ThenByDescending(p => p.CreatedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync();

        if (!posts.Any())
        {
            return Ok(new BoardResponse
            {
                Posts = new List<PostWithCommentsDto>(),
                Users = new List<UserDto>(),
                TotalPosts = totalPosts
            });
        }

        var postIds = posts.Select(p => p.Id).ToList();

        var comments = await _context.Comments
            .Include(c => c.User)
            .Include(c => c.Replies)
            .Where(c => postIds.Contains(c.PostId))
            .ToListAsync();

        var reactions = await _context.Reactions
            .Where(r => (r.PostId.HasValue && postIds.Contains(r.PostId.Value)) ||
                        (r.CommentId.HasValue && comments.Select(c => c.Id).Contains(r.CommentId.Value)))
            .ToListAsync();

        var reactionsByPostId = reactions
            .Where(r => r.PostId.HasValue)
            .ToLookup(r => r.PostId.Value);

        var reactionsByCommentId = reactions
            .Where(r => r.CommentId.HasValue)
            .ToLookup(r => r.CommentId.Value);

        var usersById = new Dictionary<Guid, UserDto>();

        var commentDtos = comments.Select(c =>
        {
            bool isMine = currentUserId.HasValue && c.UserId == currentUserId.Value;
            bool canSeeFull = isAdmin || isMine;

            var commentReactions = reactionsByCommentId[c.Id];
            var reactionCounts = commentReactions
                .GroupBy(r => r.Type)
                .ToDictionary(g => g.Key, g => g.Count());

            var myReactions = currentUserId.HasValue
                ? commentReactions
                    .Where(r => r.UserId == currentUserId.Value)
                    .ToDictionary(r => r.Type, r => r.Id.ToString())
                : new Dictionary<string, string>();

            Guid? userIdToShow = c.UserId;
            string? textToShow = c.Text;

            if (c.IsDeleted)
            {
                if (!c.Replies.Any())
                {
                    if (!canSeeFull) return null;
                }
                else
                {
                    if (!canSeeFull)
                    {
                        userIdToShow = null;
                        textToShow = "[deleted]";
                    }
                }
            }

            if (userIdToShow.HasValue && !usersById.ContainsKey(userIdToShow.Value))
            {
                var u = c.User;
                usersById[userIdToShow.Value] = new UserDto
                {
                    Id = u.Id,
                    UserName = u.UserName,
                    Style = new UserStyleDto
                    {
                        AvatarIcon = u.AvatarIcon ?? "user",
                        AvatarColor = u.AvatarColor ?? "898F96",
                        AvatarDirection = u.AvatarDirection ?? "to right",
                        UserNameColor = u.UserNameColor ?? "898F96"
                    }
                };
            }

            return new CommentDto
            {
                Id = c.Id,
                UserId = userIdToShow,
                Text = textToShow,
                CreatedAt = c.CreatedAt,
                Edited = c.Edited,
                IsDeleted = c.IsDeleted,
                IsMine = isMine,
                ReactionCounts = reactionCounts,
                MyReactions = myReactions,
                Replies = new List<CommentDto>()
            };
        })
        .Where(c => c != null)
        .ToList()!;

        var commentDict = commentDtos.ToDictionary(c => c.Id);

        foreach (var c in comments.OrderByDescending(x => x.CreatedAt))
        {
            if (c.ParentCommentId.HasValue && commentDict.ContainsKey(c.Id) && commentDict.ContainsKey(c.ParentCommentId.Value))
            {
                commentDict[c.ParentCommentId.Value].Replies.Add(commentDict[c.Id]);
                commentDict[c.ParentCommentId.Value].Replies = commentDict[c.ParentCommentId.Value]
                    .Replies
                    .OrderByDescending(r => r.CreatedAt)
                    .ToList();
            }
        }

        var commentsByPostId = commentDtos
            .Where(c => !comments.First(x => x.Id == c.Id).ParentCommentId.HasValue)
            .GroupBy(c => comments.First(x => x.Id == c.Id).PostId);

        var postsWithComments = posts.Select(post =>
        {
            var postReactions = reactionsByPostId[post.Id];

            var reactionCounts = postReactions
                .GroupBy(r => r.Type)
                .ToDictionary(g => g.Key, g => g.Count());

            var myReactions = currentUserId.HasValue
                ? postReactions
                    .Where(r => r.UserId == currentUserId.Value)
                    .ToDictionary(r => r.Type, r => r.Id.ToString())
                : new Dictionary<string, string>();

            return new PostWithCommentsDto
            {
                Id = post.Id,
                ContentJson = post.ContentJson,
                CreatedAt = post.CreatedAt,
                IsPinned = post.IsPinned,
                ReactionCounts = reactionCounts,
                MyReactions = myReactions,
                Comments = commentsByPostId
                    .FirstOrDefault(g => g.Key == post.Id)?
                    .OrderByDescending(c => c.CreatedAt)
                    .ToList() ?? new List<CommentDto>()
            };
        }).ToList();

        if (currentUser != null && !usersById.ContainsKey(currentUser.Id))
        {
            usersById[currentUser.Id] = new UserDto
            {
                Id = currentUser.Id,
                UserName = currentUser.UserName,
                Style = new UserStyleDto
                {
                    AvatarIcon = currentUser.AvatarIcon ?? "user",
                    AvatarColor = currentUser.AvatarColor ?? "898F96",
                    AvatarDirection = currentUser.AvatarDirection ?? "to right",
                    UserNameColor = currentUser.UserNameColor ?? "898F96"
                }
            };
        }

        var response = new BoardResponse
        {
            Posts = postsWithComments,
            Users = usersById.Values.ToList(),
            TotalPosts = totalPosts
        };

        return Ok(response);
    }
}
