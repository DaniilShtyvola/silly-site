public class CreateReactionRequest
{
    public Guid TargetId { get; set; }
    public string TargetType { get; set; } 
    public string Type { get; set; }
}