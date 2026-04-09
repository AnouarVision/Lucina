using API.Controllers;
using API.Services;
using Core.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using System.Security.Claims;

namespace Lucina.Tests;

public class PaymentControllerTests
{
    private static StoreContext CreateDb(string name)
    {
        var opts = new DbContextOptionsBuilder<StoreContext>()
            .UseInMemoryDatabase(name)
            .Options;
        return new StoreContext(opts);
    }

    private static CreateOrderRequest ValidRequest(List<CreateOrderItemRequest>? items = null) =>
        new CreateOrderRequest
        {
            ShippingAddress = "Via Roma 1",
            ShippingCity = "Milano",
            ShippingPostalCode = "20100",
            ShippingCountry = "IT",
            PhoneNumber = "3331234567",
            ShippingMethod = "standard",
            Subtotal = 100,
            ShippingCost = 5,
            TaxAmount = 22,
            Discount = 0,
            Total = 127,
            Items = items ?? new List<CreateOrderItemRequest>
            {
                new() { ProductId = 1, ProductName = "P1", ProductImageUrl = "url", UnitPrice = 100, Quantity = 1 }
            }
        };

    private static PaymentController CreateController(StoreContext ctx, string userId = "user1")
    {
        var reservation = new Mock<Core.Interfaces.IStockReservationService>();
        reservation.Setup(r => r.ReleaseAsync(It.IsAny<string>(), It.IsAny<int>())).Returns(Task.CompletedTask);

        var cartSvc = new Mock<ICartService>();

        var svc = new PaymentService(ctx, reservation.Object);
        var ctrl = new PaymentController(svc, cartSvc.Object);
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

    [Fact]
    public async Task CreateOrder_WithValidCart_CreatesOrderInDB()
    {
        await using var ctx = CreateDb("CreateOrder_Valid");
        var ctrl = CreateController(ctx, "user1");

        var result = await ctrl.CreateOrder("user1", ValidRequest());

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.True(await ctx.Orders.AnyAsync(o => o.UserId == "user1"));
    }

    [Fact]
    public async Task CreateOrder_DecrementsProductStock()
    {
        await using var ctx = CreateDb("CreateOrder_StockDecrement");
        var product = new Product
        {
            Id = 1, Name = "P1", Description = "d", PictureUrl = "u",
            Type = "T", Brand = "B", QuantityInStock = 10
        };
        ctx.Products.Add(product);
        await ctx.SaveChangesAsync();

        var ctrl = CreateController(ctx, "user1");
        var request = ValidRequest(new List<CreateOrderItemRequest>
        {
            new() { ProductId = 1, ProductName = "P1", ProductImageUrl = "u", UnitPrice = 10, Quantity = 3 }
        });

        await ctrl.CreateOrder("user1", request);

        var order = await ctx.Orders.Include(o => o.Items).FirstAsync(o => o.UserId == "user1");
        Assert.Equal(3, order.Items.First().Quantity);
    }

    [Fact]
    public async Task CreateOrder_ReleasesRedisReservations()
    {
        var reservationMock = new Mock<Core.Interfaces.IStockReservationService>();
        reservationMock.Setup(r => r.ReleaseAsync(It.IsAny<string>(), It.IsAny<int>())).Returns(Task.CompletedTask);

        await using var ctx = CreateDb("CreateOrder_ReleasesRedis");
        var opts = new DbContextOptionsBuilder<StoreContext>()
            .UseInMemoryDatabase("CreateOrder_ReleasesRedis")
            .Options;

        var svc = new PaymentService(ctx, reservationMock.Object);
        await ctx.Orders.AddAsync(new Order
        {
            Id = 10, UserId = "user1",
            ShippingAddress = "A", ShippingCity = "C", ShippingPostalCode = "P",
            ShippingCountry = "IT", PhoneNumber = "123", ShippingMethod = "standard",
            Items = new List<OrderItem>
            {
                new() { ProductId = 1, ProductName = "P1", ProductImageUrl = "u", UnitPrice = 10, Quantity = 2 }
            }
        });
        await ctx.SaveChangesAsync();

        await svc.ProcessPaymentAsync(10, new PaymentDetails
        {
            PaymentIntentId = "pi_test",
            ProcessorResponse = "ok"
        });

        reservationMock.Verify(r => r.ReleaseAsync("user1", 1), Times.Once);
    }

    [Fact]
    public async Task CreateOrder_ForAnotherUser_Returns403()
    {
        await using var ctx = CreateDb("CreateOrder_Forbidden");
        var ctrl = CreateController(ctx, "user1");

        var result = await ctrl.CreateOrder("user2", ValidRequest());

        Assert.IsType<ForbidResult>(result.Result);
    }

    [Fact]
    public async Task GetOrder_ReturnsCorrectItems()
    {
        await using var ctx = CreateDb("GetOrder_Correct");
        ctx.Orders.Add(new Order
        {
            Id = 1, UserId = "user1",
            ShippingAddress = "A", ShippingCity = "C", ShippingPostalCode = "P",
            ShippingCountry = "IT", PhoneNumber = "123", ShippingMethod = "standard",
            Items = new List<OrderItem>
            {
                new() { ProductId = 1, ProductName = "P1", ProductImageUrl = "u", UnitPrice = 25, Quantity = 2 }
            }
        });
        await ctx.SaveChangesAsync();

        var ctrl = CreateController(ctx, "user1");
        var result = await ctrl.GetOrder(1);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var order = Assert.IsType<Order>(ok.Value);
        Assert.Single(order.Items);
        Assert.Equal(25m, order.Items.First().UnitPrice);
    }

    [Fact]
    public async Task GetOrder_ForAnotherUser_Returns403()
    {
        await using var ctx = CreateDb("GetOrder_Forbidden");
        ctx.Orders.Add(new Order
        {
            Id = 1, UserId = "user2",
            ShippingAddress = "A", ShippingCity = "C", ShippingPostalCode = "P",
            ShippingCountry = "IT", PhoneNumber = "123", ShippingMethod = "standard"
        });
        await ctx.SaveChangesAsync();

        var ctrl = CreateController(ctx, "user1");
        var result = await ctrl.GetOrder(1);

        Assert.IsType<ForbidResult>(result.Result);
    }

    [Fact]
    public async Task GetUserOrders_ReturnsOnlyOwnOrders()
    {
        await using var ctx = CreateDb("GetUserOrders_Own");
        ctx.Orders.AddRange(
            new Order
            {
                UserId = "user1",
                ShippingAddress = "A", ShippingCity = "C", ShippingPostalCode = "P",
                ShippingCountry = "IT", PhoneNumber = "123", ShippingMethod = "standard"
            },
            new Order
            {
                UserId = "user2",
                ShippingAddress = "B", ShippingCity = "D", ShippingPostalCode = "Q",
                ShippingCountry = "IT", PhoneNumber = "456", ShippingMethod = "standard"
            }
        );
        await ctx.SaveChangesAsync();

        var ctrl = CreateController(ctx, "user1");
        var result = await ctrl.GetUserOrders("user1");

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var orders = Assert.IsAssignableFrom<IEnumerable<Order>>(ok.Value);
        Assert.All(orders, o => Assert.Equal("user1", o.UserId));
    }

    [Fact]
    public async Task CreateOrder_WithOutOfStockItem_Returns400()
    {
        await using var ctx = CreateDb("CreateOrder_OutOfStock");
        ctx.Products.Add(new Product
        {
            Id = 99, Name = "Sold Out Serum", Description = "Test",
            Price = 25, PictureUrl = "img.jpg", Type = "Serum", Brand = "Brand",
            QuantityInStock = 0
        });
        await ctx.SaveChangesAsync();

        var ctrl = CreateController(ctx);
        var result = await ctrl.CreateOrder("user1", ValidRequest(new List<CreateOrderItemRequest>
        {
            new() { ProductId = 99, ProductName = "Sold Out Serum", ProductImageUrl = "img.jpg", UnitPrice = 25, Quantity = 1 }
        }));

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }
}
