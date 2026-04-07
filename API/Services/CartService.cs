using Core.Entities;
using StackExchange.Redis;
using System.Text.Json;

namespace API.Services
{
    public class CartService
    {
        private readonly IDatabase _db;

        public CartService(RedisService redisService)
        {
            _db = redisService.GetDb();
        }

        public async Task<Cart> GetCartAsync(string userId)
        {
            var data = await _db.StringGetAsync(userId);
            return data.IsNullOrEmpty 
                ? new Cart { UserId = userId } 
                : JsonSerializer.Deserialize<Cart>((string)data!)!;
        }

        public async Task SaveCartAsync(Cart cart)
        {
            var json = JsonSerializer.Serialize(cart);
            await _db.StringSetAsync(cart.UserId, json);
        }

        public async Task AddItemAsync(string userId, CartItem item)
        {
            var cart = await GetCartAsync(userId);
            var existing = cart.Items.FirstOrDefault(i => i.ProductId == item.ProductId);
            if (existing != null)
                existing.Quantity += item.Quantity;
            else
                cart.Items.Add(item);

            await SaveCartAsync(cart);
        }

        public async Task RemoveItemAsync(string userId, int productId)
        {
            var cart = await GetCartAsync(userId);
            cart.Items.RemoveAll(i => i.ProductId == productId);
            await SaveCartAsync(cart);
        }
    }
}