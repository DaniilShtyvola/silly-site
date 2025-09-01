using System.ComponentModel.DataAnnotations;

public class Reaction
{
    public string Type { get; set; }
    public string ParentId { get; set; }
    public string UserIds { get; set; }
}
