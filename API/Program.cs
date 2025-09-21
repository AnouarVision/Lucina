using Infrastructure.Data;
using Core.Interfaces;
using API.Middleware;
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

// Registers CORS services to allow cross-origin requests from specified origins
builder.Services.AddCors();

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseMiddleware<ExceptionMiddleware>();

/*Enables CORS with specific settings: allows any header and method, but restricts
 requests to the specified origins (Angular frontend and local API).*/
app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod()
	.WithOrigins("https://localhost:4200", "https://localhost:5001"));

//Enables static files from wwwroot
app.UseStaticFiles();

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
