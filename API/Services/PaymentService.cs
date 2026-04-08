using Core.Entities;
using Core.Interfaces;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace API.Services
{
    public interface IPaymentService
    {
        Task<Order> CreateOrderAsync(string userId, CreateOrderRequest request);
        Task<Order?> GetOrderAsync(int orderId);
        Task<IEnumerable<Order>> GetUserOrdersAsync(string userId);
        Task<bool> UpdateOrderStatusAsync(int orderId, string status);
        Task<bool> ProcessPaymentAsync(int orderId, PaymentDetails paymentDetails);
    }

    public class PaymentService : IPaymentService
    {
        private readonly StoreContext _context;
        private readonly IStockReservationService _reservation;

        public PaymentService(StoreContext context, IStockReservationService reservation)
        {
            _context = context;
            _reservation = reservation;
        }

        public async Task<Order> CreateOrderAsync(string userId, CreateOrderRequest request)
        {
            if (request.Items == null || !request.Items.Any())
                throw new ArgumentException("Order must contain at least one item");

            var order = new Order
            {
                UserId = userId,
                OrderDate = DateTime.UtcNow,
                OrderStatus = "Pending",
                ShippingAddress = request.ShippingAddress,
                ShippingCity = request.ShippingCity,
                ShippingPostalCode = request.ShippingPostalCode,
                ShippingCountry = request.ShippingCountry,
                PhoneNumber = request.PhoneNumber,
                ShippingMethod = request.ShippingMethod,
                EstimatedDeliveryDays = GetEstimatedDeliveryDays(request.ShippingMethod),
                CouponCode = request.CouponCode,
                PaymentMethod = request.PaymentMethod ?? "",
                Subtotal = request.Subtotal,
                ShippingCost = request.ShippingCost,
                TaxAmount = request.TaxAmount,
                Discount = request.Discount,
                Total = request.Total
            };

            foreach (var item in request.Items)
            {
                var orderItem = new OrderItem
                {
                    ProductId = item.ProductId,
                    ProductName = item.ProductName,
                    ProductImageUrl = item.ProductImageUrl,
                    UnitPrice = item.UnitPrice,
                    Quantity = item.Quantity
                };
                order.Items.Add(orderItem);
            }

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return order;
        }

        public async Task<Order?> GetOrderAsync(int orderId)
        {
            return await _context.Orders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == orderId);
        }

        public async Task<IEnumerable<Order>> GetUserOrdersAsync(string userId)
        {
            return await _context.Orders
                .Where(o => o.UserId == userId)
                .Include(o => o.Items)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }

        public async Task<bool> UpdateOrderStatusAsync(int orderId, string status)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null) return false;

            order.OrderStatus = status;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ProcessPaymentAsync(int orderId, PaymentDetails paymentDetails)
        {
            var order = await _context.Orders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == orderId);
            if (order == null) return false;

            try
            {
                // TODO: Integrate with Stripe or other payment gateway
                order.PaymentIntentId = paymentDetails.PaymentIntentId;
                order.PaymentStatus = "Completed";
                order.PaymentDate = DateTime.UtcNow;
                order.OrderStatus = "Processing";

                foreach (var item in order.Items)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product != null)
                    {
                        product.QuantityInStock = Math.Max(0, product.QuantityInStock - item.Quantity);
                    }
                }

                await _context.SaveChangesAsync();

                foreach (var item in order.Items)
                    await _reservation.ReleaseAsync(order.UserId, item.ProductId);

                return true;
            }
            catch (Exception)
            {
                order.PaymentStatus = "Failed";
                await _context.SaveChangesAsync();
                return false;
            }
        }

        private int GetEstimatedDeliveryDays(string shippingMethod)
        {
            return shippingMethod?.ToLower() switch
            {
                "standard" => 7,
                "express" => 2,
                "overnight" => 1,
                _ => 7
            };
        }
    }

    public class CreateOrderRequest
    {
        public required string ShippingAddress { get; set; }
        public required string ShippingCity { get; set; }
        public required string ShippingPostalCode { get; set; }
        public required string ShippingCountry { get; set; }
        public required string PhoneNumber { get; set; }
        public required string ShippingMethod { get; set; }
        public string? PaymentMethod { get; set; }
        public string? CouponCode { get; set; }
        public decimal Subtotal { get; set; }
        public decimal ShippingCost { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal Discount { get; set; }
        public decimal Total { get; set; }
        public required List<CreateOrderItemRequest> Items { get; set; }
    }

    public class CreateOrderItemRequest
    {
        public int ProductId { get; set; }
        public required string ProductName { get; set; }
        public required string ProductImageUrl { get; set; }
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
    }

    public class PaymentDetails
    {
        public required string PaymentIntentId { get; set; }
        public string ProcessorResponse { get; set; } = string.Empty;
    }
}
