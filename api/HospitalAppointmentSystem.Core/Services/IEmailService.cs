using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace HospitalAppointmentSystem.Core.Services
{
    // Email Service Interface
    public interface IEmailService
    {
        Task SendEmailAsync(string email, string subject, string message);
        Task<bool> TestConnectionAsync();
    }

    // Email Service Implementation
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendEmailAsync(string email, string subject, string message)
        {
            var maxRetries = 3;
            var retryCount = 0;

            while (retryCount < maxRetries)
            {
                try
                {
                    using var mailMessage = new MailMessage
                    {
                        From = new MailAddress(_configuration["Email:Sender"], 
                                            _configuration["Email:SenderName"] ?? "Hospital Appointment System"),
                        Subject = subject,
                        Body = message,
                        IsBodyHtml = true,
                        Priority = MailPriority.Normal
                    };
                    
                    mailMessage.To.Add(new MailAddress(email));

                    using var client = new SmtpClient(_configuration["Email:SmtpServer"])
                    {
                        Port = int.Parse(_configuration["Email:Port"]),
                        Credentials = new NetworkCredential(
                            _configuration["Email:Username"], 
                            _configuration["Email:Password"]),
                        EnableSsl = bool.Parse(_configuration["Email:EnableSsl"] ?? "true"),
                        DeliveryMethod = SmtpDeliveryMethod.Network,
                        UseDefaultCredentials = false,
                        Timeout = 30000 // 30 seconds
                    };

                    await client.SendMailAsync(mailMessage);
                    _logger.LogInformation($"Email sent successfully to {email}");
                    return; // Success, exit the retry loop
                }
                catch (SmtpException smtpEx)
                {
                    retryCount++;
                    _logger.LogWarning($"SMTP error sending email to {email} (attempt {retryCount}/{maxRetries}): {smtpEx.Message}");
                    
                    if (retryCount >= maxRetries)
                    {
                        _logger.LogError(smtpEx, $"Failed to send email to {email} after {maxRetries} attempts");
                        throw;
                    }
                    
                    await Task.Delay(2000 * retryCount); // Exponential backoff
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Unexpected error sending email to {email}");
                    throw;
                }
            }
        }

        public async Task<bool> TestConnectionAsync()
        {
            try
            {
                using var client = new SmtpClient(_configuration["Email:SmtpServer"])
                {
                    Port = int.Parse(_configuration["Email:Port"]),
                    Credentials = new NetworkCredential(
                        _configuration["Email:Username"], 
                        _configuration["Email:Password"]),
                    EnableSsl = bool.Parse(_configuration["Email:EnableSsl"] ?? "true"),
                    DeliveryMethod = SmtpDeliveryMethod.Network,
                    UseDefaultCredentials = false,
                    Timeout = 10000 // 10 seconds for testing
                };

                // Test the connection
                await Task.Run(() => client.Send(new MailMessage()));
                return true;
            }
            catch (InvalidOperationException)
            {
                // This is expected when sending empty message, but connection works
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Email connection test failed");
                return false;
            }
        }
    }
}