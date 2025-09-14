using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[ApiController]
[Route("logs")]
public class LogsController : ControllerBase
{
    private readonly MainDbContext _context;
    private readonly JwtSettings _jwtSettings;

    public LogsController(MainDbContext context, IOptions<JwtSettings> jwtSettings)
    {
        _context = context;
        _jwtSettings = jwtSettings.Value;
    }

    [HttpPost]
    public async Task<IActionResult> CreateLog([FromBody] CreateLogRequest request)
    {
        if (request?.ClientInfo == null)
            return BadRequest("Missing client info.");

        var ip = GetClientIp();
        var token = GetJwtTokenFromHeader();
        SessionInfo? session = null;

        string? userName = null;

        if (!string.IsNullOrEmpty(token))
        {
            var principal = ValidateJwtToken(token);
            userName = principal?.Claims.FirstOrDefault(c => c.Type == "userName")?.Value;

            if (!string.IsNullOrEmpty(userName))
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
                if (user != null)
                {
                    session = await FindMatchingSession(request, ip);

                    if (session == null || session.UserId != user.Id)
                    {
                        session = new SessionInfo
                        {
                            Id = ShortUlid.NewId(),
                            UserAgent = request.ClientInfo.UserAgent,
                            Language = request.ClientInfo.Language,
                            Platform = request.ClientInfo.Platform,
                            Timezone = request.ClientInfo.Timezone,
                            IpAddress = ip ?? "unknown",
                            UserId = user.Id
                        };

                        _context.SessionInfos.Add(session);
                        await _context.SaveChangesAsync();
                    }
                    else if (session.UserId != null)
                    {
                        session.UserId = user.Id;
                        _context.SessionInfos.Update(session);
                        await _context.SaveChangesAsync();
                    }
                }
            }
        }

        if (session == null)
        {
            session = await FindMatchingSession(request, ip);

            if (session == null)
            {
                session = new SessionInfo
                {
                    Id = ShortUlid.NewId(),
                    UserAgent = request.ClientInfo.UserAgent,
                    Language = request.ClientInfo.Language,
                    Platform = request.ClientInfo.Platform,
                    Timezone = request.ClientInfo.Timezone,
                    IpAddress = ip ?? "unknown"
                };
                _context.SessionInfos.Add(session);
                await _context.SaveChangesAsync();
            }
        }

        var log = new Log
        {
            Id = ShortUlid.NewId(),
            SessionInfoId = session.Id,
            Message = request.Message,
            LogType = request.LogType,
            CreatedAt = DateTime.UtcNow
        };

        _context.Logs.Add(log);
        await _context.SaveChangesAsync();

        return Ok(new { success = true });
    }

    private string GetClientIp()
    {
        return HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault()
            ?? HttpContext.Connection.RemoteIpAddress?.ToString();
    }

    private string? GetJwtTokenFromHeader()
    {
        return HttpContext.Request.Headers.Authorization.FirstOrDefault()?.Split(" ").Last();
    }

    private ClaimsPrincipal ValidateJwtToken(string token)
    {
        var handler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_jwtSettings.SecretKey);

        var parameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuerSigningKey = true
        };

        var principal = handler.ValidateToken(token, parameters, out var validatedToken);

        if (validatedToken is not JwtSecurityToken jwtToken ||
            jwtToken.Header.Alg != SecurityAlgorithms.HmacSha256)
        {
            throw new SecurityTokenException("Invalid token algorithm");
        }

        return principal;
    }

    private async Task<SessionInfo?> FindMatchingSession(CreateLogRequest request, string? ip)
    {
        return await _context.SessionInfos.FirstOrDefaultAsync(v =>
            v.UserAgent == request.ClientInfo.UserAgent &&
            v.Language == request.ClientInfo.Language &&
            v.Platform == request.ClientInfo.Platform &&
            v.Timezone == request.ClientInfo.Timezone &&
            v.IpAddress == ip
        );
    }
}