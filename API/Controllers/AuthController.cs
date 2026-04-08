using API.DTOs;
using API.Errors;
using Infrastructure.Data;
using Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : BaseApiController
{
    private readonly IAuthService _authService;
    private readonly StoreContext _context;

    public AuthController(IAuthService authService, StoreContext context)
    {
        _authService = authService;
        _context = context;
    }

    [HttpPost("login")]
    public async Task<ActionResult> Login(LoginRequestDto loginRequest)
    {
        if (!ModelState.IsValid)
            return BadRequest(new ApiErrorResponse(400, "Invalid request data", string.Join("; ", ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)))));

        var (success, message, user) = await _authService.LoginAsync(loginRequest.Email, loginRequest.Password);

        if (!success || user == null)
            return BadRequest(new ApiErrorResponse(400, message, null));

        var accessToken = _authService.GenerateJwtToken(user);
        var refreshToken = await _authService.GenerateRefreshTokenAsync(user);

        SetTokenCookies(accessToken, refreshToken);

        return Ok(new { userId = user.Id, email = user.Email, name = user.Name });
    }

    [HttpPost("signup")]
    public async Task<ActionResult> Signup(SignupRequestDto signupRequest)
    {
        if (!ModelState.IsValid)
            return BadRequest(new ApiErrorResponse(400, "Invalid request data", string.Join("; ", ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)))));

        if (string.IsNullOrWhiteSpace(signupRequest.Password) || signupRequest.Password.Length < 6)
            return BadRequest(new ApiErrorResponse(400, "Password must be at least 6 characters", null));

        var (success, message, user) = await _authService.SignupAsync(signupRequest.Name, signupRequest.Email, signupRequest.Password);

        if (!success || user == null)
            return BadRequest(new ApiErrorResponse(400, message, null));

        return Ok(new { message = "Registration successful. Please log in." });
    }

    [HttpPost("refresh")]
    public async Task<ActionResult> Refresh()
    {
        var refreshToken = Request.Cookies["refresh_token"];
        if (string.IsNullOrEmpty(refreshToken))
            return Unauthorized(new ApiErrorResponse(401, "Refresh token missing", null));

        var user = await _authService.ValidateRefreshTokenAsync(refreshToken);
        if (user == null)
            return Unauthorized(new ApiErrorResponse(401, "Invalid or expired refresh token", null));

        var newAccessToken = _authService.GenerateJwtToken(user);
        var newRefreshToken = await _authService.GenerateRefreshTokenAsync(user);

        SetTokenCookies(newAccessToken, newRefreshToken);

        return Ok(new { userId = user.Id, email = user.Email, name = user.Name });
    }

    [HttpPost("logout")]
    public async Task<ActionResult> Logout()
    {
        var refreshToken = Request.Cookies["refresh_token"];
        if (!string.IsNullOrEmpty(refreshToken))
            await _authService.RevokeRefreshTokenAsync(refreshToken);

        Response.Cookies.Delete("access_token", new CookieOptions { Path = "/" });
        Response.Cookies.Delete("refresh_token", new CookieOptions { Path = "/api/auth" });

        return Ok(new { message = "Logged out successfully" });
    }

    [HttpGet("validate")]
    [Authorize]
    public ActionResult Validate()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        var name = User.FindFirst(ClaimTypes.Name)?.Value;

        if (userId == null) return Unauthorized();

        return Ok(new { userId = int.Parse(userId), email, name });
    }

    [HttpGet("profile")]
    [Authorize]
    public async Task<ActionResult<UserProfileDto>> GetProfile()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out var userId))
            return Unauthorized(new ApiErrorResponse(401, "Invalid token", null));

        var user = await _authService.GetUserByIdAsync(userId);
        if (user == null)
            return NotFound(new ApiErrorResponse(404, "User not found", null));

        return Ok(new UserProfileDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Phone = user.Phone,
            Nationality = user.Nationality,
            Address = user.Address,
            City = user.City,
            Country = user.Country,
            Bio = user.Bio
        });
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<ActionResult<UserProfileDto>> UpdateProfile(UpdateProfileRequest updateRequest)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out var userId))
            return Unauthorized(new ApiErrorResponse(401, "Invalid token", null));

        var user = await _authService.GetUserByIdAsync(userId);
        if (user == null)
            return NotFound(new ApiErrorResponse(404, "User not found", null));

        var (success, message, updatedUser) = await _authService.UpdateProfileAsync(userId, updateRequest);
        if (!success || updatedUser == null)
            return BadRequest(new ApiErrorResponse(400, message, null));

        return Ok(new UserProfileDto
        {
            Id = updatedUser.Id,
            Name = updatedUser.Name,
            Email = updatedUser.Email,
            Phone = updatedUser.Phone,
            Nationality = updatedUser.Nationality,
            Address = updatedUser.Address,
            City = updatedUser.City,
            Country = updatedUser.Country,
            Bio = updatedUser.Bio
        });
    }

    [HttpGet("orders")]
    [Authorize]
    public async Task<ActionResult<List<OrderSummaryDto>>> GetUserOrders()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out var userId))
            return Unauthorized(new ApiErrorResponse(401, "Invalid token", null));

        try
        {
            var orders = await _context.Orders
                .Where(o => o.UserId == userId.ToString())
                .Include(o => o.Items)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            var orderDtos = orders.Select(o => new OrderSummaryDto
            {
                Id = o.Id,
                OrderDate = o.OrderDate,
                OrderStatus = o.OrderStatus,
                Total = o.Total,
                ShippingAddress = o.ShippingAddress,
                ShippingCity = o.ShippingCity,
                ShippingCountry = o.ShippingCountry,
                Items = o.Items.Select(oi => new OrderItemDto
                {
                    ProductId = oi.ProductId,
                    ProductName = oi.ProductName,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    ProductImageUrl = oi.ProductImageUrl
                }).ToList()
            }).ToList();

            return Ok(orderDtos);
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiErrorResponse(400, $"Error retrieving orders: {ex.Message}", null));
        }
    }

    [HttpGet("orders/{id:int}")]
    [Authorize]
    public async Task<ActionResult<OrderDetailDto>> GetOrderById(int id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out var userId))
            return Unauthorized(new ApiErrorResponse(401, "Invalid token", null));

        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId.ToString());

        if (order == null)
            return NotFound(new ApiErrorResponse(404, "Order not found", null));

        return Ok(new OrderDetailDto
        {
            Id = order.Id,
            OrderDate = order.OrderDate,
            OrderStatus = order.OrderStatus,
            Subtotal = order.Subtotal,
            ShippingCost = order.ShippingCost,
            TaxAmount = order.TaxAmount,
            Discount = order.Discount,
            CouponCode = order.CouponCode,
            Total = order.Total,
            ShippingAddress = order.ShippingAddress,
            ShippingCity = order.ShippingCity,
            ShippingPostalCode = order.ShippingPostalCode,
            ShippingCountry = order.ShippingCountry,
            PhoneNumber = order.PhoneNumber,
            ShippingMethod = order.ShippingMethod,
            EstimatedDeliveryDays = order.EstimatedDeliveryDays,
            PaymentStatus = order.PaymentStatus,
            PaymentMethod = order.PaymentMethod,
            PaymentDate = order.PaymentDate,
            Notes = order.Notes,
            Items = order.Items.Select(oi => new OrderItemDto
            {
                ProductId = oi.ProductId,
                ProductName = oi.ProductName,
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice,
                ProductImageUrl = oi.ProductImageUrl
            }).ToList()
        });
    }

    private void SetTokenCookies(string accessToken, string refreshToken)
    {
        Response.Cookies.Append("access_token", accessToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Path = "/",
            Expires = DateTimeOffset.UtcNow.AddMinutes(15)
        });

        Response.Cookies.Append("refresh_token", refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Path = "/api/auth",
            Expires = DateTimeOffset.UtcNow.AddDays(7)
        });
    }
}
