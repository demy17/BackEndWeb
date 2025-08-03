using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace HospitalAppointmentSystem.API.Messaging
{
    public class RabbitMqService : IDisposable
    {
        private readonly IConnection _connection;
        private readonly IModel _channel;
        private readonly ILogger<RabbitMqService> _logger;
        private readonly string _exchangeName = "hospital.appointments";
        private bool _disposed = false;

        public RabbitMqService(IConfiguration configuration, ILogger<RabbitMqService> logger)
        {
            _logger = logger;

            var factory = new ConnectionFactory()
            {
                HostName = configuration["RabbitMQ:HostName"] ?? "localhost",
                UserName = configuration["RabbitMQ:UserName"] ?? "guest",
                Password = configuration["RabbitMQ:Password"] ?? "guest",
                Port = int.Parse(configuration["RabbitMQ:Port"] ?? "5672"),
                VirtualHost = configuration["RabbitMQ:VirtualHost"] ?? "/",
                RequestedHeartbeat = TimeSpan.FromSeconds(60),
                NetworkRecoveryInterval = TimeSpan.FromSeconds(10),
                AutomaticRecoveryEnabled = true
            };

            try
            {
                _connection = factory.CreateConnection();
                _channel = _connection.CreateModel();

                // Declare exchange
                _channel.ExchangeDeclare(exchange: _exchangeName, type: ExchangeType.Topic, durable: true);

                // Declare queues
                DeclareQueues();

                _logger.LogInformation("RabbitMQ connection established successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to establish RabbitMQ connection");
                // throw;
            }
        }

        private void DeclareQueues()
        {
            if (_channel == null || _channel.IsClosed) return;

            var queues = new[]
            {
                "appointment.created",
                "appointment.updated",
                "appointment.cancelled",
                "appointment.approved",
                "appointment.reminder",
                "prescription.created",
                "prescription.updated"
            };
            
            foreach (var queue in queues)
            {
                try
                {
                    _channel.QueueDeclare(queue: queue, durable: true, exclusive: false, autoDelete: false);
                    _channel.QueueBind(queue: queue, exchange: _exchangeName, routingKey: queue);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Failed to declare queue: {queue}");
                }
            }
        }

        public async Task PublishAsync<T>(string routingKey, T message)
        {
            if (_channel == null || _channel.IsClosed)
            {
                _logger.LogWarning($"Cannot publish message to {routingKey} - channel is not available");
                return;
            }
            
            try
            {
                var json = JsonSerializer.Serialize(message, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });
                var body = Encoding.UTF8.GetBytes(json);

                var properties = _channel.CreateBasicProperties();
                properties.Persistent = true;
                properties.Timestamp = new AmqpTimestamp(DateTimeOffset.UtcNow.ToUnixTimeSeconds());

                _channel.BasicPublish(
                    exchange: _exchangeName,
                    routingKey: routingKey,
                    basicProperties: properties,
                    body: body);

                _logger.LogInformation($"Message published to {routingKey}: {json}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to publish message to {routingKey}");
                // throw;
            }
        }

        public void Subscribe<T>(string queueName, Func<T, Task> handler)
        {
            if (_channel == null || _channel.IsClosed)
            {
                _logger.LogWarning($"Cannot subscribe to {queueName} - channel is not available");
                return;
            }

            try
            {
                var consumer = new EventingBasicConsumer(_channel);
                
                consumer.Received += async (model, ea) =>
                {
                    try
                    {
                        var body = ea.Body.ToArray();
                        var json = Encoding.UTF8.GetString(body);
                        var message = JsonSerializer.Deserialize<T>(json, new JsonSerializerOptions
                        {
                            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                        });
                        
                        await handler(message);
                        
                        _channel.BasicAck(deliveryTag: ea.DeliveryTag, multiple: false);
                        _logger.LogInformation($"Message processed from {queueName}");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Error processing message from {queueName}");
                        _channel.BasicNack(deliveryTag: ea.DeliveryTag, multiple: false, requeue: true);
                    }
                };

                _channel.BasicConsume(queue: queueName, autoAck: false, consumer: consumer);
                _logger.LogInformation($"Subscribed to queue: {queueName}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to subscribe to queue: {queueName}");
            }
        }

        public void Dispose()
        {
            if (_disposed) return;

            try
            {
                _channel?.Close();
                _connection?.Close();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error disposing RabbitMQ connection");
            }
            finally
            {
                _channel?.Dispose();
                _connection?.Dispose();
                _disposed = true;
            }
        }
    }
}