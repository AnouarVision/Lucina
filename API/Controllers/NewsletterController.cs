using Core.Entities;
using Core.Interfaces;
using Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.ComponentModel.DataAnnotations;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NewsletterController : BaseApiController
{
    private readonly StoreContext _context;
    private readonly IEmailService _emailService;
    private readonly ILogger<NewsletterController> _logger;

    public NewsletterController(StoreContext context, IEmailService emailService, ILogger<NewsletterController> logger)
    {
        _context = context;
        _emailService = emailService;
        _logger = logger;
    }

    public record SubscribeRequest([Required][EmailAddress] string Email);

    [HttpPost("subscribe")]
    public async Task<ActionResult> Subscribe([FromBody] SubscribeRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { message = "Email non valida." });

        var email = request.Email.Trim().ToLowerInvariant();

        var existing = await _context.NewsletterSubscriptions
            .FirstOrDefaultAsync(s => s.Email == email);

        bool isNew = true;

        if (existing != null)
        {
            if (existing.IsActive)
                return Conflict(new { message = "Questa email è già iscritta alla newsletter." });

            existing.IsActive = true;
            existing.SubscribedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            isNew = false;
        }
        else
        {
            _context.NewsletterSubscriptions.Add(new NewsletterSubscription { Email = email });
            await _context.SaveChangesAsync();
        }

        _ = SendConfirmationEmailAsync(email, isNew);

        return Ok(new { message = "Iscrizione avvenuta con successo! Controlla la tua email per il codice sconto." });
    }

    [HttpDelete("unsubscribe")]
    public async Task<ActionResult> Unsubscribe([FromQuery][EmailAddress] string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return BadRequest(new { message = "Email non valida." });

        var normalised = email.Trim().ToLowerInvariant();
        var subscription = await _context.NewsletterSubscriptions
            .FirstOrDefaultAsync(s => s.Email == normalised && s.IsActive);

        if (subscription == null)
            return NotFound(new { message = "Iscrizione non trovata." });

        subscription.IsActive = false;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Disiscrizione avvenuta con successo." });
    }

    private async Task SendConfirmationEmailAsync(string email, bool isNew)
    {
        try
        {
            var subject = isNew
                ? "Benvenuta nella community Lucina!"
                : "La tua iscrizione Lucina è stata riattivata";

            var html = $"""
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f7f1eb;padding:40px 30px;border-radius:12px">
                  <h1 style="color:#a9876e;margin-bottom:8px">Lucina</h1>
                  <h2 style="color:#333;font-weight:normal">Grazie per esserti iscritto/a alla nostra newsletter!</h2>
                  <p style="color:#555;font-size:15px;line-height:1.6">
                    Come promesso, ecco il tuo codice sconto del <strong>10%</strong> sul primo ordine:
                  </p>
                  <div style="background:#fff;border:2px dashed #a9876e;border-radius:8px;padding:16px 24px;text-align:center;margin:24px 0">
                    <span style="font-size:28px;font-weight:bold;letter-spacing:4px;color:#a9876e">WELCOME15</span>
                  </div>
                  <p style="color:#777;font-size:13px">
                    Puoi disiscriverti in qualsiasi momento visitando il sito e cliccando su "Disiscriviti".
                  </p>
                  <hr style="border:none;border-top:1px solid #dcc6af;margin:24px 0"/>
                  <p style="color:#aaa;font-size:12px;text-align:center">
                    &copy; {DateTime.UtcNow.Year} Lucina - All rights reserved.
                  </p>
                </div>
                """;

            await _emailService.SendAsync(email, subject, html);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send newsletter confirmation email to {Email}", email);
        }
    }
}
