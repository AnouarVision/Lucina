using System.Text.Json;
using Core.Entities;
namespace Infrastructure.Data;

public class StoreContextSeed
{
    public static async Task SeedAsync(StoreContext context)
    {
        if (!context.Products.Any())
        {
            var productsData = await File.ReadAllTextAsync("../Infrastructure/Data/SeedData/products.json");

            var products = JsonSerializer.Deserialize<List<Product>>(productsData);

            if (products == null) return;

            context.Products.AddRange(products);

            await context.SaveChangesAsync();
        }

        if (!context.DeliveryOptions.Any())
        {
            var deliveryData = await File.ReadAllTextAsync("../Infrastructure/Data/SeedData/delivery.json");
            var deliveryOptions = JsonSerializer.Deserialize<List<DeliveryOption>>(deliveryData);
            if (deliveryOptions != null)
            {
                context.DeliveryOptions.AddRange(deliveryOptions);
            }
        }

        if (!context.CouponCodes.Any())
        {
            context.CouponCodes.AddRange(
                new CouponCode { Code = "LUCINA10", DiscountPercent = 10, IsActive = true, MaxUses = 100 },
                new CouponCode { Code = "LUCINA20", DiscountPercent = 20, IsActive = true, MaxUses = 50 },
                new CouponCode { Code = "WELCOME15", DiscountPercent = 15, IsActive = true, MaxUses = 200 },
                new CouponCode { Code = "KBEAUTY25", DiscountPercent = 25, IsActive = true, MaxUses = 30 },
                new CouponCode { Code = "SUMMER5", DiscountPercent = 5, IsActive = true, MaxUses = null }
            );
        }

        await context.SaveChangesAsync();
    }
}