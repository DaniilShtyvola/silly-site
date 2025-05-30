public class CreateCatRequest
{
    public string Name { get; set; } = string.Empty;
    public string NormalizedName { get; set; }
    public string Description { get; set; } = string.Empty;
    public List<CatImageRequest> Images { get; set; } = new();
    public List<CatSocialLinkRequest> SocialLinks { get; set; } = new();
}

public class CatSocialLinkRequest
{
    public string Link { get; set; } = string.Empty;
    public string Platform { get; set; } = string.Empty;
}

public class CatImageRequest
{
    public string Base64Data { get; set; } = string.Empty;
}