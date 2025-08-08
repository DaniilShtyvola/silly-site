public class UserInfoResponse
{
    public DateTime RegisteredAt { get; set; }
    public int CommentsCount { get; set; }
    public List<UserCommentDto> LastComments { get; set; } = new();
    public Dictionary<string, int> ReceivedReactionsCountByType { get; set; } = new();
    public Dictionary<string, int> UserReactionsCountByType { get; set; } = new();
    public string AvatarIcon { get; set; } = string.Empty;
    public string AvatarColor { get; set; } = string.Empty;
}

public class UserCommentDto
{
    public Guid Id { get; set; }
    public string Text { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public Dictionary<string, int> Reactions { get; set; } = new();
}