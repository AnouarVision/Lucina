using API.DTOs;
using Core.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CouponController : BaseApiController
{
    private readonly StoreContext _context;

    public CouponController(StoreContext context)
    {
        _context = context;
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("generate")]
    public async Task<ActionResult<CouponResponseDto>> Generate([FromBody] GenerateCouponDto dto)
    {
        var code = dto.Code.Trim().ToUpper();

        if (await _context.CouponCodes.AnyAsync(c => c.Code == code))
            return BadRequest(new { message = "Codice già esistente." });

        var coupon = new CouponCode
        {
            Code = code,
            DiscountPercent = dto.DiscountPercent,
            MaxUses = dto.MaxUses,
            ExpiresAt = dto.ExpiresAt,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.CouponCodes.Add(coupon);
        await _context.SaveChangesAsync();

        return Ok(MapToDto(coupon));
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<ActionResult<List<CouponResponseDto>>> GetAll()
    {
        var coupons = await _context.CouponCodes
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return Ok(coupons.Select(MapToDto));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> Deactivate(int id)
    {
        var coupon = await _context.CouponCodes.FindAsync(id);
        if (coupon == null) return NotFound();

        coupon.IsActive = false;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Codice disattivato." });
    }

    [Authorize]
    [HttpPost("validate")]
    public async Task<ActionResult<ValidateCouponResponseDto>> Validate([FromBody] ValidateCouponDto dto)
    {
        var code = dto.Code.Trim().ToUpper();
        var coupon = await _context.CouponCodes.FirstOrDefaultAsync(c => c.Code == code);

        if (coupon == null)
            return Ok(new ValidateCouponResponseDto { Valid = false, Message = "Codice non valido." });

        if (!coupon.IsActive)
            return Ok(new ValidateCouponResponseDto { Valid = false, Message = "Codice non più attivo." });

        if (coupon.ExpiresAt.HasValue && coupon.ExpiresAt.Value < DateTime.UtcNow)
            return Ok(new ValidateCouponResponseDto { Valid = false, Message = "Codice scaduto." });

        if (coupon.MaxUses.HasValue && coupon.UsedCount >= coupon.MaxUses.Value)
            return Ok(new ValidateCouponResponseDto { Valid = false, Message = "Codice esaurito." });

        return Ok(new ValidateCouponResponseDto
        {
            Valid = true,
            Message = $"Sconto del {coupon.DiscountPercent}% applicato!",
            DiscountPercent = coupon.DiscountPercent
        });
    }

    [Authorize]
    [HttpPost("redeem")]
    public async Task<ActionResult> Redeem([FromBody] ValidateCouponDto dto)
    {
        var code = dto.Code.Trim().ToUpper();
        var coupon = await _context.CouponCodes.FirstOrDefaultAsync(c => c.Code == code);

        if (coupon == null || !coupon.IsActive) return BadRequest(new { message = "Codice non valido." });

        if (coupon.MaxUses.HasValue && coupon.UsedCount >= coupon.MaxUses.Value)
            return BadRequest(new { message = "Codice esaurito." });

        coupon.UsedCount++;
        await _context.SaveChangesAsync();
        return Ok();
    }

    private static CouponResponseDto MapToDto(CouponCode c) => new()
    {
        Id = c.Id,
        Code = c.Code,
        DiscountPercent = c.DiscountPercent,
        IsActive = c.IsActive,
        MaxUses = c.MaxUses,
        UsedCount = c.UsedCount,
        ExpiresAt = c.ExpiresAt,
        CreatedAt = c.CreatedAt
    };
}
