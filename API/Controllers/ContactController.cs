using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Web;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactController : BaseApiController
{
    private readonly IEmailService _emailService;
    private readonly ILogger<ContactController> _logger;

    public ContactController(IEmailService emailService, ILogger<ContactController> logger)
    {
        _emailService = emailService;
        _logger = logger;
    }

    public record ContactRequest(
        [Required] string Name,
        [Required][EmailAddress] string Email,
        string? Phone,
        [Required] string Subject,
        [Required][MinLength(10)] string Message
    );

    [HttpPost("send")]
    public async Task<ActionResult> SendContactMessage([FromBody] ContactRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { message = "Dati non validi. Controlla i campi obbligatori." });

        try
        {
            var phoneRow = string.IsNullOrWhiteSpace(request.Phone)
                ? string.Empty
                : $"<tr><td><strong>Telefono:</strong></td><td>{Escape(request.Phone)}</td></tr>";

            var htmlBody = $"""
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                  <h2 style="color:#a9876e;">Nuovo messaggio — Modulo di contatto Lucina</h2>
                  <table style="border-collapse:collapse;width:100%;">
                    <tr><td style="padding:6px 12px;font-weight:bold;width:120px;">Nome:</td><td style="padding:6px 12px;">{Escape(request.Name)}</td></tr>
                    <tr style="background:#f9f9f9;"><td style="padding:6px 12px;font-weight:bold;">Email:</td><td style="padding:6px 12px;">{Escape(request.Email)}</td></tr>
                    {phoneRow}
                    <tr><td style="padding:6px 12px;font-weight:bold;">Oggetto:</td><td style="padding:6px 12px;">{Escape(request.Subject)}</td></tr>
                  </table>
                  <hr style="border:none;border-top:1px solid #e8dfd5;margin:16px 0;">
                  <p style="font-weight:bold;margin-bottom:8px;">Messaggio:</p>
                  <p style="line-height:1.6;color:#333;">{Escape(request.Message).Replace("\n", "<br>")}</p>
                  <hr style="border:none;border-top:1px solid #e8dfd5;margin:16px 0;">
                  <p style="color:#aaa;font-size:12px;">Inviato tramite il modulo di contatto di lucina.it</p>
                </div>
                """;

            await _emailService.SendAsync(
                to: "info@lucina.local",
                subject: $"[Contatto] {request.Subject} — da {request.Name}",
                htmlBody: htmlBody
            );

            _logger.LogInformation("Contact form submitted by {Email}", request.Email);
            return Ok(new { message = "Messaggio inviato con successo!" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send contact email from {Email}", request.Email);
            return StatusCode(500, new { message = "Errore nell'invio del messaggio. Riprova più tardi." });
        }
    }

    private static string Escape(string? s) => HttpUtility.HtmlEncode(s ?? string.Empty);
}
