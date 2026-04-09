using API.Controllers;
using API.DTOs;
using Infrastructure.Data;
using Infrastructure.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace Lucina.Tests;

public class AuthControllerTests
{
    private static StoreContext CreateDb(string name)
    {
        var opts = new DbContextOptionsBuilder<StoreContext>()
            .UseInMemoryDatabase(name)
            .Options;
        return new StoreContext(opts);
    }

    private static AuthController CreateController(Mock<IAuthService> svcMock, DefaultHttpContext? httpContext = null)
    {
        var ctx = CreateDb($"auth_ctrl_{Guid.NewGuid()}");
        var ctrl = new AuthController(svcMock.Object, ctx);
        ctrl.ControllerContext = new ControllerContext
        {
            HttpContext = httpContext ?? new DefaultHttpContext()
        };
        return ctrl;
    }

    [Fact]
    public async Task Register_WithMissingConsent_Returns400()
    {
        var svcMock = new Mock<IAuthService>();
        var ctrl = CreateController(svcMock);
        ctrl.ModelState.AddModelError("GdprConsent", "You must accept the privacy policy.");

        var result = await ctrl.Signup(new SignupRequestDto
        {
            Name = "Eve",
            Email = "eve@example.com",
            Password = "password123"
        });

        Assert.IsType<BadRequestObjectResult>(result);
    }


    [Fact]
    public async Task Logout_ClearsCookies()
    {
        var svcMock = new Mock<IAuthService>();
        svcMock.Setup(s => s.RevokeRefreshTokenAsync(It.IsAny<string>()))
               .Returns(Task.CompletedTask);

        var httpContext = new DefaultHttpContext();
        httpContext.Request.Headers["Cookie"] = "refresh_token=some-token; access_token=old-access";

        var ctrl = CreateController(svcMock, httpContext);
        await ctrl.Logout();

        var setCookieHeaders = httpContext.Response.Headers["Set-Cookie"].ToArray();
        Assert.True(setCookieHeaders.Any(h => h != null && h.Contains("access_token=")),
            "Expected access_token deletion Set-Cookie header");
        Assert.True(setCookieHeaders.Any(h => h != null && h.Contains("refresh_token=")),
            "Expected refresh_token deletion Set-Cookie header");
    }
}
