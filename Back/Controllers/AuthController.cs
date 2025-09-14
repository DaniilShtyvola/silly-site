using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

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

    [HttpPost("register")]
    public async Task<IActionResult> RegisterUser([FromBody] RegisterRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.UserName == request.UserName))
            return BadRequest("This username is already taken.");

        if (string.IsNullOrWhiteSpace(request.UserName))
            return BadRequest("Username cannot be empty or whitespace.");

        if (request.UserName != request.UserName.Trim())
            return BadRequest("Username cannot start or end with spaces.");

        if (request.UserName.Contains(' '))
            return BadRequest("Username cannot contain spaces.");

        if (request.UserName.Length < 6)
            return BadRequest("Username must be at least 6 characters long.");

        if (request.UserName.Length > 25)
            return BadRequest("Username cannot be longer than 25 characters.");

        if (request.Password != request.Password.Trim())
            return BadRequest("Password cannot start or end with spaces.");

        if (request.Password.Length < 5)
            return BadRequest("Password must be at least 5 characters long.");

        if (request.Password.Length > 30)
            return BadRequest("Password cannot be longer than 30 characters.");

        var passwordHash = HashPassword(request.Password);

        var user = new User
        {
            Id = ShortUlid.NewId(),
            UserName = request.UserName,
            PasswordHash = passwordHash,
            IsAdmin = false,
            CreatedAt = DateTime.UtcNow,
            LastLogin = null,
            AvatarIcon = "faUser",
            AvatarColor = "898F96",
            AvatarDirection = "225deg",
            UserNameColor = "898F96",
        };

        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "User registered successfully." });
    }
    private static string HashPassword(string password)
    {
        byte[] salt = new byte[16];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(salt);
        }

        int iterations = 10000;

        byte[] hash = KeyDerivation.Pbkdf2(
            password: password,
            salt: salt,
            prf: KeyDerivationPrf.HMACSHA256,
            iterationCount: iterations,
            numBytesRequested: 32
        );

        return $"{iterations}.{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
    }

    private static bool VerifyPassword(string enteredPassword, string storedPasswordHash)
    {
        var parts = storedPasswordHash.Split('.');
        if (parts.Length != 3)
            return false;

        int iterations = int.Parse(parts[0]);
        byte[] salt = Convert.FromBase64String(parts[1]);
        byte[] storedHash = Convert.FromBase64String(parts[2]);

        byte[] enteredHash = KeyDerivation.Pbkdf2(
            password: enteredPassword,
            salt: salt,
            prf: KeyDerivationPrf.HMACSHA256,
            iterationCount: iterations,
            numBytesRequested: storedHash.Length
        );

        return CryptographicOperations.FixedTimeEquals(storedHash, enteredHash);
    }

    private string GenerateJwtToken(User user)
    {
        var claims = new List<Claim>
            {
                new("userId", user.Id),
                new("userName", user.UserName),
                new("isAdmin", user.IsAdmin.ToString().ToLower())
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