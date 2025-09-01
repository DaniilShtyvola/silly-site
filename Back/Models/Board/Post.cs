using System.ComponentModel.DataAnnotations;

public class Post
{
    [Key]
    public string Id { get; set; }
    public string? ContentJson { get; set; }
    public bool IsPinned { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}