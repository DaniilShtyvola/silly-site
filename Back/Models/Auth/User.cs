using System.ComponentModel.DataAnnotations;

public class User
{
    [Key]
    public required string Id { get; set; }

    [MaxLength(25)]
    public required string UserName { get; set; }
    public required string PasswordHash { get; set; }
    public bool IsAdmin { get; set; } = false;
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLogin { get; set; }

    public string? AvatarIcon { get; set; }
    [MaxLength(15)]
    public string? AvatarColor { get; set; }
    [MaxLength(20)]
    public string? AvatarDirection { get; set; }
    [MaxLength(15)]
    public string? UserNameColor { get; set; }

    public ICollection<SessionInfo> SessionInfos { get; set; } = new List<SessionInfo>();
}
