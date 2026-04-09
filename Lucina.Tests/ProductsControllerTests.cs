using API.Controllers;
using Core.Entities;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace Lucina.Tests;

public class ProductsControllerTests
{
    private static List<Product> SeedProducts() =>
    [
        new Product { Id = 1, Name = "Lunara Dew Essence", Description = "d", PictureUrl = "u", Type = "Essence", Brand = "Lunara", Price = 22.50m, QuantityInStock = 10 },
        new Product { Id = 2, Name = "Solenya Bright Serum", Description = "d", PictureUrl = "u", Type = "Serum", Brand = "Solenya", Price = 17.90m, QuantityInStock = 5 },
        new Product { Id = 3, Name = "Hydralis Deep Toner", Description = "d", PictureUrl = "u", Type = "Toner", Brand = "Hydralis", Price = 20.00m, QuantityInStock = 8 },
        new Product { Id = 4, Name = "Veyra Calm Cream", Description = "d", PictureUrl = "u", Type = "Cream", Brand = "Veyra", Price = 33.50m, QuantityInStock = 3 },
    ];

    private static ProductsController CreateController(
        IReadOnlyList<Product> items,
        int count = -1)
    {
        var repoMock = new Mock<IGenericRepository<Product>>();
        var reservationMock = new Mock<IStockReservationService>();

        repoMock.Setup(r => r.ListAsync(It.IsAny<ISpecification<Product>>()))
                .ReturnsAsync(items);
        repoMock.Setup(r => r.CountAsync(It.IsAny<ISpecification<Product>>()))
                .ReturnsAsync(count < 0 ? items.Count : count);

        var ctrl = new ProductsController(repoMock.Object, reservationMock.Object);
        ctrl.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };
        return ctrl;
    }

    private static ProductsController CreateControllerWithRepo(Mock<IGenericRepository<Product>> repoMock)
    {
        var reservationMock = new Mock<IStockReservationService>();
        var ctrl = new ProductsController(repoMock.Object, reservationMock.Object);
        ctrl.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };
        return ctrl;
    }

    [Fact]
    public async Task GetProducts_ReturnsPagedResults()
    {
        var products = SeedProducts();
        var ctrl = CreateController(products, 4);

        var result = await ctrl.GetProducts(new ProductSpecParams { PageIndex = 1, PageSize = 10 });

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var paged = Assert.IsType<API.RequestHelpers.Pagination<Product>>(ok.Value);
        Assert.Equal(4, paged.Count);
        Assert.Equal(4, paged.Data.Count);
    }

    [Fact]
    public async Task GetProducts_FilterByBrand_ReturnsMatchingProducts()
    {
        var solenya = SeedProducts().Where(p => p.Brand == "Solenya").ToList().AsReadOnly();
        var ctrl = CreateController(solenya, 1);

        var result = await ctrl.GetProducts(new ProductSpecParams
        {
            PageIndex = 1, PageSize = 10,
            Brands = new List<string> { "Solenya" }
        });

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var paged = Assert.IsType<API.RequestHelpers.Pagination<Product>>(ok.Value);
        Assert.All(paged.Data, p => Assert.Equal("Solenya", p.Brand));
    }

    [Fact]
    public async Task GetProducts_FilterByType_ReturnsMatchingProducts()
    {
        var toners = SeedProducts().Where(p => p.Type == "Toner").ToList().AsReadOnly();
        var ctrl = CreateController(toners, 1);

        var result = await ctrl.GetProducts(new ProductSpecParams
        {
            PageIndex = 1, PageSize = 10,
            Types = new List<string> { "Toner" }
        });

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var paged = Assert.IsType<API.RequestHelpers.Pagination<Product>>(ok.Value);
        Assert.All(paged.Data, p => Assert.Equal("Toner", p.Type));
    }

    [Fact]
    public async Task GetProducts_SearchByKeyword_ReturnsMatchingProducts()
    {
        var matches = SeedProducts()
            .Where(p => p.Name.Contains("Serum", StringComparison.OrdinalIgnoreCase))
            .ToList().AsReadOnly();
        var ctrl = CreateController(matches, 1);

        var result = await ctrl.GetProducts(new ProductSpecParams
        {
            PageIndex = 1, PageSize = 10,
            Search = "Serum"
        });

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var paged = Assert.IsType<API.RequestHelpers.Pagination<Product>>(ok.Value);
        Assert.True(paged.Data.All(p => p.Name.Contains("Serum", StringComparison.OrdinalIgnoreCase)));
    }

    [Fact]
    public async Task GetProducts_SortByPriceAsc_ReturnsSortedResults()
    {
        var sorted = SeedProducts().OrderBy(p => p.Price).ToList().AsReadOnly();
        var ctrl = CreateController(sorted);

        var result = await ctrl.GetProducts(new ProductSpecParams
        {
            PageIndex = 1, PageSize = 10, Sort = "priceAsc"
        });

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var paged = Assert.IsType<API.RequestHelpers.Pagination<Product>>(ok.Value);
        var prices = paged.Data.Select(p => p.Price).ToList();
        Assert.Equal(prices.OrderBy(x => x), prices);
    }

    [Fact]
    public async Task GetProducts_SortByPriceDesc_ReturnsSortedResults()
    {
        var sorted = SeedProducts().OrderByDescending(p => p.Price).ToList().AsReadOnly();
        var ctrl = CreateController(sorted);

        var result = await ctrl.GetProducts(new ProductSpecParams
        {
            PageIndex = 1, PageSize = 10, Sort = "priceDesc"
        });

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var paged = Assert.IsType<API.RequestHelpers.Pagination<Product>>(ok.Value);
        var prices = paged.Data.Select(p => p.Price).ToList();
        Assert.Equal(prices.OrderByDescending(x => x), prices);
    }

    [Fact]
    public async Task GetProductById_WithValidId_ReturnsProduct()
    {
        var repoMock = new Mock<IGenericRepository<Product>>();
        repoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(SeedProducts()[0]);

        var ctrl = CreateControllerWithRepo(repoMock);
        var result = await ctrl.GetProduct(1);

        var product = Assert.IsType<Product>(result.Value);
        Assert.Equal(1, product.Id);
        Assert.Equal("Lunara Dew Essence", product.Name);
    }

    [Fact]
    public async Task GetProductById_WithInvalidId_Returns404()
    {
        var repoMock = new Mock<IGenericRepository<Product>>();
        repoMock.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Product?)null);

        var ctrl = CreateControllerWithRepo(repoMock);
        var result = await ctrl.GetProduct(999);

        Assert.IsType<NotFoundResult>(result.Result);
    }
}
