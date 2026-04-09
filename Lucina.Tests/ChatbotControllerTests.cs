using API.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Moq;
using Moq.Protected;

namespace Lucina.Tests;

public class ChatbotControllerTests
{
    private static ChatbotController CreateController()
    {
        var httpClientFactory = new Mock<IHttpClientFactory>();
        var config = new Mock<IConfiguration>();
        config.Setup(c => c["Gemini:ApiKey"]).Returns("test-api-key");
        config.Setup(c => c["Gemini:Model"]).Returns("gemini-2.5-flash");

        var ctrl = new ChatbotController(httpClientFactory.Object, config.Object);
        ctrl.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };
        return ctrl;
    }

    [Fact]
    public async Task SendMessage_WithEmptyMessage_Returns400()
    {
        var ctrl = CreateController();
        var result = await ctrl.SendMessage(new ChatRequestDto
        {
            Message = "",
            ConversationHistory = new List<ChatMessageDto>()
        });

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task SendMessage_ExceedingCharLimit_Returns400()
    {
        var ctrl = CreateController();
        var result = await ctrl.SendMessage(new ChatRequestDto
        {
            Message = new string('a', 501),
            ConversationHistory = new List<ChatMessageDto>()
        });

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task SendMessage_WithHistoryExceedingLimit_Returns400()
    {
        var ctrl = CreateController();
        var history = Enumerable.Range(0, 21).Select(_ =>
            new ChatMessageDto { Text = "hi", Sender = "user" }).ToList();

        var result = await ctrl.SendMessage(new ChatRequestDto
        {
            Message = "Hello",
            ConversationHistory = history
        });

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task SendMessage_WithInvalidSenderField_Returns400()
    {
        var ctrl = CreateController();
        var result = await ctrl.SendMessage(new ChatRequestDto
        {
            Message = "Hello",
            ConversationHistory = new List<ChatMessageDto>
            {
                new() { Text = "Hello", Sender = "admin" }
            }
        });

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task SendMessage_WithHistoryMessageTooLong_Returns400()
    {
        var ctrl = CreateController();
        var result = await ctrl.SendMessage(new ChatRequestDto
        {
            Message = "Hello",
            ConversationHistory = new List<ChatMessageDto>
            {
                new() { Text = new string('x', 501), Sender = "user" }
            }
        });

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task SendMessage_WithValidInput_CallsGemini()
    {
        var responseJson = """
        {
          "candidates": [{
            "content": {
              "parts": [{ "text": "Certo, ti consiglio il Solenya Bright Serum!" }]
            }
          }]
        }
        """;
        var httpResponse = new HttpResponseMessage(System.Net.HttpStatusCode.OK)
        {
            Content = new StringContent(responseJson, System.Text.Encoding.UTF8, "application/json")
        };

        var handlerMock = new Mock<System.Net.Http.HttpMessageHandler>();
        handlerMock.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(httpResponse);

        var httpClient = new HttpClient(handlerMock.Object);
        var factoryMock = new Mock<IHttpClientFactory>();
        factoryMock.Setup(f => f.CreateClient(It.IsAny<string>())).Returns(httpClient);

        var config = new Mock<IConfiguration>();
        config.Setup(c => c["Gemini:ApiKey"]).Returns("test-key");
        config.Setup(c => c["Gemini:Model"]).Returns("gemini-2.5-flash");

        var ctrl = new ChatbotController(factoryMock.Object, config.Object);
        ctrl.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };

        var result = await ctrl.SendMessage(new ChatRequestDto
        {
            Message = "Mi consigli un siero?",
            ConversationHistory = new List<ChatMessageDto>()
        });

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var dto = Assert.IsType<ChatResponseDto>(ok.Value);
        Assert.False(string.IsNullOrEmpty(dto.Message));
    }
}
