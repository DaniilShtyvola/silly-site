public class CreateCommentRequest
{
    public Guid? PostId { get; set; }
    public Guid? ParentCommentId { get; set; }
    public string Text { get; set; }
}