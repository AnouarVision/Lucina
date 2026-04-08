using Infrastructure.Data;
using Core.Interfaces;
using API.Middleware;
using Microsoft.EntityFrameworkCore;
using API.Services;
using StackExchange.Redis;
using Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
DotNetEnv.Env.TraversePath().Load();

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
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowedOrigins", policyBuilder =>
    {
        policyBuilder
            .WithOrigins("https://localhost:4200", "https://localhost:5001")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// RedisService as a singleton
builder.Services.AddSingleton(new RedisService("localhost:6379"));
builder.Services.AddScoped<CartService>();
builder.Services.AddScoped<IStockReservationService, StockReservationService>();

// Payment Service
builder.Services.AddScoped<IPaymentService, PaymentService>();

// Email Service
builder.Services.AddScoped<IEmailService, EmailService>();

// HttpClient for Gemini
builder.Services.AddHttpClient();

// User Repository and Auth Service
builder.Services.AddScoped<IUserRepository, UserRepository>();
var jwtSecretKey = builder.Configuration["Jwt:SecretKey"] ?? "your_super_secret_jwt_key_min_32_characters_long_12345678";
var jwtExpirationMinutes = int.Parse(builder.Configuration["Jwt:ExpirationMinutes"] ?? "15");
builder.Services.AddScoped<IAuthService>(provider =>
    new AuthService(provider.GetRequiredService<IUserRepository>(), jwtSecretKey, jwtExpirationMinutes));

// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtSecretKey)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                context.Token = context.Request.Cookies["access_token"];
                return Task.CompletedTask;
            }
        };
    });

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseMiddleware<ExceptionMiddleware>();

// Security headers
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    await next();
});

app.UseHttpsRedirection();

/*Enables CORS with specific settings: allows any header and method, but restricts
 requests to the specified origins (Angular frontend and local API).*/
app.UseCors("AllowedOrigins");

//Enables static files from wwwroot
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

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
