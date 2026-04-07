namespace API.DTOs;

public class GenerateCouponDto
{
    public required string Code { get; set; }
    public decimal DiscountPercent { get; set; }
    public int? MaxUses { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

public class ValidateCouponDto
{
    public required string Code { get; set; }
}

public class CouponResponseDto
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
    public decimal DiscountPercent { get; set; }
    public bool IsActive { get; set; }
    public int? MaxUses { get; set; }
    public int UsedCount { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ValidateCouponResponseDto
{
    public bool Valid { get; set; }
    public string Message { get; set; } = "";
    public decimal DiscountPercent { get; set; }
}
