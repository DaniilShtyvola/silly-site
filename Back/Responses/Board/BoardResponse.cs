public class BoardResponse
{
    public List<PostWithCommentsDto> Posts { get; set; }
}

public class PostWithCommentsDto
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<ReactionDto> Reactions { get; set; }
    public List<CommentDto> Comments { get; set; }
}

public class CommentDto
{
    public Guid Id { get; set; }
    public string? Text { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? Edited { get; set; }
    public UserDto User { get; set; }
    public List<ReactionDto> Reactions { get; set; }
}

public class UserDto
{
    public Guid Id { get; set; }
    public string UserName { get; set; }
    public UserStyleDto Style { get; set; }
}

public class ReactionDto
{
    public Guid Id { get; set; }
    public string Type { get; set; }
    public Guid UserId { get; set; }
}