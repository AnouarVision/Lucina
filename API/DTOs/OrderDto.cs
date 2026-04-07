namespace API.DTOs;

public class OrderItemDto
{
    public required int ProductId { get; set; }
    public required string ProductName { get; set; }
    public required int Quantity { get; set; }
    public required decimal UnitPrice { get; set; }
    public string? ProductImageUrl { get; set; }
}

public class OrderSummaryDto
{
    public required int Id { get; set; }
    public required DateTime OrderDate { get; set; }
    public required string OrderStatus { get; set; }
    public required decimal Total { get; set; }
    public required string ShippingAddress { get; set; }
    public required string ShippingCity { get; set; }
    public required string ShippingCountry { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
}

public class OrderDetailDto
{
    public required int Id { get; set; }
    public required DateTime OrderDate { get; set; }
    public required string OrderStatus { get; set; }
    public required decimal Subtotal { get; set; }
    public required decimal ShippingCost { get; set; }
    public required decimal TaxAmount { get; set; }
    public required decimal Discount { get; set; }
    public string? CouponCode { get; set; }
    public required decimal Total { get; set; }
    public required string ShippingAddress { get; set; }
    public required string ShippingCity { get; set; }
    public required string ShippingPostalCode { get; set; }
    public required string ShippingCountry { get; set; }
    public required string PhoneNumber { get; set; }
    public required string ShippingMethod { get; set; }
    public required int EstimatedDeliveryDays { get; set; }
    public required string PaymentStatus { get; set; }
    public string? PaymentMethod { get; set; }
    public DateTime? PaymentDate { get; set; }
    public string? Notes { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
}
