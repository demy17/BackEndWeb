using HospitalAppointmentSystem.Core;
using HospitalAppointmentSystem.Core.Entites;
using HospitalAppointmentSystem.API.Messaging;
using Microsoft.EntityFrameworkCore;
using HospitalAppointmentSystem.Infrastructure;

namespace HospitalAppointmentSystem.API.Services
{
    public class AppointmentReminderService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<AppointmentReminderService> _logger;
        private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(30); // Check every 30 minutes

        public AppointmentReminderService(
            IServiceProvider serviceProvider,
            ILogger<AppointmentReminderService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessAppointmentReminders();
                    await Task.Delay(_checkInterval, stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in appointment reminder service");
                    await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken); // Wait 5 minutes before retrying
                }
            }
        }

        private async Task ProcessAppointmentReminders()
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<HospitalDbContext>();
            var rabbitMqService = scope.ServiceProvider.GetRequiredService<RabbitMqService>();

            var now = DateTime.UtcNow;
            var tomorrow = now.AddDays(1);
            var in2Hours = now.AddHours(2);

            // Get appointments that need 24-hour reminders
            var appointmentsFor24HourReminder = await context.Appointments
                .Include(a => a.Patient)
                    .ThenInclude(p => p.User)
                .Include(a => a.Doctor)
                    .ThenInclude(d => d.User)
                .Where(a => a.AppointmentDate >= tomorrow.AddMinutes(-15) && 
                           a.AppointmentDate <= tomorrow.AddMinutes(15) &&
                           a.Status == Core.Enums.NewStatus.Approved &&
                           !a.Reminder24HourSent)
                .ToListAsync();

            // Get appointments that need 2-hour reminders
            var appointmentsFor2HourReminder = await context.Appointments
                .Include(a => a.Patient)
                    .ThenInclude(p => p.User)
                .Include(a => a.Doctor)
                    .ThenInclude(d => d.User)
                .Where(a => a.AppointmentDate >= in2Hours.AddMinutes(-15) && 
                           a.AppointmentDate <= in2Hours.AddMinutes(15) &&
                           a.Status == Core.Enums.NewStatus.Approved &&
                           !a.Reminder2HourSent)
                .ToListAsync();

            // Send 24-hour reminders
            foreach (var appointment in appointmentsFor24HourReminder)
            {
                var message = new AppointmentReminderMessage
                {
                    AppointmentId = appointment.Id,
                    PatientEmail = appointment.Patient.User.Email,
                    PatientName = $"{appointment.Patient.User.FirstName} {appointment.Patient.User.LastName}",
                    DoctorName = $"Dr. {appointment.Doctor.User.FirstName} {appointment.Doctor.User.LastName}",
                    AppointmentDate = appointment.AppointmentDate,
                    ReminderType = "24hours"
                };

                await rabbitMqService.PublishAsync("appointment.reminder", message);
                
                appointment.Reminder24HourSent = true;
                _logger.LogInformation($"24-hour reminder sent for appointment {appointment.Id}");
            }

            // Send 2-hour reminders
            foreach (var appointment in appointmentsFor2HourReminder)
            {
                var message = new AppointmentReminderMessage
                {
                    AppointmentId = appointment.Id,
                    PatientEmail = appointment.Patient.User.Email,
                    PatientName = $"{appointment.Patient.User.FirstName} {appointment.Patient.User.LastName}",
                    DoctorName = $"Dr. {appointment.Doctor.User.FirstName} {appointment.Doctor.User.LastName}",
                    AppointmentDate = appointment.AppointmentDate,
                    ReminderType = "2hours"
                };

                await rabbitMqService.PublishAsync("appointment.reminder", message);
                
                appointment.Reminder2HourSent = true;
                _logger.LogInformation($"2-hour reminder sent for appointment {appointment.Id}");
            }

            // Save changes to database
            if (appointmentsFor24HourReminder.Any() || appointmentsFor2HourReminder.Any())
            {
                await context.SaveChangesAsync();
                _logger.LogInformation($"Processed {appointmentsFor24HourReminder.Count} 24-hour reminders and {appointmentsFor2HourReminder.Count} 2-hour reminders");
            }
        }
    }
}
