using Infrastructure.Data;
using Core.Interfaces;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddDbContext<StoreContext>(opt =>
{
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

/*Adds ProductRepository as the implementation of IProductRepository with a scoped lifetime.
A new instance will be created per HTTP request.*/
builder.Services.AddScoped<IProductRepository, ProductRepository>();

// Dependency injection for generic repository
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));    
var app = builder.Build();

app.MapControllers();

try{
	using var scope = app.Services.CreateScope();
	var services = scope.ServiceProvider;
	var context = services.GetRequiredService<StoreContext>();
	await context.Database.MigrateAsync();
	await StoreContextSeed.SeedAsync(context);
}
catch (System.Exception ex) {
	Console.WriteLine(ex);
	throw;
}

app.Run();
