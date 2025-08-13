public class UserInfoResponse
{
    public string UserName { get; set; } = string.Empty;
    public DateTime RegisteredAt { get; set; }
    public int CommentsCount { get; set; }
    public UserStyleDto Style { get; set; } = new UserStyleDto();
}