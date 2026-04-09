using API.Services;
using Core.Entities;
using Microsoft.AspNetCore.Mvc;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : BaseApiController
    {
        private readonly IPaymentService _paymentService;
        private readonly ICartService _cartService;

        public PaymentController(IPaymentService paymentService, ICartService cartService)
        {
            _paymentService = paymentService;
            _cartService = cartService;
        }

        private string? GetTokenUserId() =>
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        [HttpPost("create-order/{userId}")]
        public async Task<ActionResult<Order>> CreateOrder(string userId, [FromBody] CreateOrderRequest request)
        {
            if (GetTokenUserId() != userId)
                return Forbid();

            try
            {
                var order = await _paymentService.CreateOrderAsync(userId, request);

                if (order.Id > 0)
                {
                    // await _cartService.ClearCartAsync(userId);
                }

                return Ok(new { success = true, orderId = order.Id, message = "Ordine creato con successo" });
            }
            catch (Exception)
            {
                return BadRequest(new { success = false, message = "Errore nella creazione dell'ordine" });
            }
        }

        [HttpGet("{orderId}")]
        public async Task<ActionResult<Order>> GetOrder(int orderId)
        {
            var order = await _paymentService.GetOrderAsync(orderId);
            if (order == null)
                return NotFound(new { message = "Ordine non trovato" });

            if (order.UserId != GetTokenUserId())
                return Forbid();

            return Ok(order);
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Order>>> GetUserOrders(string userId)
        {
            if (GetTokenUserId() != userId)
                return Forbid();

            var orders = await _paymentService.GetUserOrdersAsync(userId);
            return Ok(orders);
        }

        [HttpPost("{orderId}/process-payment")]
        public async Task<ActionResult> ProcessPayment(int orderId, [FromBody] PaymentDetails paymentDetails)
        {
            var order = await _paymentService.GetOrderAsync(orderId);
            if (order == null)
                return NotFound(new { success = false, message = "Ordine non trovato" });

            if (order.UserId != GetTokenUserId())
                return Forbid();

            try
            {
                var success = await _paymentService.ProcessPaymentAsync(orderId, paymentDetails);
                if (!success)
                    return BadRequest(new { success = false, message = "Errore nell'elaborazione del pagamento" });

                return Ok(new { success = true, message = "Pagamento elaborato con successo" });
            }
            catch (Exception)
            {
                return BadRequest(new { success = false, message = "Errore nell'elaborazione del pagamento" });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{orderId}/status")]
        public async Task<ActionResult> UpdateOrderStatus(int orderId, [FromBody] UpdateOrderStatusRequest request)
        {
            var success = await _paymentService.UpdateOrderStatusAsync(orderId, request.Status);
            if (!success)
                return NotFound(new { message = "Ordine non trovato" });

            return Ok(new { success = true, message = "Stato ordine aggiornato" });
        }

        [HttpPost("calculate-total")]
        public ActionResult<decimal> CalculateOrderTotal([FromBody] OrderTotalRequest request)
        {
            try
            {
                var subtotal = request.Items.Sum(i => i.UnitPrice * i.Quantity);
                var taxableAmount = subtotal - request.Discount + request.ShippingCost;
                var tax = taxableAmount * 0.1m;
                var total = taxableAmount + tax;

                return Ok(new
                {
                    subtotal,
                    discount = request.Discount,
                    shippingCost = request.ShippingCost,
                    tax,
                    total
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    public class UpdateOrderStatusRequest
    {
        public required string Status { get; set; }
    }

    public class OrderTotalRequest
    {
        public required List<OrderItemRequest> Items { get; set; }
        public decimal Discount { get; set; }
        public decimal ShippingCost { get; set; }
    }

    public class OrderItemRequest
    {
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
    }
}
