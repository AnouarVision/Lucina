using Core.Entities;
using Core.Interfaces;
using Infrastructure.Services;
using Moq;

namespace Lucina.Tests;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _repoMock = new();

    private AuthService CreateService() =>
        new AuthService(_repoMock.Object, "super-secret-key-for-testing-32chars!", 60);

    [Fact]
    public async Task Register_WithValidData_CreatesUser()
    {
        _repoMock.Setup(r => r.GetByEmailAsync("alice@example.com")).ReturnsAsync((User?)null);
        _repoMock.Setup(r => r.CreateAsync(It.IsAny<User>()))
                 .ReturnsAsync((User u) => u);

        var svc = CreateService();
        var (success, message, user) = await svc.SignupAsync("Alice", "alice@example.com", "password123");

        Assert.True(success);
        Assert.NotNull(user);
        Assert.Equal("Alice", user.Name);
        Assert.Equal("alice@example.com", user.Email);
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_Returns400()
    {
        var existing = new User { Name = "Bob", Email = "bob@example.com", PasswordHash = "hash" };
        _repoMock.Setup(r => r.GetByEmailAsync("bob@example.com")).ReturnsAsync(existing);

        var svc = CreateService();
        var (success, message, user) = await svc.SignupAsync("Bob2", "bob@example.com", "password123");

        Assert.False(success);
        Assert.Contains("already exists", message, StringComparison.OrdinalIgnoreCase);
        Assert.Null(user);
    }

    [Fact]
    public async Task Register_PasswordIsHashed()
    {
        const string plainPassword = "myplainpassword";
        User? createdUser = null;

        _repoMock.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync((User?)null);
        _repoMock.Setup(r => r.CreateAsync(It.IsAny<User>()))
                 .Callback<User>(u => createdUser = u)
                 .ReturnsAsync((User u) => u);

        var svc = CreateService();
        await svc.SignupAsync("Charlie", "charlie@example.com", plainPassword);

        Assert.NotNull(createdUser);
        Assert.NotEqual(plainPassword, createdUser!.PasswordHash);
        Assert.True(BCrypt.Net.BCrypt.Verify(plainPassword, createdUser.PasswordHash));
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsTokens()
    {
        var user = new User
        {
            Name = "Dave",
            Email = "dave@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("correct-pass")
        };
        _repoMock.Setup(r => r.GetByEmailAsync("dave@example.com")).ReturnsAsync(user);
        _repoMock.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);

        var svc = CreateService();
        var (success, message, result) = await svc.LoginAsync("dave@example.com", "correct-pass");

        Assert.True(success);
        Assert.NotNull(result);
    }

    [Fact]
    public async Task Login_WithWrongPassword_Returns401()
    {
        var user = new User
        {
            Name = "Eve",
            Email = "eve@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("real-pass")
        };
        _repoMock.Setup(r => r.GetByEmailAsync("eve@example.com")).ReturnsAsync(user);

        var svc = CreateService();
        var (success, message, result) = await svc.LoginAsync("eve@example.com", "wrong-pass");

        Assert.False(success);
        Assert.Equal("Invalid credentials", message);
        Assert.Null(result);
    }

    [Fact]
    public async Task Login_WithUnknownEmail_Returns401()
    {
        _repoMock.Setup(r => r.GetByEmailAsync("unknown@example.com")).ReturnsAsync((User?)null);

        var svc = CreateService();
        var (success, message, result) = await svc.LoginAsync("unknown@example.com", "any-pass");

        Assert.False(success);
        Assert.Equal("Invalid credentials", message);
        Assert.Null(result);
    }

    [Fact]
    public async Task Login_ErrorMessage_IsIdenticalForBothFailureCases()
    {
        var user = new User
        {
            Name = "Frank",
            Email = "frank@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("real-pass")
        };
        _repoMock.Setup(r => r.GetByEmailAsync("frank@example.com")).ReturnsAsync(user);
        _repoMock.Setup(r => r.GetByEmailAsync("nobody@example.com")).ReturnsAsync((User?)null);

        var svc = CreateService();
        var (_, msgWrongPassword, _) = await svc.LoginAsync("frank@example.com", "wrong");
        var (_, msgUnknownEmail, _) = await svc.LoginAsync("nobody@example.com", "any");

        Assert.Equal(msgWrongPassword, msgUnknownEmail);
    }

    [Fact]
    public async Task Refresh_WithValidToken_RotatesTokens()
    {
        const string plainToken = "valid-plain-token";
        var hash = Convert.ToBase64String(
            System.Security.Cryptography.SHA256.HashData(
                System.Text.Encoding.UTF8.GetBytes(plainToken)));

        var user = new User { Id = 1, Name = "Grace", Email = "grace@example.com", PasswordHash = "h" };
        var storedToken = new RefreshToken
        {
            UserId = 1,
            TokenHash = hash,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsRevoked = false,
            User = user
        };

        _repoMock.Setup(r => r.GetRefreshTokenByHashAsync(hash)).ReturnsAsync(storedToken);
        _repoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(user);
        _repoMock.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);
        _repoMock.Setup(r => r.SaveRefreshTokenAsync(It.IsAny<RefreshToken>())).Returns(Task.CompletedTask);

        var svc = CreateService();
        var result = await svc.ValidateRefreshTokenAsync(plainToken);

        Assert.NotNull(result);
        Assert.True(storedToken.IsRevoked);
    }

    [Fact]
    public async Task Refresh_WithExpiredToken_Returns401()
    {
        const string plainToken = "expired-token";
        var hash = Convert.ToBase64String(
            System.Security.Cryptography.SHA256.HashData(
                System.Text.Encoding.UTF8.GetBytes(plainToken)));

        var storedToken = new RefreshToken
        {
            UserId = 1,
            TokenHash = hash,
            ExpiresAt = DateTime.UtcNow.AddDays(-1),
            IsRevoked = false,
            User = new User { Name = "H", Email = "h@e.com", PasswordHash = "h" }
        };

        _repoMock.Setup(r => r.GetRefreshTokenByHashAsync(hash)).ReturnsAsync(storedToken);

        var svc = CreateService();
        var result = await svc.ValidateRefreshTokenAsync(plainToken);

        Assert.Null(result);
    }

    [Fact]
    public async Task Refresh_WithRevokedToken_Returns401()
    {
        const string plainToken = "revoked-token";
        var hash = Convert.ToBase64String(
            System.Security.Cryptography.SHA256.HashData(
                System.Text.Encoding.UTF8.GetBytes(plainToken)));

        var storedToken = new RefreshToken
        {
            UserId = 1,
            TokenHash = hash,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsRevoked = true,
            User = new User { Name = "I", Email = "i@e.com", PasswordHash = "h" }
        };

        _repoMock.Setup(r => r.GetRefreshTokenByHashAsync(hash)).ReturnsAsync(storedToken);

        var svc = CreateService();
        var result = await svc.ValidateRefreshTokenAsync(plainToken);

        Assert.Null(result);
    }

    [Fact]
    public async Task Refresh_TokenIsStoredHashed()
    {
        RefreshToken? savedToken = null;
        var user = new User { Id = 42, Name = "Jane", Email = "jane@example.com", PasswordHash = "h" };

        _repoMock.Setup(r => r.GetByIdAsync(42)).ReturnsAsync(user);
        _repoMock.Setup(r => r.SaveRefreshTokenAsync(It.IsAny<RefreshToken>()))
                 .Callback<RefreshToken>(t => savedToken = t)
                 .Returns(Task.CompletedTask);

        var svc = CreateService();
        var rawToken = await svc.GenerateRefreshTokenAsync(user);

        Assert.NotNull(savedToken);
        Assert.NotEqual(rawToken, savedToken!.TokenHash);
    }

    [Fact]
    public async Task Logout_RevokesRefreshToken()
    {
        const string plainToken = "to-revoke";
        var hash = Convert.ToBase64String(
            System.Security.Cryptography.SHA256.HashData(
                System.Text.Encoding.UTF8.GetBytes(plainToken)));

        var storedToken = new RefreshToken
        {
            UserId = 1,
            TokenHash = hash,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsRevoked = false,
            User = new User { Name = "K", Email = "k@e.com", PasswordHash = "h" }
        };

        _repoMock.Setup(r => r.GetRefreshTokenByHashAsync(hash)).ReturnsAsync(storedToken);
        _repoMock.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);

        var svc = CreateService();
        await svc.RevokeRefreshTokenAsync(plainToken);

        Assert.True(storedToken.IsRevoked);
    }
}
