using Core.Interfaces;
using StackExchange.Redis;

namespace API.Services;

public class StockReservationService : IStockReservationService
{
    private readonly IDatabase _db;
    private static readonly TimeSpan Ttl = TimeSpan.FromMinutes(10);

    public StockReservationService(RedisService redisService)
    {
        _db = redisService.GetDb();
    }

    private static string HashKey(int productId) => $"cart:resv:{productId}";
    private static string TtlKey(int productId, string userId) => $"cart:resv:ttl:{productId}:{userId}";

    public async Task ReserveAsync(string userId, int productId, int quantity)
    {
        await _db.HashSetAsync(HashKey(productId), userId, quantity);
        await _db.StringSetAsync(TtlKey(productId, userId), "1", Ttl);
    }

    public async Task ReleaseAsync(string userId, int productId)
    {
        await _db.HashDeleteAsync(HashKey(productId), userId);
        await _db.KeyDeleteAsync(TtlKey(productId, userId));
    }

    public async Task<int> GetTotalReservedAsync(int productId)
    {
        var entries = await _db.HashGetAllAsync(HashKey(productId));
        if (entries.Length == 0) return 0;

        int total = 0;
        var staleKeys = new List<RedisValue>();

        foreach (var entry in entries)
        {
            if (await _db.KeyExistsAsync(TtlKey(productId, entry.Name!)))
            {
                total += (int)entry.Value;
            }
            else
            {
                staleKeys.Add(entry.Name);
            }
        }

        if (staleKeys.Count > 0)
            await _db.HashDeleteAsync(HashKey(productId), [.. staleKeys]);

        return total;
    }

    public async Task<int> GetUserReservedAsync(string userId, int productId)
    {
        if (!await _db.KeyExistsAsync(TtlKey(productId, userId)))
            return 0;

        var val = await _db.HashGetAsync(HashKey(productId), userId);
        return val.HasValue ? (int)val : 0;
    }

    public async Task RefreshForUserAsync(string userId, IEnumerable<int> productIds)
    {
        var tasks = productIds
            .Select(pid => _db.KeyExpireAsync(TtlKey(pid, userId), Ttl))
            .ToList();
        await Task.WhenAll(tasks);
    }
}
