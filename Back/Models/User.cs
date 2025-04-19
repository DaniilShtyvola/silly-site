using System.ComponentModel.DataAnnotations;

public class User
{
    [Key]
    public Guid Id { get; set; }
    public required string UserName { get; set; }
    public required string PasswordHash { get; set; }
    public bool IsAdmin { get; set; } = false;
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLogin { get; set; }
    public string AvatarBase64 { get; set; }
    public ICollection<VisitorInfo> VisitorInfos { get; set; } = new List<VisitorInfo>();
}