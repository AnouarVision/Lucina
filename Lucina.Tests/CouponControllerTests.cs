using API.Controllers;
using API.DTOs;
using Core.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Reflection;
using System.Security.Claims;

namespace Lucina.Tests;

public class CouponControllerTests
{
    private static StoreContext CreateDb(string name)
    {
        var opts = new DbContextOptionsBuilder<StoreContext>()
            .UseInMemoryDatabase(name)
            .Options;
        return new StoreContext(opts);
    }

    private static CouponController CreateController(StoreContext ctx, bool isAdmin = true)
    {
        var ctrl = new CouponController(ctx);
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, "1"),
            new(ClaimTypes.Name, "TestUser"),
            new(ClaimTypes.Email, "test@test.com"),
        };
        if (isAdmin) claims.Add(new(ClaimTypes.Role, "Admin"));

        ctrl.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new System.Security.Principal.GenericPrincipal(
                    new ClaimsIdentity(claims, "Test"), null)
            }
        };
        return ctrl;
    }

    [Fact]
    public async Task ValidateCoupon_WithValidCode_ReturnsDiscount()
    {
        await using var ctx = CreateDb("ValidateCoupon_Valid");
        ctx.CouponCodes.Add(new CouponCode
        {
            Code = "SAVE10",
            DiscountPercent = 10,
            IsActive = true,
            MaxUses = 100,
            UsedCount = 0,
            ExpiresAt = DateTime.UtcNow.AddDays(30)
        });
        await ctx.SaveChangesAsync();

        var ctrl = CreateController(ctx);
        var result = await ctrl.Validate(new ValidateCouponDto { Code = "SAVE10" });

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var dto = Assert.IsType<ValidateCouponResponseDto>(ok.Value);
        Assert.True(dto.Valid);
        Assert.Equal(10, dto.DiscountPercent);
    }

    [Fact]
    public async Task ValidateCoupon_WithExpiredCode_Returns400()
    {
        await using var ctx = CreateDb("ValidateCoupon_Expired");
        ctx.CouponCodes.Add(new CouponCode
        {
            Code = "OLDCODE",
            DiscountPercent = 5,
            IsActive = true,
            ExpiresAt = DateTime.UtcNow.AddDays(-1)
        });
        await ctx.SaveChangesAsync();

        var ctrl = CreateController(ctx);
        var result = await ctrl.Validate(new ValidateCouponDto { Code = "OLDCODE" });

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var dto = Assert.IsType<ValidateCouponResponseDto>(ok.Value);
        Assert.False(dto.Valid);
        Assert.Contains("scaduto", dto.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task ValidateCoupon_WithInactiveCode_Returns400()
    {
        await using var ctx = CreateDb("ValidateCoupon_Inactive");
        ctx.CouponCodes.Add(new CouponCode
        {
            Code = "INACTIVE",
            DiscountPercent = 10,
            IsActive = false
        });
        await ctx.SaveChangesAsync();

        var ctrl = CreateController(ctx);
        var result = await ctrl.Validate(new ValidateCouponDto { Code = "INACTIVE" });

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var dto = Assert.IsType<ValidateCouponResponseDto>(ok.Value);
        Assert.False(dto.Valid);
    }

    [Fact]
    public async Task ValidateCoupon_WithExhaustedCode_Returns400()
    {
        await using var ctx = CreateDb("ValidateCoupon_Exhausted");
        ctx.CouponCodes.Add(new CouponCode
        {
            Code = "FULL",
            DiscountPercent = 10,
            IsActive = true,
            MaxUses = 5,
            UsedCount = 5
        });
        await ctx.SaveChangesAsync();

        var ctrl = CreateController(ctx);
        var result = await ctrl.Validate(new ValidateCouponDto { Code = "FULL" });

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var dto = Assert.IsType<ValidateCouponResponseDto>(ok.Value);
        Assert.False(dto.Valid);
        Assert.Contains("esaurito", dto.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task ValidateCoupon_WithUnknownCode_Returns400()
    {
        await using var ctx = CreateDb("ValidateCoupon_Unknown");

        var ctrl = CreateController(ctx);
        var result = await ctrl.Validate(new ValidateCouponDto { Code = "GHOST" });

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var dto = Assert.IsType<ValidateCouponResponseDto>(ok.Value);
        Assert.False(dto.Valid);
    }

    [Fact]
    public async Task RedeemCoupon_IncrementsUsedCount()
    {
        await using var ctx = CreateDb("RedeemCoupon_Increments");
        ctx.CouponCodes.Add(new CouponCode
        {
            Code = "REDEEM10",
            DiscountPercent = 10,
            IsActive = true,
            MaxUses = 100,
            UsedCount = 0
        });
        await ctx.SaveChangesAsync();

        var ctrl = CreateController(ctx);
        await ctrl.Redeem(new ValidateCouponDto { Code = "REDEEM10" });

        var coupon = await ctx.CouponCodes.FirstAsync(c => c.Code == "REDEEM10");
        Assert.Equal(1, coupon.UsedCount);
    }

    [Fact]
    public async Task RedeemCoupon_AtMaxUses_Returns400()
    {
        await using var ctx = CreateDb("RedeemCoupon_AtMax");
        ctx.CouponCodes.Add(new CouponCode
        {
            Code = "MAXED",
            DiscountPercent = 10,
            IsActive = true,
            MaxUses = 3,
            UsedCount = 3
        });
        await ctx.SaveChangesAsync();

        var ctrl = CreateController(ctx);
        var result = await ctrl.Redeem(new ValidateCouponDto { Code = "MAXED" });

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task GenerateCoupon_AsAdmin_CreatesCoupon()
    {
        await using var ctx = CreateDb("GenerateCoupon_Admin");
        var ctrl = CreateController(ctx, isAdmin: true);

        var result = await ctrl.Generate(new GenerateCouponDto
        {
            Code = "NEWCODE",
            DiscountPercent = 15,
            MaxUses = 50,
            ExpiresAt = DateTime.UtcNow.AddDays(60)
        });

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.True(await ctx.CouponCodes.AnyAsync(c => c.Code == "NEWCODE"));
    }

    [Fact]
    public async Task DeactivateCoupon_AsAdmin_SetsIsActiveFalse()
    {
        await using var ctx = CreateDb("DeactivateCoupon_Admin");
        var coupon = new CouponCode { Code = "DEACT", DiscountPercent = 10, IsActive = true };
        ctx.CouponCodes.Add(coupon);
        await ctx.SaveChangesAsync();

        var ctrl = CreateController(ctx, isAdmin: true);
        await ctrl.Deactivate(coupon.Id);

        var updated = await ctx.CouponCodes.FindAsync(coupon.Id);
        Assert.NotNull(updated);
        Assert.False(updated!.IsActive);
    }

    [Fact]
    public void GenerateCoupon_AsUser_Returns403()
    {
        var method = typeof(CouponController).GetMethod(nameof(CouponController.Generate));
        var attribute = method?.GetCustomAttribute<AuthorizeAttribute>();

        Assert.NotNull(attribute);
        Assert.Equal("Admin", attribute!.Roles);
    }
}
