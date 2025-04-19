using System.ComponentModel.DataAnnotations;
public class Log
{
    [Key]
    public Guid Id { get; set; }
    public Guid VisitorInfoId { get; set; }
    public VisitorInfo VisitorInfo { get; set; } = null!;

    public string Message { get; set; } = string.Empty;
    public string LogType { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}