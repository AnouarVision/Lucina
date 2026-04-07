using API.Services;
using Core.Entities;
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
        private readonly CartService _cartService;

        public CartController(CartService cartService)
        {
            _cartService = cartService;
        }

        private bool IsOwner(string userId)
        {
            var tokenUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return tokenUserId != null && tokenUserId == userId;
        }

        [HttpGet("{userId}")]
        public async Task<ActionResult<Cart>> GetCart(string userId)
        {
            if (!IsOwner(userId)) return Forbid();
            var cart = await _cartService.GetCartAsync(userId);
            return Ok(cart);
        }

        [HttpPost("{userId}/add")]
        public async Task<ActionResult> AddItem(string userId, [FromBody] CartItem item)
        {
            if (!IsOwner(userId)) return Forbid();
            await _cartService.AddItemAsync(userId, item);
            return Ok();
        }

		[HttpPost("{userId}/add-all")]
		public async Task<ActionResult> AddItems(string userId, [FromBody] List<CartItem> items)
		{
            if (!IsOwner(userId)) return Forbid();
			var cart = await _cartService.GetCartAsync(userId);
			foreach (var item in items)
			{
    			var existing = cart.Items.FirstOrDefault(i => i.ProductId == item.ProductId);
    			if (existing != null)
        			existing.Quantity += item.Quantity;
    			else
       				cart.Items.Add(item);
			}
    		await _cartService.SaveCartAsync(cart);
    		return Ok();
		}

		[HttpPost("{userId}/set")]
		public async Task<ActionResult> SetCart(string userId, [FromBody] List<CartItem> items)
		{
            if (!IsOwner(userId)) return Forbid();
   			var cart = await _cartService.GetCartAsync(userId);
    		cart.Items = items;
    		await _cartService.SaveCartAsync(cart);
    		return Ok();
		}

        [HttpDelete("{userId}/remove/{productId}")]
        public async Task<ActionResult> RemoveItem(string userId, int productId)
        {
            if (!IsOwner(userId)) return Forbid();
            await _cartService.RemoveItemAsync(userId, productId);
            return Ok();
        }
    }
}