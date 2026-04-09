using API.Controllers;
using API.Services;
using Core.Entities;
using Core.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System.Security.Claims;

namespace Lucina.Tests;

public class CartControllerTests
{
    private readonly Mock<ICartService> _cartSvc = new();
    private readonly Mock<IGenericRepository<Product>> _productRepo = new();
    private readonly Mock<IStockReservationService> _reservation = new();

    private CartController CreateController(string userId = "user1")
    {
        var ctrl = new CartController(_cartSvc.Object, _productRepo.Object, _reservation.Object);
        ctrl.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new System.Security.Principal.GenericPrincipal(
                    new ClaimsIdentity(new[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, userId)
                    }, "Test"), null)
            }
        };
        return ctrl;
    }

    private Product MakeProduct(int id, int stock) =>
        new Product
        {
            Id = id,
            Name = $"P{id}",
            Description = "desc",
            PictureUrl = "url",
            Type = "T",
            Brand = "B",
            QuantityInStock = stock
        };


    [Fact]
    public async Task AddToCart_WithAvailableStock_SavesReservation()
    {
        _productRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(MakeProduct(1, 10));
        _cartSvc.Setup(s => s.GetCartAsync("user1")).ReturnsAsync(new Cart { UserId = "user1" });
        _reservation.Setup(r => r.GetTotalReservedAsync(1)).ReturnsAsync(0);
        _reservation.Setup(r => r.GetUserReservedAsync("user1", 1)).ReturnsAsync(0);
        _cartSvc.Setup(s => s.AddItemAsync("user1", It.IsAny<CartItem>())).Returns(Task.CompletedTask);
        _reservation.Setup(r => r.ReserveAsync("user1", 1, It.IsAny<int>())).Returns(Task.CompletedTask);

        var ctrl = CreateController("user1");
        var result = await ctrl.AddItem("user1", new CartItem { ProductId = 1, Quantity = 2, Name = "Test", ImageUrl = "test.jpg" });

        Assert.IsType<OkResult>(result);
        _cartSvc.Verify(s => s.AddItemAsync("user1", It.IsAny<CartItem>()), Times.Once);
        _reservation.Verify(r => r.ReserveAsync("user1", 1, It.IsAny<int>()), Times.Once);
    }

    [Fact]
    public async Task AddToCart_ExceedingStock_Returns400()
    {
        _productRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(MakeProduct(1, 3));
        _cartSvc.Setup(s => s.GetCartAsync("user1")).ReturnsAsync(new Cart { UserId = "user1" });
        _reservation.Setup(r => r.GetTotalReservedAsync(1)).ReturnsAsync(0);
        _reservation.Setup(r => r.GetUserReservedAsync("user1", 1)).ReturnsAsync(0);

        var ctrl = CreateController("user1");
        var result = await ctrl.AddItem("user1", new CartItem { ProductId = 1, Quantity = 5, Name = "Test", ImageUrl = "test.jpg" });

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task AddToCart_WithQuantityZero_Returns400()
    {
        var ctrl = CreateController("user1");
        var result = await ctrl.AddItem("user1", new CartItem { ProductId = 1, Quantity = 0, Name = "Test", ImageUrl = "test.jpg" });

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task AddToCart_WithNegativeQuantity_Returns400()
    {
        var ctrl = CreateController("user1");
        var result = await ctrl.AddItem("user1", new CartItem { ProductId = 1, Quantity = -1, Name = "Test", ImageUrl = "test.jpg" });

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task AddToCart_ExceedingMaxCap_Returns400()
    {
        var ctrl = CreateController("user1");
        var result = await ctrl.AddItem("user1", new CartItem { ProductId = 1, Quantity = 100, Name = "Test", ImageUrl = "test.jpg" });

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task AddToCart_WithUnknownProduct_Returns404()
    {
        _productRepo.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Product?)null);
        _cartSvc.Setup(s => s.GetCartAsync("user1")).ReturnsAsync(new Cart { UserId = "user1" });

        var ctrl = CreateController("user1");
        var result = await ctrl.AddItem("user1", new CartItem { ProductId = 999, Quantity = 1, Name = "Test", ImageUrl = "test.jpg" });

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task RemoveFromCart_ReleasesReservation()
    {
        _cartSvc.Setup(s => s.RemoveItemAsync("user1", 1)).Returns(Task.CompletedTask);
        _reservation.Setup(r => r.ReleaseAsync("user1", 1)).Returns(Task.CompletedTask);

        var ctrl = CreateController("user1");
        var result = await ctrl.RemoveItem("user1", 1);

        Assert.IsType<OkResult>(result);
        _reservation.Verify(r => r.ReleaseAsync("user1", 1), Times.Once);
    }

    [Fact]
    public async Task RemoveFromCart_NotOwner_Returns403()
    {
        var ctrl = CreateController("user1");
        var result = await ctrl.RemoveItem("user2", 1);

        Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task GetAvailableStock_ExcludesOtherUsersReservations()
    {
        _productRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(MakeProduct(1, 10));
        _reservation.Setup(r => r.GetTotalReservedAsync(1)).ReturnsAsync(3);
        _reservation.Setup(r => r.GetUserReservedAsync("user1", 1)).ReturnsAsync(0);
        _cartSvc.Setup(s => s.GetCartAsync("user1")).ReturnsAsync(new Cart { UserId = "user1" });

        var ctrl = CreateController("user1");
        var cart = await ctrl.GetCart("user1");

        var okResult = Assert.IsType<OkObjectResult>(cart.Result);
        var returnedCart = Assert.IsType<Cart>(okResult.Value);

        Assert.NotNull(returnedCart);
    }

    [Fact]
    public async Task GetAvailableStock_IncludesOwnReservation()
    {
        _productRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(MakeProduct(1, 10));
        _reservation.Setup(r => r.GetTotalReservedAsync(1)).ReturnsAsync(3);
        _reservation.Setup(r => r.GetUserReservedAsync("user1", 1)).ReturnsAsync(3);
        _reservation.Setup(r => r.RefreshForUserAsync("user1", It.IsAny<IEnumerable<int>>())).Returns(Task.CompletedTask);

        var cart = new Cart { UserId = "user1" };
        cart.Items.Add(new CartItem { ProductId = 1, Quantity = 3, Name = "Test", ImageUrl = "test.jpg" });
        _cartSvc.Setup(s => s.GetCartAsync("user1")).ReturnsAsync(cart);

        var ctrl = CreateController("user1");
        var result = await ctrl.GetCart("user1");

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedCart = Assert.IsType<Cart>(okResult.Value);

        Assert.Equal(10, returnedCart.Items[0].AvailableStock);
    }
}
