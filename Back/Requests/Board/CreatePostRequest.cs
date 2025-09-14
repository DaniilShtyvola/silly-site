public class CreatePostRequest
{
    public string ContentJson { get; set; }
    public string Category { get; set; }
    public bool IsPinned { get; set; } = false;
}