public class BoardResponse
{
    public List<PostWithCommentsDto> Posts { get; set; } = [];
    public List<UserDto> Users { get; set; } = [];
    public int TotalPosts { get; set; }
}

public class PostWithCommentsDto
{
    public string Id { get; set; }
    public string ContentJson { get; set; }
    public string Category { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsPinned { get; set; }

    public List<ReactionDto> Reactions { get; set; } = [];
    public List<CommentDto> Comments { get; set; } = [];
}

public class CommentDto
{
    public string Id { get; set; }
    public string? UserId { get; set; }
    public string? Text { get; set; }
    public DateTime CreatedAt { get; set; }

    public bool IsEdited { get; set; }
    public bool IsDeleted { get; set; }
    public bool IsMine { get; set; }

    public List<ReactionDto> Reactions { get; set; } = [];
    public List<CommentDto> Replies { get; set; } = [];
}

public class UserDto
{
    public string Id { get; set; }
    public string UserName { get; set; }
    public UserStyleDto Style { get; set; }
}

public class ReactionDto
{
    public string Type { get; set; }
    public int Count { get; set; }
    public bool IsMine { get; set; }
}
