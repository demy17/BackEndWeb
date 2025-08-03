using HospitalAppointmentSystem.Core.Entites;
using HospitalAppointmentSystem.Core.Services;

namespace HospitalAppointmentSystem.API.Messaging
{
    public class AppointmentMessageHandler
    {
        private readonly IEmailService _emailService;
        private readonly ILogger<AppointmentMessageHandler> _logger;

        public AppointmentMessageHandler(IEmailService emailService, ILogger<AppointmentMessageHandler> logger)
        {
            _emailService = emailService;
            _logger = logger;
        }

        public async Task HandleAppointmentCreated(AppointmentCreatedMessage message)
        {
            try
            {
                var subject = "Appointment Confirmation";
                var body = $@"
                    <h2>Appointment Confirmation</h2>
                    <p>Dear {message.PatientName},</p>
                    <p>Your appointment has been scheduled with the following details:</p>
                    <ul>
                        <li><strong>Doctor:</strong> {message.DoctorName}</li>
                        <li><strong>Date & Time:</strong> {message.AppointmentDate:yyyy-MM-dd HH:mm}</li>
                        <li><strong>Status:</strong> {message.Status}</li>
                    </ul>
                    <p>Please arrive 15 minutes before your scheduled time.</p>
                    <p>Thank you for choosing our hospital.</p>
                ";

                await _emailService.SendEmailAsync(message.PatientEmail, subject, body);
                _logger.LogInformation($"Appointment created notification sent to {message.PatientEmail}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send appointment created notification to {message.PatientEmail}");
            }
        }

        public async Task HandleAppointmentCancelled(AppointmentCancelledMessage message)
        {
            try
            {
                // Notify patient
                var patientSubject = "Appointment Cancelled";
                var patientBody = $@"
                    <h2>Appointment Cancellation</h2>
                    <p>Dear {message.PatientName},</p>
                    <p>Your appointment scheduled for {message.AppointmentDate:yyyy-MM-dd HH:mm} with Dr. {message.DoctorName} has been cancelled.</p>
                    <p><strong>Cancelled by:</strong> {message.CancelledBy}</p>
                    {(!string.IsNullOrEmpty(message.Reason) ? $"<p><strong>Reason:</strong> {message.Reason}</p>" : "")}
                    <p>Please contact us to reschedule your appointment.</p>
                ";

                await _emailService.SendEmailAsync(message.PatientEmail, patientSubject, patientBody);

                // Notify doctor if cancelled by patient
                if (message.CancelledBy == "Patient" && !string.IsNullOrEmpty(message.DoctorEmail))
                {
                    var doctorSubject = "Patient Appointment Cancelled";
                    var doctorBody = $@"
                        <h2>Appointment Cancellation Notice</h2>
                        <p>Dear Dr. {message.DoctorName},</p>
                        <p>The appointment scheduled for {message.AppointmentDate:yyyy-MM-dd HH:mm} with {message.PatientName} has been cancelled by the patient.</p>
                        <p>Your schedule slot is now available.</p>
                    ";

                    await _emailService.SendEmailAsync(message.DoctorEmail, doctorSubject, doctorBody);
                }

                _logger.LogInformation($"Appointment cancellation notifications sent for appointment {message.AppointmentId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send appointment cancellation notifications for appointment {message.AppointmentId}");
            }
        }

        public async Task HandleAppointmentReminder(AppointmentReminderMessage message)
        {
            try
            {
                var subject = "Appointment Reminder";
                var timeUntil = message.ReminderType == "24hours" ? "tomorrow" : "in 2 hours";
                
                var body = $@"
                    <h2>Appointment Reminder</h2>
                    <p>Dear {message.PatientName},</p>
                    <p>This is a reminder that you have an appointment {timeUntil}:</p>
                    <ul>
                        <li><strong>Doctor:</strong> {message.DoctorName}</li>
                        <li><strong>Date & Time:</strong> {message.AppointmentDate:yyyy-MM-dd HH:mm}</li>
                    </ul>
                    <p>Please arrive 15 minutes before your scheduled time.</p>
                    <p>If you need to cancel or reschedule, please contact us at least 48 hours in advance.</p>
                ";

                await _emailService.SendEmailAsync(message.PatientEmail, subject, body);
                _logger.LogInformation($"Appointment reminder sent to {message.PatientEmail} for appointment {message.AppointmentId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send appointment reminder to {message.PatientEmail}");
            }
        }

        public async Task HandlePrescriptionCreated(PrescriptionCreatedMessage message)
        {
            try
            {
                var subject = "New Prescription";
                var body = $@"
                    <h2>New Prescription</h2>
                    <p>Dear {message.PatientName},</p>
                    <p>Dr. {message.DoctorName} has prescribed the following medication:</p>
                    <ul>
                        <li><strong>Medication:</strong> {message.Medication}</li>
                        <li><strong>Dosage:</strong> {message.Dosage}</li>
                        <li><strong>Duration:</strong> {message.Duration.Days} days</li>
                        <li><strong>Instructions:</strong> {message.Instructions}</li>
                    </ul>
                    <p>Please follow the instructions carefully and contact us if you have any questions.</p>
                ";

                await _emailService.SendEmailAsync(message.PatientEmail, subject, body);
                _logger.LogInformation($"Prescription notification sent to {message.PatientEmail}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send prescription notification to {message.PatientEmail}");
            }
        }
    }
}
