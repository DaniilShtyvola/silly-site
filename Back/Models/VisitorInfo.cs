using System.ComponentModel.DataAnnotations;

public class VisitorInfo
{
    [Key]
    public Guid Id { get; set; }
    public string UserAgent { get; set; } = string.Empty;
    public string Language { get; set; } = string.Empty;
    public string Platform { get; set; } = string.Empty;
    public string Timezone { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public Guid? UserId { get; set; }
    public User? User { get; set; }

    public ICollection<Log> Logs { get; set; } = new List<Log>();
}