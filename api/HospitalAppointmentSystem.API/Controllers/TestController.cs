using Microsoft.AspNetCore.Mvc;
using HospitalAppointmentSystem.Core.Services;
using HospitalAppointmentSystem.API.Messaging;
using HospitalAppointmentSystem.Core.Entites;

namespace HospitalAppointmentSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private readonly RabbitMqService _rabbitMqService;
        private readonly ILogger<TestController> _logger;

        public TestController(
            IEmailService emailService, 
            RabbitMqService rabbitMqService,
            ILogger<TestController> logger)
        {
            _emailService = emailService;
            _rabbitMqService = rabbitMqService;
            _logger = logger;
        }

        [HttpPost("email")]
        public async Task<IActionResult> TestEmail([FromBody] TestEmailRequest request)
        {
            try
            {
                await _emailService.SendEmailAsync(
                    request.Email, 
                    "Test Email", 
                    "<h1>Test Email</h1><p>This is a test email from the Hospital Appointment System.</p>");
                
                return Ok(new { message = "Email sent successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send test email");
                return BadRequest(new { message = "Failed to send email", error = ex.Message });
            }
        }

        [HttpGet("email/connection")]
        public async Task<IActionResult> TestEmailConnection()
        {
            try
            {
                var isConnected = await _emailService.TestConnectionAsync();
                return Ok(new { connected = isConnected });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Email connection test failed");
                return BadRequest(new { connected = false, error = ex.Message });
            }
        }

        [HttpPost("rabbitmq")]
        public async Task<IActionResult> TestRabbitMQ()
        {
            try
            {
                var testMessage = new AppointmentCreatedMessage
                {
                    AppointmentId = 999,
                    PatientId = 1,
                    DoctorId = 1,
                    PatientEmail = "testinganytime110@gmail.com",
                    PatientName = "Test Patient",
                    DoctorName = "Dr. Test",
                    AppointmentDate = DateTime.Now.AddDays(1),
                    Status = "Pending",
                    CreatedAt = DateTime.Now
                };

                await _rabbitMqService.PublishAsync("appointment.created", testMessage);
                return Ok(new { message = "RabbitMQ message sent successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send RabbitMQ message");
                return BadRequest(new { message = "Failed to send RabbitMQ message", error = ex.Message });
            }
        }
    }

    public class TestEmailRequest
    {
        public string Email { get; set; }
    }
}
