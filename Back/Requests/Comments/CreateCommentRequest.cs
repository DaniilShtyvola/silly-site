public class CreateCommentRequest
{
    public Guid CatId { get; set; }
    public string Text { get; set; } = string.Empty;
}