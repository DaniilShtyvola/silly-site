using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

public class CatImage
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Base64Data { get; set; }
    public Guid CatId { get; set; }
    [ForeignKey("CatId")]
    public Cat Cat { get; set; }
}
