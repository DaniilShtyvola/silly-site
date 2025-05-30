using System.ComponentModel.DataAnnotations;

public class Reaction
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    [Required]
    public Guid UserId { get; set; }
    public User User { get; set; }
    [Required]
    public string Type { get; set; }
    [Required]
    public Guid TargetId { get; set; }
    [Required]
    [MaxLength(20)]
    public string TargetType { get; set; }
}