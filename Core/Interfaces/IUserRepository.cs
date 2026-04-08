using Core.Entities;

namespace Core.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(int id);
    Task<User> CreateAsync(User user);
    Task SaveChangesAsync();
    Task SaveRefreshTokenAsync(RefreshToken token);
    Task<RefreshToken?> GetRefreshTokenByHashAsync(string hash);
    Task RevokeAllUserRefreshTokensAsync(int userId);
}
