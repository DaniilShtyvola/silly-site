public class CatResponse
{
    public string Name { get; set; }
    public string Description { get; set; }
    public string NormalizedName { get; set; }
    public List<ImageResponse> Images { get; set; }
    public List<ReactionResponse> Reactions { get; set; }
    public List<CommentResponse> Comments { get; set; }
}

public class ImageResponse
{
    public string Base64 { get; set; }
}

public class ReactionResponse
{
    public Guid Id { get; set; }
    public string UserName { get; set; }
    public string Type { get; set; }
}
public class CommentResponse
{
    public Guid Id { get; set; }
    public string UserName { get; set; }
    public string Text { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<ReactionResponse> Reactions { get; set; }
}

