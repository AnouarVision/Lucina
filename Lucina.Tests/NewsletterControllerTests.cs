using API.Controllers;
using Core.Entities;
using Core.Interfaces;
using Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;

namespace Lucina.Tests;

public class NewsletterControllerTests
{
    private static StoreContext CreateDb(string name)
    {
        var opts = new DbContextOptionsBuilder<StoreContext>()
            .UseInMemoryDatabase(name)
            .Options;
        return new StoreContext(opts);
    }

    private static NewsletterController CreateController(StoreContext ctx, Mock<IEmailService>? emailMock = null)
    {
        emailMock ??= new Mock<IEmailService>();
        emailMock.Setup(e => e.SendAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                 .Returns(Task.CompletedTask);

        var ctrl = new NewsletterController(ctx, emailMock.Object, NullLogger<NewsletterController>.Instance);
        ctrl.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };
        return ctrl;
    }

    [Fact]
    public async Task Subscribe_WithNewEmail_CreatesSubscription()
    {
        await using var ctx = CreateDb("Newsletter_New");
        var ctrl = CreateController(ctx);

        var result = await ctrl.Subscribe(new NewsletterController.SubscribeRequest("new@example.com"));

        Assert.IsType<OkObjectResult>(result);
        var sub = await ctx.NewsletterSubscriptions.FirstOrDefaultAsync(s => s.Email == "new@example.com");
        Assert.NotNull(sub);
        Assert.True(sub!.IsActive);
    }

    [Fact]
    public async Task Subscribe_WithExistingEmail_Returns409()
    {
        await using var ctx = CreateDb("Newsletter_Duplicate");
        ctx.NewsletterSubscriptions.Add(new NewsletterSubscription
        {
            Email = "existing@example.com",
            IsActive = true
        });
        await ctx.SaveChangesAsync();

        var ctrl = CreateController(ctx);
        var result = await ctrl.Subscribe(new NewsletterController.SubscribeRequest("existing@example.com"));

        Assert.IsType<ConflictObjectResult>(result);
    }

    [Fact]
    public async Task Subscribe_SendsWelcomeEmail()
    {
        await using var ctx = CreateDb("Newsletter_Email");
        var emailMock = new Mock<IEmailService>();
        emailMock.Setup(e => e.SendAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                 .Returns(Task.CompletedTask);

        var ctrl = CreateController(ctx, emailMock);
        await ctrl.Subscribe(new NewsletterController.SubscribeRequest("welcome@example.com"));
        await Task.Delay(200);
        emailMock.Verify(e => e.SendAsync("welcome@example.com", It.IsAny<string>(), It.IsAny<string>()), Times.Once);
    }

    [Fact]
    public async Task Unsubscribe_SetsIsActiveFalse()
    {
        await using var ctx = CreateDb("Newsletter_Unsubscribe");
        ctx.NewsletterSubscriptions.Add(new NewsletterSubscription
        {
            Email = "unsub@example.com",
            IsActive = true
        });
        await ctx.SaveChangesAsync();

        var ctrl = CreateController(ctx);
        await ctrl.Unsubscribe("unsub@example.com");

        var sub = await ctx.NewsletterSubscriptions.FirstAsync(s => s.Email == "unsub@example.com");
        Assert.False(sub.IsActive);
    }

    [Fact]
    public async Task Unsubscribe_PreservesRecord()
    {
        await using var ctx = CreateDb("Newsletter_Preserve");
        ctx.NewsletterSubscriptions.Add(new NewsletterSubscription
        {
            Email = "preserve@example.com",
            IsActive = true
        });
        await ctx.SaveChangesAsync();

        var ctrl = CreateController(ctx);
        await ctrl.Unsubscribe("preserve@example.com");

        Assert.True(await ctx.NewsletterSubscriptions.AnyAsync(s => s.Email == "preserve@example.com"));
    }
}
