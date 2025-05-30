public class UserInfoResponse
{
    public DateTime RegisteredAt { get; set; }
    public int CatReactionsCount { get; set; }
    public int ReceivedReactionsOnCommentsCount { get; set; }
    public List<CommentMinimizedResponse> LatestComments { get; set; }
}

public class CommentMinimizedResponse
{
    public Guid Id { get; set; }
    public string Text { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CatNormalizedName { get; set; }
}
