using System.ComponentModel.DataAnnotations;

public class Post
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string Title { get; set; }

    public string? Content { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}