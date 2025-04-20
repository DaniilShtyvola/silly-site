public class CatCreateRequest
{
    public string Name { get; set; } = string.Empty;
    public string NormalizedName { get; set; }
    public string Description { get; set; } = string.Empty;
    public List<CatImageRequest> Images { get; set; } = new();
    public List<CatSocialLinkRequest> SocialLinks { get; set; } = new();
}