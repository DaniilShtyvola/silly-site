public class BoardResponse
{
    public List<PostWithCommentsDto> Posts { get; set; } = new();
    public List<UserDto> Users { get; set; } = new();
    public int TotalPosts { get; set; }
}

public class PostWithCommentsDto
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }
    public DateTime CreatedAt { get; set; }

    public Dictionary<string, int> ReactionCounts { get; set; } = new();
    public Dictionary<string, string> MyReactions { get; set; } = new();
    public List<CommentDto> Comments { get; set; } = new();
}

public class CommentDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string? Text { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? Edited { get; set; }

    public Dictionary<string, int> ReactionCounts { get; set; } = new();
    public Dictionary<string, string> MyReactions { get; set; } = new();
    public List<CommentDto> Replies { get; set; } = new();
}

public class UserDto
{
    public Guid Id { get; set; }
    public string UserName { get; set; }
    public UserStyleDto Style { get; set; }
}
