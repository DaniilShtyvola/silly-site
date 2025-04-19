public class LogCreateRequest
{
    public ClientInfoRequest ClientInfo { get; set; } = new();
    public string Message { get; set; } = string.Empty;
    public string LogType { get; set; } = string.Empty;
}

public class ClientInfoRequest
{
    public string UserAgent { get; set; } = string.Empty;
    public string Language { get; set; } = string.Empty;
    public string Platform { get; set; } = string.Empty;
    public string Timezone { get; set; } = string.Empty;
}