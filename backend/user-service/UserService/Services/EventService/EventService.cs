using RabbitMQ.Client;
using System.Text;
using System.Text.Json;

namespace UserService.Services.EventService
{
    public interface IEventService
    {
        void PublishEvent(string eventName, object data);
    }

    public class EventService : IEventService, IDisposable
    {
        private readonly IConnection _connection;
        private readonly IModel _channel;
        private readonly string _exchangeName = "user_events";

        public EventService()
        {
            var factory = new ConnectionFactory
            {
                HostName = "rabbitmq",
                Port = 5672,
                UserName = "guest",
                Password = "guest"
            };

            _connection = factory.CreateConnection();
            _channel = _connection.CreateModel();
            
            _channel.ExchangeDeclare(_exchangeName, ExchangeType.Topic, durable: true);
            
            _channel.QueueDeclare(
                queue: "user-signuped",
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: null
            );
            
            _channel.QueueBind(
                queue: "user-signuped",
                exchange: _exchangeName,
                routingKey: "user-signuped"
            );
        }

        public void PublishEvent(string eventName, object data)
        {
            var message = JsonSerializer.Serialize(data);
            var body = Encoding.UTF8.GetBytes(message);

            _channel.BasicPublish(
                exchange: _exchangeName,
                routingKey: eventName,
                basicProperties: null,
                body: body
            );
            
            Console.WriteLine($" [x] Sent {eventName} event");
        }

        public void Dispose()
        {
            _channel?.Dispose();
            _connection?.Dispose();
        }
    }
} 