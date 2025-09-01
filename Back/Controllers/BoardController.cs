using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
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

        if (request.ParentType == "post")
        {
            var post = await _context.Posts.FindAsync(request.ParentId);
            if (post == null)
                return NotFound("Post not found");
        }
        else if (request.ParentType == "comment")
        {
            var parentComment = await _context.Comments.FindAsync(request.ParentId);
            if (parentComment == null)
                return NotFound("Parent comment not found");
        }
        else
        {
            return BadRequest("ParentType must be either 'post' or 'comment'.");
        }

        var comment = new Comment
        {
            Text = request.Text,
            CreatedAt = DateTime.UtcNow,
            UserId = user.Id,
            ParentId = request.ParentId
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        var dto = new CommentDto
        {
            Id = comment.Id,
            UserId = comment.UserId,
            Text = comment.Text,
            CreatedAt = comment.CreatedAt,
            IsEdited = false,
            IsMine = true,
            IsDeleted = false,
        };

        return Ok(dto);
    }

    [Authorize]
    [HttpDelete("comments/{id}")]
    public async Task<IActionResult> DeleteComment(string id)
    {
        var userName = GetUserName();
        if (userName == null) return Unauthorized();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
        if (user == null) return Unauthorized();

        var comment = await _context.Comments
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == user.Id);

        if (comment == null)
            return NotFound("Comment not found or not owned by user");

        comment.IsDeleted = true;

        await _context.SaveChangesAsync();

        return Ok(new { success = true });
    }

    [Authorize]
    [HttpPut("comments/{id}")]
    public async Task<IActionResult> EditComment(string id, [FromBody] EditCommentRequest request)
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
        comment.IsEdited = true;

        _context.Comments.Update(comment);
        await _context.SaveChangesAsync();

        return Ok(new { success = true });
    }

    //[Authorize]
    [HttpPost("posts")]
    public async Task<IActionResult> AddPost([FromBody] CreatePostRequest request)
    {
        //if (!IsAdmin())
            //return Forbid();

        var post = new Post
        {
            Id = ShortUlid.NewId(),
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
    public async Task<IActionResult> DeletePost(string id)
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
    public async Task<IActionResult> ToggleReaction([FromBody] ToggleReactionRequest request)
    {
        var userName = GetUserName();
        if (userName == null) return Unauthorized();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
        if (user == null) return Unauthorized();

        bool parentExists = false;

        if (request.ParentType.Equals("post", StringComparison.OrdinalIgnoreCase))
        {
            parentExists = await _context.Posts.AnyAsync(p => p.Id == request.ParentId);
        }
        else if (request.ParentType.Equals("comment", StringComparison.OrdinalIgnoreCase))
        {
            parentExists = await _context.Comments.AnyAsync(c => c.Id == request.ParentId);
        }
        else
        {
            return BadRequest("ParentType must be either 'post' or 'comment'.");
        }

        if (!parentExists)
        {
            return NotFound($"{request.ParentType} not found.");
        }

        var reaction = await _context.Reactions
            .FirstOrDefaultAsync(r => r.Type == request.Type && r.ParentId == request.ParentId);

        if (reaction == null)
        {
            reaction = new Reaction
            {
                Type = request.Type,
                ParentId = request.ParentId,
                UserIds = user.Id
            };

            _context.Reactions.Add(reaction);
        }
        else
        {
            var userIds = reaction.UserIds.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList();

            if (!userIds.Contains(user.Id))
            {
                userIds.Add(user.Id);
            }
            else
            {
                userIds.Remove(user.Id);
            }

            if (userIds.Count == 0)
            {
                _context.Reactions.Remove(reaction);
            }
            else
            {
                reaction.UserIds = string.Join(',', userIds);
                _context.Reactions.Update(reaction);
            }
        }

        await _context.SaveChangesAsync();

        return Ok(new { success = true });
    }

    [HttpGet]
    public async Task<IActionResult> GetBoard([FromQuery] int skip = 0, [FromQuery] int take = 4)
    {
        var userName = GetUserName();
        var isAdmin = IsAdmin();
        var currentUser = await GetCurrentUserAsync(userName);

        if (userName != null && currentUser == null)
            return Unauthorized();

        var totalPosts = await _context.Posts.CountAsync();
        var posts = await GetPostsAsync(skip, take);

        if (!posts.Any())
            return Ok(new BoardResponse { Posts = new(), Users = new(), TotalPosts = totalPosts });

        var postIds = posts.Select(p => p.Id).ToList();
        var allComments = await GetAllCommentsForPostsAsync(postIds);
        var reactions = await GetReactionsAsync(postIds, allComments.Select(c => c.Id).ToList());

        var usersById = new Dictionary<string, UserDto>();
        var commentDtos = BuildCommentDtos(allComments, reactions, currentUser?.Id, isAdmin, usersById);
        var commentTree = BuildCommentTree(commentDtos, allComments, postIds);
        var postsWithComments = BuildPostDtos(posts, reactions, commentTree, currentUser?.Id);

        AddCurrentUserToUsersList(currentUser, usersById);

        return Ok(new BoardResponse
        {
            Posts = postsWithComments,
            Users = usersById.Values.ToList(),
            TotalPosts = totalPosts
        });
    }

    private async Task<User?> GetCurrentUserAsync(string? userName)
    {
        if (userName == null) return null;

        return await _context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
    }

    private async Task<List<Post>> GetPostsAsync(int skip, int take)
    {
        return await _context.Posts
            .OrderByDescending(p => p.IsPinned)
            .ThenByDescending(p => p.CreatedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    private async Task<List<Comment>> GetAllCommentsForPostsAsync(List<string> postIds)
    {
        var comments = await _context.Comments
            .Include(c => c.User)
            .Where(c => postIds.Contains(c.ParentId))
            .ToListAsync();

        var allComments = new List<Comment>(comments);
        var parentIdsToCheck = comments.Select(c => c.Id).ToList();

        while (parentIdsToCheck.Any())
        {
            var replies = await _context.Comments
                .Include(c => c.User)
                .Where(c => parentIdsToCheck.Contains(c.ParentId))
                .ToListAsync();

            if (!replies.Any()) break;

            allComments.AddRange(replies);
            parentIdsToCheck = replies.Select(c => c.Id).ToList();
        }

        return allComments;
    }

    private async Task<List<Reaction>> GetReactionsAsync(List<string> postIds, List<string> commentIds)
    {
        return await _context.Reactions
            .Where(r => postIds.Contains(r.ParentId) || commentIds.Contains(r.ParentId))
            .ToListAsync();
    }

    private List<CommentDto> BuildCommentDtos(
        List<Comment> allComments,
        List<Reaction> reactions,
        string? currentUserId,
        bool isAdmin,
        Dictionary<string, UserDto> usersById)
    {
        var reactionsByParentId = reactions.ToLookup(r => r.ParentId);

        return allComments.Select(c =>
        {
            var isMine = currentUserId != null && c.UserId == currentUserId;
            var canSeeFull = isAdmin || isMine;

            var reactionDtos = BuildReactionDtos(reactionsByParentId[c.Id], currentUserId);
            var (userIdToShow, textToShow) = GetCommentDisplayData(c, allComments, canSeeFull);

            if (c.IsDeleted && !allComments.Any(x => x.ParentId == c.Id) && !canSeeFull)
                return null;

            AddUserToUsersDict(c.User, userIdToShow, usersById);

            return new CommentDto
            {
                Id = c.Id,
                UserId = userIdToShow,
                Text = textToShow,
                CreatedAt = c.CreatedAt,
                IsEdited = c.IsEdited,
                IsDeleted = c.IsDeleted,
                IsMine = isMine,
                Reactions = reactionDtos,
                Replies = new List<CommentDto>()
            };
        })
        .Where(c => c != null)
        .ToList()!;
    }

    private List<ReactionDto> BuildReactionDtos(IEnumerable<Reaction> reactions, string? currentUserId)
    {
        return reactions.Select(r =>
        {
            var userIds = r.UserIds.Split(',', StringSplitOptions.RemoveEmptyEntries);
            return new ReactionDto
            {
                Type = r.Type,
                Count = userIds.Length,
                IsMine = currentUserId != null && userIds.Contains(currentUserId)
            };
        }).ToList();
    }

    private (string? userId, string? text) GetCommentDisplayData(Comment comment, List<Comment> allComments, bool canSeeFull)
    {
        if (comment.IsDeleted && allComments.Any(x => x.ParentId == comment.Id) && !canSeeFull)
            return (null, "[deleted]");

        return (comment.UserId, comment.Text);
    }

    private void AddUserToUsersDict(User user, string? userId, Dictionary<string, UserDto> usersById)
    {
        if (userId != null && !usersById.ContainsKey(userId))
        {
            usersById[userId] = new UserDto
            {
                Id = user.Id,
                UserName = user.UserName,
                Style = new UserStyleDto
                {
                    AvatarIcon = user.AvatarIcon ?? "user",
                    AvatarColor = user.AvatarColor ?? "898F96",
                    AvatarDirection = user.AvatarDirection ?? "to right",
                    UserNameColor = user.UserNameColor ?? "898F96"
                }
            };
        }
    }

    private Dictionary<string, List<CommentDto>> BuildCommentTree(
        List<CommentDto> commentDtos,
        List<Comment> allComments,
        List<string> postIds)
    {
        var commentDict = commentDtos.ToDictionary(c => c.Id);

        foreach (var c in allComments.OrderByDescending(x => x.CreatedAt))
        {
            if (commentDict.ContainsKey(c.Id) && commentDict.ContainsKey(c.ParentId))
                commentDict[c.ParentId].Replies.Add(commentDict[c.Id]);
        }

        return commentDtos
            .Where(c => postIds.Contains(allComments.First(x => x.Id == c.Id).ParentId))
            .GroupBy(c => allComments.First(x => x.Id == c.Id).ParentId)
            .ToDictionary(g => g.Key, g => g.OrderByDescending(c => c.CreatedAt).ToList());
    }

    private List<PostWithCommentsDto> BuildPostDtos(
        List<Post> posts,
        List<Reaction> reactions,
        Dictionary<string, List<CommentDto>> commentTree,
        string? currentUserId)
    {
        var reactionsByParentId = reactions.ToLookup(r => r.ParentId);

        return posts.Select(post =>
        {
            var reactionDtos = BuildReactionDtos(reactionsByParentId[post.Id], currentUserId);

            return new PostWithCommentsDto
            {
                Id = post.Id,
                ContentJson = post.ContentJson,
                CreatedAt = post.CreatedAt,
                IsPinned = post.IsPinned,
                Reactions = reactionDtos,
                Comments = commentTree.ContainsKey(post.Id) ? commentTree[post.Id] : new List<CommentDto>()
            };
        }).ToList();
    }

    private void AddCurrentUserToUsersList(User? currentUser, Dictionary<string, UserDto> usersById)
    {
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
    }
}
