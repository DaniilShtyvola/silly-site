using System.ComponentModel.DataAnnotations;

public class Comment
{
    [Key]
    public string Id { get; set; } = ShortUlid.NewId();

    public string? Text { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsEdited { get; set; } = false;
    public bool IsDeleted { get; set; } = false;

    [Required]
    public string UserId { get; set; }
    public User User { get; set; }

    [Required]
    public string ParentId { get; set; }
}
