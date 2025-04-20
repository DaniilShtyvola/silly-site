using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

public class CatSocialLink
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    [Required]
    [MaxLength(50)]
    public string Platform { get; set; }
    [Required]
    [Url]
    public string Link { get; set; }
    public Guid CatId { get; set; }
    [ForeignKey("CatId")]
    public Cat Cat { get; set; }
}