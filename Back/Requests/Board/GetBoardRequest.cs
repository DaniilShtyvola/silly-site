public class GetBoardRequest
{
    public int Skip { get; set; } = 0;
    public int Take { get; set; } = 4;
    public string? Category { get; set; }
    public string? SessionId { get; set; }
}
