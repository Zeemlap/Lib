using System;

namespace Com.Jab.Enterprise.Redit
{
    public class ReliableMessageChannelAddException : Exception
    {
        public ReliableMessageChannelAddException(bool didFailOnNotifyingConsumers, Exception innerException, string message = null)
            : base(message, innerException)
        {
            DidFailOnNotifyingConsumers = didFailOnNotifyingConsumers;
        }

        public bool DidFailOnNotifyingConsumers { get; }

        

    }
}
