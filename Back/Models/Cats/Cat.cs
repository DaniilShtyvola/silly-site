using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Cat
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    [Required]
    [MaxLength(100)]
    public string Name { get; set; }
    [Required]
    [MaxLength(100)]
    public string NormalizedName { get; set; }
    [MaxLength(1000)]
    public string Description { get; set; }
    public List<CatImage> Images { get; set; }
    public List<CatSocialLink> SocialLinks { get; set; }
    public List<CatComment> Comments { get; set; }
    public List<CatReaction> Reactions { get; set; }
}