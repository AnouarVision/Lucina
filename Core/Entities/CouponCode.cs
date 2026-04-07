namespace Core.Entities;

public class CouponCode : BaseEntity
{
    public string Code { get; set; } = "";
    public decimal DiscountPercent { get; set; }
    public bool IsActive { get; set; } = true;
    public int? MaxUses { get; set; }
    public int UsedCount { get; set; } = 0;
    public DateTime? ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
