namespace Core.Entities;

public class Order : BaseEntity
{
    public required string UserId { get; set; }

    public DateTime OrderDate { get; set; } = DateTime.UtcNow;

    public string OrderStatus { get; set; } = "Pending";

    public decimal Subtotal { get; set; }

    public decimal ShippingCost { get; set; }

    public decimal TaxAmount { get; set; }

    public decimal Discount { get; set; }

    public string? CouponCode { get; set; }

    public decimal Total { get; set; }

    public required string ShippingAddress { get; set; }

    public required string ShippingCity { get; set; }

    public required string ShippingPostalCode { get; set; }

    public required string ShippingCountry { get; set; }

    public required string PhoneNumber { get; set; }

    public string ShippingMethod { get; set; } = "standard";

    public int EstimatedDeliveryDays { get; set; }

    public string? PaymentIntentId { get; set; }

    public string PaymentStatus { get; set; } = "Pending";

    public string PaymentMethod { get; set; } = "";

    public DateTime? PaymentDate { get; set; }

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();

    public string? Notes { get; set; }
}
