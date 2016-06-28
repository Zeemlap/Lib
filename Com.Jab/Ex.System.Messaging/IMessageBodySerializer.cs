
using System.IO;
using System.Messaging;
using System.Threading.Tasks;

namespace Com.Jab.Ex.System.Messaging
{
    public interface IMessageBodySerializer<T>
    {
        T Deserialize(Message message);

        MessageBodySerializationStrategy GetSerializationStrategy(T item);
        object ConvertToObjectForSerializationUsingMessageFormatter(T item);
        Task SerializeAsync(T item, Stream stream);
    }
}
