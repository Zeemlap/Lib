using System;
using System.IO;
using System.Messaging;
using System.Threading.Tasks;

namespace Com.Jab.Ex.System.Messaging
{
    internal class MessageBodySerializer<T> : IMessageBodySerializer<T>
    {
        internal static readonly MessageBodySerializer<T> Instance = new MessageBodySerializer<T>();

        private MessageBodySerializer()
        {
        }

        public T Deserialize(Message message)
        {
            return (T)message.Body;
        }

        public MessageBodySerializationStrategy GetSerializationStrategy(T item)
        {
            return MessageBodySerializationStrategy.ConvertToObjectForSerializationUsingMessageFormatter;
        }

        public object ConvertToObjectForSerializationUsingMessageFormatter(T item)
        {
            return item;
        }

        public Task SerializeAsync(T item, Stream stream)
        {
            throw new NotSupportedException();
        }
    }
}
