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

    public Guid? PostId { get; set; }
    public Post Post { get; set; }

    public Guid? CommentId { get; set; }
    public Comment Comment { get; set; }
}
