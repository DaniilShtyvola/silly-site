using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Back.Controllers
{
    [ApiController]
    [Route("logs")]
    public class LogsController : ControllerBase
    {
        private readonly MainDbContext _context;
        private readonly JwtSettings _jwtSettings;

        public LogsController(MainDbContext context, IOptions<JwtSettings> jwtSettings)
        {
            _context = context;
            _jwtSettings = jwtSettings.Value;  // Access the secret key from the configuration
        }

        [HttpPost]
        public async Task<IActionResult> CreateLog([FromBody] CreateLogRequest request)
        {
            // Get the IP address from the request headers or connection
            var forwardedFor = HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            var ip = forwardedFor ?? HttpContext.Connection.RemoteIpAddress?.ToString();

            // Get the JWT token from the Authorization header
            var token = HttpContext.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();

            SessionInfo? SessionInfo = null;

            if (!string.IsNullOrEmpty(token))
            {
                try
                {
                    var handler = new JwtSecurityTokenHandler();
                    var key = Encoding.ASCII.GetBytes(_jwtSettings.SecretKey);
                    var tokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = false,
                        ValidateAudience = false,
                        ValidateLifetime = true,
                        IssuerSigningKey = new SymmetricSecurityKey(key)
                    };

                    var principal = handler.ValidateToken(token, tokenValidationParameters, out var validatedToken);
                    var username = principal.Claims.FirstOrDefault(c => c.Type == "userName")?.Value;

                    Console.WriteLine($"Username from token: {username}");

                    if (username != null)
                    {
                        SessionInfo = await _context.SessionInfos
                            .Where(v => v.UserAgent == request.ClientInfo.UserAgent &&
                                        v.Language == request.ClientInfo.Language &&
                                        v.Platform == request.ClientInfo.Platform &&
                                        v.Timezone == request.ClientInfo.Timezone &&
                                        v.IpAddress == ip)
                            .FirstOrDefaultAsync();

                        if (SessionInfo != null)
                        {
                            Console.WriteLine($"Found SessionInfo with UserId: {SessionInfo.UserId}");

                            var user = await _context.Users
                                .Where(u => u.UserName == username)
                                .FirstOrDefaultAsync();

                            if (user == null)
                            {
                                Console.WriteLine("User not found in DB");
                            }
                            else
                            {
                                if (!SessionInfo.UserId.HasValue)
                                {
                                    SessionInfo.UserId = user.Id;
                                    _context.SessionInfos.Update(SessionInfo);
                                    await _context.SaveChangesAsync();
                                    Console.WriteLine($"Updated SessionInfo.UserId to {user.Id}");
                                }
                                else if (SessionInfo.UserId != user.Id)
                                {
                                    // Create new SessionInfo if UserId mismatch
                                    SessionInfo = new SessionInfo
                                    {
                                        UserAgent = request.ClientInfo.UserAgent,
                                        Language = request.ClientInfo.Language,
                                        Platform = request.ClientInfo.Platform,
                                        Timezone = request.ClientInfo.Timezone,
                                        IpAddress = ip ?? "unknown",
                                        UserId = user.Id
                                    };
                                    _context.SessionInfos.Add(SessionInfo);
                                    await _context.SaveChangesAsync();
                                    Console.WriteLine("Created new SessionInfo with correct UserId");
                                }
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Token validation error: {ex.Message}");
                    return Unauthorized(new { message = "Invalid token" });
                }
            }

            // If no token is provided or token validation failed, find or create SessionInfo
            if (SessionInfo == null)
            {
                SessionInfo = await _context.SessionInfos
                    .Where(v => v.UserAgent == request.ClientInfo.UserAgent &&
                                v.Language == request.ClientInfo.Language &&
                                v.Platform == request.ClientInfo.Platform &&
                                v.Timezone == request.ClientInfo.Timezone &&
                                v.IpAddress == ip)
                    .FirstOrDefaultAsync();

                if (SessionInfo == null)
                {
                    // Create a new SessionInfo for a new Session if none found
                    SessionInfo = new SessionInfo
                    {
                        UserAgent = request.ClientInfo.UserAgent,
                        Language = request.ClientInfo.Language,
                        Platform = request.ClientInfo.Platform,
                        Timezone = request.ClientInfo.Timezone,
                        IpAddress = ip ?? "unknown"
                    };
                    _context.SessionInfos.Add(SessionInfo);
                    await _context.SaveChangesAsync();
                }
            }

            // Create the log entry associated with the found SessionInfo
            var log = new Log
            {
                SessionInfoId = SessionInfo.Id,  // Associate the log with the SessionInfo
                Message = request.Message,
                LogType = request.LogType,
                CreatedAt = DateTime.UtcNow  // Set the log creation timestamp
            };

            _context.Logs.Add(log);
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }
    }
}
