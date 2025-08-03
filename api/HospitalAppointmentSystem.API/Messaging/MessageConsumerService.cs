using HospitalAppointmentSystem.Core.Entites;
using HospitalAppointmentSystem.API.Messaging;

namespace HospitalAppointmentSystem.API.Services
{
    public class MessageConsumerService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<MessageConsumerService> _logger;

        public MessageConsumerService(
            IServiceProvider serviceProvider,
            ILogger<MessageConsumerService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var rabbitMqService = scope.ServiceProvider.GetRequiredService<RabbitMqService>();
            var messageHandler = scope.ServiceProvider.GetRequiredService<AppointmentMessageHandler>();

            // Subscribe to different message types
            rabbitMqService.Subscribe<AppointmentCreatedMessage>("appointment.created", messageHandler.HandleAppointmentCreated);
            rabbitMqService.Subscribe<AppointmentCancelledMessage>("appointment.cancelled", messageHandler.HandleAppointmentCancelled);
            rabbitMqService.Subscribe<AppointmentReminderMessage>("appointment.reminder", messageHandler.HandleAppointmentReminder);
            rabbitMqService.Subscribe<PrescriptionCreatedMessage>("prescription.created", messageHandler.HandlePrescriptionCreated);

            _logger.LogInformation("Message consumer service started");

            // Keep the service running
            while (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(1000, stoppingToken);
            }
        }
    }
}
