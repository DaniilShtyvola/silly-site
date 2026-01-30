using Microsoft.EntityFrameworkCore;

public interface ILogService
{
    Task CreateLogAsync(string message, string logType, string? sessionId = null, string? userName = null);
}

public class LogService : ILogService
{
    private readonly MainDbContext _context;

    public LogService(MainDbContext context)
    {
        _context = context;
    }

    public async Task CreateLogAsync(string message, string logType, string? sessionId = null, string? userName = null)
    {
        SessionInfo? session = null;

        if (!string.IsNullOrEmpty(sessionId))
        {
            session = await _context.SessionInfos.FirstOrDefaultAsync(s => s.Id == sessionId);

            if (session != null && !string.IsNullOrEmpty(userName))
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
                if (user != null && session.UserId != user.Id)
                {
                    session.UserId = user.Id;
                    _context.SessionInfos.Update(session);
                    await _context.SaveChangesAsync();
                }
            }
        }

        if (session == null && !string.IsNullOrEmpty(userName))
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
            if (user != null)
            {
                session = await _context.SessionInfos
                    .Where(s => s.UserId == user.Id)
                    .OrderByDescending(s => s.LastSeen)
                    .FirstOrDefaultAsync();
            }
        }

        if (session == null)
        {
            return;
        }

        var log = new Log
        {
            Id = ShortUlid.NewId(),
            SessionInfoId = session.Id,
            Message = message,
            LogType = logType,
            CreatedAt = DateTime.UtcNow
        };

        _context.Logs.Add(log);
        session.LogCount++;
        session.LastSeen = DateTime.UtcNow;
        _context.SessionInfos.Update(session);

        await _context.SaveChangesAsync();
    }
}