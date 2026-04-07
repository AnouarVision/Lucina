using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Core.Entities;
using Core.Interfaces;
using Microsoft.IdentityModel.Tokens;

namespace Infrastructure.Services;

public class UpdateProfileRequest
{
    public string? Name { get; set; }
    public string? Phone { get; set; }
    public string? Nationality { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public string? Bio { get; set; }
}

public interface IAuthService
{
    Task<(bool Success, string Message, User? User)> LoginAsync(string email, string password);
    Task<(bool Success, string Message, User? User)> SignupAsync(string name, string email, string password);
    Task<User?> GetUserByIdAsync(int userId);
    Task<(bool Success, string Message, User? User)> UpdateProfileAsync(int userId, UpdateProfileRequest request);
    string GenerateJwtToken(User user);
}

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly string _jwtSecretKey;
    private readonly int _jwtExpirationMinutes;

    public AuthService(IUserRepository userRepository, string jwtSecretKey, int jwtExpirationMinutes = 60)
    {
        _userRepository = userRepository;
        _jwtSecretKey = jwtSecretKey;
        _jwtExpirationMinutes = jwtExpirationMinutes;
    }

    public async Task<(bool Success, string Message, User? User)> LoginAsync(string email, string password)
    {
        try
        {
            var user = await _userRepository.GetByEmailAsync(email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
                return (false, "Invalid credentials", null);

            user.LastLoginDate = DateTime.UtcNow;
            await _userRepository.SaveChangesAsync();

            return (true, "Login successful", user);
        }
        catch (Exception)
        {
            return (false, "An error occurred during login", null);
        }
    }

    public async Task<(bool Success, string Message, User? User)> SignupAsync(string name, string email, string password)
    {
        try
        {
            var existingUser = await _userRepository.GetByEmailAsync(email);
            if (existingUser != null)
                return (false, "User already exists", null);

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);

            var newUser = new User
            {
                Name = name,
                Email = email,
                PasswordHash = passwordHash,
                CreatedDate = DateTime.UtcNow
            };

            await _userRepository.CreateAsync(newUser);
            return (true, "Signup successful", newUser);
        }
        catch (Exception)
        {
            return (false, "An error occurred during registration", null);
        }
    }

    public async Task<User?> GetUserByIdAsync(int userId)
    {
        return await _userRepository.GetByIdAsync(userId);
    }

    public async Task<(bool Success, string Message, User? User)> UpdateProfileAsync(int userId, UpdateProfileRequest request)
    {
        try
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                return (false, "User not found", null);

            if (!string.IsNullOrWhiteSpace(request.Name))
                user.Name = request.Name;
            if (!string.IsNullOrWhiteSpace(request.Phone))
                user.Phone = request.Phone;
            if (!string.IsNullOrWhiteSpace(request.Nationality))
                user.Nationality = request.Nationality;
            if (!string.IsNullOrWhiteSpace(request.Address))
                user.Address = request.Address;
            if (!string.IsNullOrWhiteSpace(request.City))
                user.City = request.City;
            if (!string.IsNullOrWhiteSpace(request.Country))
                user.Country = request.Country;
            if (!string.IsNullOrWhiteSpace(request.Bio))
                user.Bio = request.Bio;

            await _userRepository.SaveChangesAsync();
            return (true, "Profile updated successfully", user);
        }
        catch (Exception)
        {
            return (false, "An error occurred updating the profile", null);
        }
    }

    public string GenerateJwtToken(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_jwtSecretKey);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Role, user.IsAdmin ? "Admin" : "User")
            }),
            Expires = DateTime.UtcNow.AddMinutes(_jwtExpirationMinutes),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
