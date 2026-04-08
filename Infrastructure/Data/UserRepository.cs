using Core.Entities;
using Core.Interfaces;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public class UserRepository : IUserRepository
{
    private readonly StoreContext _context;

    public UserRepository(StoreContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<User> CreateAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task SaveRefreshTokenAsync(RefreshToken token)
    {
        _context.RefreshTokens.Add(token);
        await _context.SaveChangesAsync();
    }

    public async Task<RefreshToken?> GetRefreshTokenByHashAsync(string hash)
    {
        return await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.TokenHash == hash && !rt.IsRevoked);
    }

    public async Task RevokeAllUserRefreshTokensAsync(int userId)
    {
        var tokens = await _context.RefreshTokens
            .Where(rt => rt.UserId == userId && !rt.IsRevoked)
            .ToListAsync();
        foreach (var token in tokens)
            token.IsRevoked = true;
        await _context.SaveChangesAsync();
    }
}
