public class CreateReactionRequest
{
    public string Type { get; set; }
    public Guid? PostId { get; set; }
    public Guid? CommentId { get; set; }
}