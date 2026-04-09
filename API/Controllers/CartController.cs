using API.Services;
using Core.Entities;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;
        private readonly IGenericRepository<Product> _productRepo;
        private readonly IStockReservationService _reservation;
        private const int MaxItemQuantity = 99;

        public CartController(
            ICartService cartService,
            IGenericRepository<Product> productRepo,
            IStockReservationService reservation)
        {
            _cartService = cartService;
            _productRepo = productRepo;
            _reservation = reservation;
        }

        private bool IsOwner(string userId)
        {
            var tokenUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return tokenUserId != null && tokenUserId == userId;
        }

        private async Task<int> AvailableForUserAsync(string userId, int productId, int physicalStock)
        {
            int totalReserved = await _reservation.GetTotalReservedAsync(productId);
            int myReserved = await _reservation.GetUserReservedAsync(userId, productId);
            int byOthers = totalReserved - myReserved;
            return physicalStock - byOthers;
        }

        [HttpGet("{userId}")]
        public async Task<ActionResult<Cart>> GetCart(string userId)
        {
            if (!IsOwner(userId)) return Forbid();
            var cart = await _cartService.GetCartAsync(userId);
            if (cart.Items.Count > 0)
            {
                await _reservation.RefreshForUserAsync(userId, cart.Items.Select(i => i.ProductId));
                foreach (var item in cart.Items)
                {
                    var product = await _productRepo.GetByIdAsync(item.ProductId);
                    if (product != null)
                        item.AvailableStock = await AvailableForUserAsync(userId, item.ProductId, product.QuantityInStock);
                }
            }
            return Ok(cart);
        }

        [HttpPost("{userId}/add")]
        public async Task<ActionResult> AddItem(string userId, [FromBody] CartItem item)
        {
            if (!IsOwner(userId)) return Forbid();
            if (item.Quantity <= 0) return BadRequest("La quantita deve essere almeno 1.");
            if (item.Quantity > MaxItemQuantity) return BadRequest($"La quantita massima per articolo e {MaxItemQuantity}.");

            var product = await _productRepo.GetByIdAsync(item.ProductId);
            if (product == null) return NotFound("Prodotto non trovato.");

            var cart = await _cartService.GetCartAsync(userId);
            var existing = cart.Items.FirstOrDefault(i => i.ProductId == item.ProductId);
            int newTotal = item.Quantity + (existing?.Quantity ?? 0);
            if (newTotal > MaxItemQuantity) return BadRequest($"La quantita massima per articolo e {MaxItemQuantity}.");

            int available = await AvailableForUserAsync(userId, item.ProductId, product.QuantityInStock);
            if (available <= 0) return BadRequest("Prodotto esaurito o non disponibile in questo momento.");
            if (newTotal > available) return BadRequest($"Stock insufficiente. Puoi aggiungerne ancora {available - (existing?.Quantity ?? 0)}.");

            await _cartService.AddItemAsync(userId, item);
            await _reservation.ReserveAsync(userId, item.ProductId, newTotal);
            return Ok();
        }

        [HttpPost("{userId}/add-all")]
        public async Task<ActionResult> AddItems(string userId, [FromBody] List<CartItem> items)
        {
            if (!IsOwner(userId)) return Forbid();
            var cart = await _cartService.GetCartAsync(userId);

            foreach (var item in items)
            {
                if (item.Quantity <= 0) return BadRequest($"Quantita non valida per il prodotto {item.ProductId}.");
                if (item.Quantity > MaxItemQuantity) return BadRequest($"Quantita massima superata per il prodotto {item.ProductId}.");

                var product = await _productRepo.GetByIdAsync(item.ProductId);
                if (product == null) return NotFound($"Prodotto {item.ProductId} non trovato.");

                var existing = cart.Items.FirstOrDefault(i => i.ProductId == item.ProductId);
                int newTotal = item.Quantity + (existing?.Quantity ?? 0);

                int available = await AvailableForUserAsync(userId, item.ProductId, product.QuantityInStock);
                if (available <= 0) return BadRequest($"Il prodotto '{product.Name}' e esaurito o non disponibile.");
                if (newTotal > available) return BadRequest($"Stock insufficiente per '{product.Name}'. Disponibili: {available}.");

                if (existing != null) existing.Quantity += item.Quantity;
                else cart.Items.Add(item);
            }

            await _cartService.SaveCartAsync(cart);

            foreach (var item in items)
            {
                var updated = cart.Items.First(i => i.ProductId == item.ProductId);
                await _reservation.ReserveAsync(userId, item.ProductId, updated.Quantity);
            }
            return Ok();
        }

        [HttpPost("{userId}/set")]
        public async Task<ActionResult> SetCart(string userId, [FromBody] List<CartItem> items)
        {
            if (!IsOwner(userId)) return Forbid();

            foreach (var item in items)
            {
                if (item.Quantity <= 0) return BadRequest($"Quantita non valida per il prodotto {item.ProductId}.");
                if (item.Quantity > MaxItemQuantity) return BadRequest($"Quantita massima superata per il prodotto {item.ProductId}.");

                var product = await _productRepo.GetByIdAsync(item.ProductId);
                if (product == null) return NotFound($"Prodotto {item.ProductId} non trovato.");
                int available = await AvailableForUserAsync(userId, item.ProductId, product.QuantityInStock);
                if (item.Quantity > available) return BadRequest($"Stock insufficiente per '{product.Name}'. Disponibili: {available}.");
            }

            var cart = await _cartService.GetCartAsync(userId);
            var removedIds = cart.Items.Select(i => i.ProductId).Except(items.Select(i => i.ProductId));
            foreach (var pid in removedIds)
                await _reservation.ReleaseAsync(userId, pid);

            cart.Items = items;
            await _cartService.SaveCartAsync(cart);

            foreach (var item in items)
                await _reservation.ReserveAsync(userId, item.ProductId, item.Quantity);

            return Ok();
        }

        [HttpDelete("{userId}/remove/{productId}")]
        public async Task<ActionResult> RemoveItem(string userId, int productId)
        {
            if (!IsOwner(userId)) return Forbid();
            await _cartService.RemoveItemAsync(userId, productId);
            await _reservation.ReleaseAsync(userId, productId);
            return Ok();
        }
    }
}
