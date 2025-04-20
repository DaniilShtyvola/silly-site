using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

public class CatComment
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    [Required]
    public string Text { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Guid UserId { get; set; }
    public Guid CatId { get; set; }
    [ForeignKey("CatId")]
    public Cat Cat { get; set; }
}
