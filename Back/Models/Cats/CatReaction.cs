using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

public class CatReaction
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    [MaxLength(20)]
    public string Type { get; set; }
    public Guid UserId { get; set; }
    public Guid CatId { get; set; }
    [ForeignKey("CatId")]
    public Cat Cat { get; set; }
}
