using Microsoft.AspNetCore.Mvc;
using API.RequestHelpers;
using Core.Specifications;
using Core.Entities;
using Core.Interfaces;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(IGenericRepository<Product> repo, IStockReservationService reservation) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<Product>>> GetProducts(
		[FromQuery]ProductSpecParams specParams)
    {
		var spec = new ProductSpecification(specParams);

        return await CreatePagedResult(repo, spec, specParams.PageIndex, specParams.PageSize);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        var product = await repo.GetByIdAsync(id);

        if (product == null) return NotFound();

        return product;
    }

    [HttpGet("{id:int}/available-stock")]
    public async Task<ActionResult<int>> GetAvailableStock(int id, [FromQuery] string? userId = null)
    {
        var product = await repo.GetByIdAsync(id);
        if (product == null) return NotFound();

        int totalReserved = await reservation.GetTotalReservedAsync(id);
        int myReserved = userId != null ? await reservation.GetUserReservedAsync(userId, id) : 0;
        int available = product.QuantityInStock - (totalReserved - myReserved);

        return Ok(Math.Max(0, available));
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(Product product)
    {
        repo.Add(product);

		if(await repo.SaveAllAsync()){
			return CreatedAtAction("GetProduct", new { id = product.Id }, product);
		}

        return BadRequest("Problem creating product");
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult> UpdateProduct(int id, Product product)
    {
        if (product.Id != id || !ProductExists(id))
            return BadRequest("Cannot update this product");

        repo.Update(product);

        if(await repo.SaveAllAsync()){
			return NoContent();
		}

		return BadRequest("Problem updating the product");
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteProduct(int id)
    {
        var product = await repo.GetByIdAsync(id);

        if (product == null) return NotFound();

   		repo.Remove(product);

        if(await repo.SaveAllAsync()){
			return NoContent();
		}

		return BadRequest("Problem deleting the product");
    }

	[HttpGet("brands")]
	public async Task<ActionResult<IReadOnlyList<string>>> GetBrands(){
		var spec = new BrandListSpecification();
    	return Ok(await repo.ListAsync(spec));
	}

	[HttpGet("types")]
	public async Task<ActionResult<IReadOnlyList<string>>> GetTypes(){
		var spec = new TypeListSpecification();
    	return Ok(await repo.ListAsync(spec));
	}

    private bool ProductExists(int id)
    {
        return repo.Exists(id);
    }
}