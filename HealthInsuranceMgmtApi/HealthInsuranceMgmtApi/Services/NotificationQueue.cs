using System.Threading.Channels;
using HealthInsuranceMgmtApi.Models;

namespace HealthInsuranceMgmtApi.Services;

public static class NotificationQueue
{
    private static readonly Channel<NotificationEvent> _channel = 
        Channel.CreateUnbounded<NotificationEvent>();

    public static ChannelWriter<NotificationEvent> Writer => _channel.Writer;
    public static ChannelReader<NotificationEvent> Reader => _channel.Reader;

    public static async Task EnqueueAsync(NotificationEvent notification)
    {
        await Writer.WriteAsync(notification);
    }
}