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
        public async Task<IActionResult> CreateLog([FromBody] LogCreateRequest request)
        {
            // Get the IP address from the request headers or connection
            var forwardedFor = HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            var ip = forwardedFor ?? HttpContext.Connection.RemoteIpAddress?.ToString();

            // Get the JWT token from the Authorization header
            var token = HttpContext.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();

            VisitorInfo? visitorInfo = null;

            if (!string.IsNullOrEmpty(token))
            {
                // If a token is present, validate it and extract the username
                try
                {
                    var handler = new JwtSecurityTokenHandler();
                    var key = Encoding.ASCII.GetBytes(_jwtSettings.SecretKey);  // Get the secret key from config
                    var tokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = false,
                        ValidateAudience = false,
                        ValidateLifetime = true,
                        IssuerSigningKey = new SymmetricSecurityKey(key)
                    };

                    var principal = handler.ValidateToken(token, tokenValidationParameters, out var validatedToken);
                    var username = principal?.Identity?.Name;

                    if (username != null)
                    {
                        // Search for an existing VisitorInfo based on session data
                        visitorInfo = await _context.VisitorInfos
                            .Where(v => v.UserAgent == request.ClientInfo.UserAgent &&
                                        v.Language == request.ClientInfo.Language &&
                                        v.Platform == request.ClientInfo.Platform &&
                                        v.Timezone == request.ClientInfo.Timezone &&
                                        v.IpAddress == ip)
                            .FirstOrDefaultAsync();

                        if (visitorInfo != null)
                        {
                            // Check if VisitorInfo already has a UserId
                            if (!visitorInfo.UserId.HasValue)
                            {
                                // If UserId is null, set it from the JWT token
                                var user = await _context.Users
                                    .Where(u => u.UserName == username)
                                    .FirstOrDefaultAsync();

                                if (user != null)
                                {
                                    visitorInfo.UserId = user.Id;
                                    _context.VisitorInfos.Update(visitorInfo);
                                    await _context.SaveChangesAsync();
                                }
                            }
                            else
                            {
                                // If UserId is set, ensure it matches the user in the token
                                var user = await _context.Users
                                    .Where(u => u.UserName == username)
                                    .FirstOrDefaultAsync();

                                if (user != null && visitorInfo.UserId != user.Id)
                                {
                                    // Create a new VisitorInfo if UserId does not match
                                    visitorInfo = new VisitorInfo
                                    {
                                        UserAgent = request.ClientInfo.UserAgent,
                                        Language = request.ClientInfo.Language,
                                        Platform = request.ClientInfo.Platform,
                                        Timezone = request.ClientInfo.Timezone,
                                        IpAddress = ip ?? "unknown",
                                        UserId = user.Id  // Set the correct UserId from the token
                                    };

                                    _context.VisitorInfos.Add(visitorInfo);
                                    await _context.SaveChangesAsync();
                                }
                            }
                        }
                    }
                }
                catch (Exception)
                {
                    return Unauthorized(new { message = "Invalid token" });
                }
            }

            // If no token is provided or token validation failed, find or create VisitorInfo
            if (visitorInfo == null)
            {
                visitorInfo = await _context.VisitorInfos
                    .Where(v => v.UserAgent == request.ClientInfo.UserAgent &&
                                v.Language == request.ClientInfo.Language &&
                                v.Platform == request.ClientInfo.Platform &&
                                v.Timezone == request.ClientInfo.Timezone &&
                                v.IpAddress == ip)
                    .FirstOrDefaultAsync();

                if (visitorInfo == null)
                {
                    // Create a new VisitorInfo for a new visitor if none found
                    visitorInfo = new VisitorInfo
                    {
                        UserAgent = request.ClientInfo.UserAgent,
                        Language = request.ClientInfo.Language,
                        Platform = request.ClientInfo.Platform,
                        Timezone = request.ClientInfo.Timezone,
                        IpAddress = ip ?? "unknown"
                    };
                    _context.VisitorInfos.Add(visitorInfo);
                    await _context.SaveChangesAsync();
                }
            }

            // Create the log entry associated with the found VisitorInfo
            var log = new Log
            {
                VisitorInfoId = visitorInfo.Id,  // Associate the log with the VisitorInfo
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
