using System.ComponentModel.DataAnnotations;

public class Comment
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    public string? Text { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? Edited { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; }

    [Required]
    public Guid PostId { get; set; }
    public Post Post { get; set; }
}