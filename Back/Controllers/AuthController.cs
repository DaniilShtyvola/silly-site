using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

namespace Controllers
{
    [Route("auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly MainDbContext _context;
        private readonly JwtSettings _jwtSettings;

        public AuthController(MainDbContext context, IOptions<JwtSettings> jwtSettings)
        {
            _context = context;
            _jwtSettings = jwtSettings.Value;
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterUser([FromBody] RegisterRequest request)
        {
            return await Register(request, false);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == request.UserName);

            if (user == null || !VerifyPassword(request.Password, user.PasswordHash))
                return Unauthorized("Invalid username or password.");

            var token = GenerateJwtToken(user);

            user.LastLogin = DateTime.UtcNow;
            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Ok(new { Token = token });
        }

        private async Task<IActionResult> Register(RegisterRequest request, bool isAdmin)
        {
            if (await _context.Users.AnyAsync(u => u.UserName == request.UserName))
                return BadRequest("This username is already taken.");

            if (string.IsNullOrWhiteSpace(request.UserName))
                return BadRequest("Username cannot be empty or whitespace.");

            if (request.UserName != request.UserName.Trim())
                return BadRequest("Username cannot start or end with spaces.");

            if (request.UserName.Contains(" "))
                return BadRequest("Username cannot contain spaces.");

            if (request.UserName.Length < 6)
                return BadRequest("Username must be at least 6 characters long.");

            if (request.Password != request.Password.Trim())
                return BadRequest("Password cannot start or end with spaces.");

            var passwordHash = HashPassword(request.Password);

            var user = new User
            {
                UserName = request.UserName,
                PasswordHash = passwordHash,
                IsAdmin = isAdmin,
                CreatedAt = DateTime.UtcNow,
                LastLogin = null,
                AvatarIcon = "faUser",
                AvatarColor = "#898F96"
            };

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            return Ok(new { Message = isAdmin ? "Admin registered successfully." : "User registered successfully." });
        }
        private string HashPassword(string password)
        {
            var salt = new byte[16];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(salt);
            }

            var hashed = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                password: password,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA256,
                iterationCount: 10000,
                numBytesRequested: 32));

            return $"{Convert.ToBase64String(salt)}:{hashed}";
        }

        private bool VerifyPassword(string enteredPassword, string storedPasswordHash)
        {
            var parts = storedPasswordHash.Split(':');
            var salt = Convert.FromBase64String(parts[0]);
            var hash = parts[1];

            var enteredHash = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                password: enteredPassword,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA256,
                iterationCount: 10000,
                numBytesRequested: 32));

            return hash == enteredHash;
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim("userName", user.UserName),
                new Claim("isAdmin", user.IsAdmin.ToString().ToLower())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
