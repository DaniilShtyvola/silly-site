using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("tracking")]
public class TrackingController : ControllerBase
{
    private readonly MainDbContext _context;
    private readonly ILogService _logService;

    public TrackingController(MainDbContext context, ILogService logService)
    {
        _context = context;
        _logService = logService;
    }

    private string? GetUserName() =>
        User.Claims.FirstOrDefault(c => c.Type == "userName")?.Value;

    private bool IsAdmin() =>
        User.Claims.FirstOrDefault(c => c.Type == "isAdmin")?.Value == "true";

    [HttpPost("session")]
    public async Task<ActionResult<CreateSessionResponse>> CreateSession([FromBody] CreateSessionRequest request)
    {
        var ip = GetClientIp();

        var lastSession = await _context.SessionInfos
            .OrderByDescending(s => s.LastSeen)
            .FirstOrDefaultAsync();

        DateTime? lastSeenPreviousSession = lastSession?.LastSeen;

        var session = new SessionInfo
        {
            Id = ShortUlid.NewId(),
            UserAgent = request.UserAgent,
            Language = request.Language,
            Platform = request.Platform,
            Timezone = request.Timezone,
            IpAddress = ip ?? "unknown",
            FirstSeen = DateTime.UtcNow,
            LastSeen = DateTime.UtcNow,
            LogCount = 0
        };

        var userName = GetUserName();
        if (!string.IsNullOrEmpty(userName))
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
            if (user != null)
                session.UserId = user.Id;
        }

        _context.SessionInfos.Add(session);
        await _context.SaveChangesAsync();

        return Ok(new CreateSessionResponse
        {
            SessionId = session.Id,
            LastSeenPrevious = lastSeenPreviousSession
        });
    }

    [HttpPost("log")]
    public async Task<IActionResult> CreateLog([FromBody] CreateLogRequest request)
    {
        if (string.IsNullOrEmpty(request.Message) || string.IsNullOrEmpty(request.LogType))
            return BadRequest("Message and LogType are required.");

        var userName = User.Claims.FirstOrDefault(c => c.Type == "userName")?.Value;

        await _logService.CreateLogAsync(
            message: request.Message,
            logType: request.LogType,
            sessionId: request.SessionId,
            userName: userName
        );

        return Ok(new { success = true });
    }

    private string GetClientIp()
    {
        return HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault()
               ?? HttpContext.Connection.RemoteIpAddress?.ToString();
    }

    [HttpGet("sessions")]
    public async Task<ActionResult> GetSessions(
        [FromQuery] int skip = 0,
        [FromQuery] int take = 10)
    {
        if (!IsAdmin())
            return Forbid();

        var total = await _context.SessionInfos.CountAsync();

        var sessions = await _context.SessionInfos
            .Include(s => s.Logs)
            .OrderByDescending(s => s.LastSeen)
            .Skip(skip)
            .Take(take)
            .ToListAsync();

        var response = new GetSessionsResponse
        {
            TotalSessions = total,
            Sessions = sessions.Select(s => new SessionDto
            {
                Id = s.Id,
                UserAgent = s.UserAgent,
                Language = s.Language,
                Platform = s.Platform,
                Timezone = s.Timezone,
                IpAddress = s.IpAddress,
                FirstSeen = s.FirstSeen,
                LastSeen = s.LastSeen,
                LogCount = s.LogCount,
                UserId = s.UserId,
                Logs = s.Logs
                    .OrderByDescending(l => l.CreatedAt)
                    .Select(l => new LogDto
                    {
                        Id = l.Id,
                        Message = l.Message,
                        LogType = l.LogType,
                        CreatedAt = l.CreatedAt
                    })
                    .ToList()
            }).ToList()
        };

        return Ok(response);
    }

}
