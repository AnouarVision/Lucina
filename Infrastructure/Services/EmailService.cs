using Core.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;

namespace Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly string _host;
    private readonly int _port;
    private readonly string _from;
    private readonly string _displayName;
    private readonly string? _username;
    private readonly string? _password;
    private readonly bool _useSsl;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _logger      = logger;
        _host        = config["Email:Smtp:Host"]        ?? "localhost";
        _port        = int.Parse(config["Email:Smtp:Port"] ?? "25");
        _from        = config["Email:Smtp:From"]        ?? "noreply@lucina.local";
        _displayName = config["Email:Smtp:DisplayName"] ?? "Lucina";
        _username    = config["Email:Smtp:Username"];
        _password    = config["Email:Smtp:Password"];
        _useSsl      = bool.Parse(config["Email:Smtp:UseSsl"] ?? "false");

        _logger.LogInformation("EmailService configured: {Host}:{Port} from {From}", _host, _port, _from);
    }

    public async Task SendAsync(string to, string subject, string htmlBody)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_displayName, _from));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;
        message.Body = new TextPart("html") { Text = htmlBody };

        using var client = new SmtpClient();

        var socketOptions = _useSsl
            ? SecureSocketOptions.SslOnConnect
            : SecureSocketOptions.None;

        await client.ConnectAsync(_host, _port, socketOptions);

        if (!string.IsNullOrWhiteSpace(_username) && !string.IsNullOrWhiteSpace(_password))
            await client.AuthenticateAsync(_username, _password);

        await client.SendAsync(message);
        await client.DisconnectAsync(true);

        _logger.LogInformation("Email sent to {To} via {Host}:{Port}", to, _host, _port);
    }
}
