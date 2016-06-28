using System;
using System.Linq;
using System.Messaging;
using System.Threading;
using System.Threading.Tasks;

namespace Com.Jab.Ex.System.Messaging
{
    public class MessageQueue<T> : ITransactionalMessageQueue<T>, IMessageQueue<T>
    {
        private enum TimeoutHandling
        {
            OnTimeoutThrowTimeoutException,
            OnTimeoutThrowInvalidOperationException,
        }


        public MessageQueue(MessageQueue msmq, IMessageBodySerializer<T> messageBodySerializer = null)
        {
            if (msmq == null) throw new ArgumentNullException();
            
            BaseMessageQueue = msmq;
            MessageBodySerializer = messageBodySerializer ?? MessageBodySerializer<T>.Instance;
        }

        public IMessageBodySerializer<T> MessageBodySerializer { get; }

        public MessageQueue BaseMessageQueue { get; }

        public bool CanDequeue
        {
            get
            {
                return BaseMessageQueue.CanRead;
            }
        }

        public bool CanEnqueue
        {
            get
            {
                return BaseMessageQueue.CanWrite;
            }
        }

        private static TimeSpan GetTimeout(int timeoutMs)
        {
            if (timeoutMs <= 0)
            {
                if (timeoutMs == -1) return MessageQueue.InfiniteTimeout;
                throw new ArgumentOutOfRangeException();
            }
            return TimeSpan.FromMilliseconds(timeoutMs);
        }

        public Task<T> DequeueAsync(Cursor cursor = null, int timeoutMs = -1, CancellationToken cancellationToken = default(CancellationToken))
        {
            return DequeueAsync(null, cursor, timeoutMs, cancellationToken);
        }

        public Task<T> DequeueAsync(
            MessageQueueTransaction transaction,
            Cursor cursor = null, 
            int timeoutMs = -1, 
            CancellationToken cancellationToken = default(CancellationToken))
        {
            var timeout = GetTimeout(timeoutMs);
            return DequeueCommonAsync(transaction, cursor, timeout, cancellationToken, TimeoutHandling.OnTimeoutThrowTimeoutException);
        }

        public Task<T> DequeueAsync(
            MessageQueueTransactionType transactionType = MessageQueueTransactionType.Automatic, 
            Cursor cursor = null, 
            int timeoutMs = -1, 
            CancellationToken cancellationToken = default(CancellationToken))
        {
            var timeout = GetTimeout(timeoutMs);
            return DequeueCommonAsync(transactionType,
                cursor,
                timeout,
                cancellationToken,
                TimeoutHandling.OnTimeoutThrowTimeoutException);
        }

        private Task<T> DequeueCommonAsync(
            MessageQueueTransaction transaction,
            Cursor cursor,
            TimeSpan timeout,
            CancellationToken cancellationToken,
            TimeoutHandling timeoutHandling)
        {
            cancellationToken.ThrowIfCancellationRequested();
            Task<Message> getMessageTask;
            if (transaction != null)
            {
                getMessageTask = Task.Run(() =>
                    cursor == null
                        ? BaseMessageQueue.Receive(timeout, cursor, transaction)
                        : BaseMessageQueue.Receive(timeout, transaction));
            }
            else
            {
                getMessageTask = DequeueMessageNonTransactionalAsync(timeout, cursor);
            }
            return PostRead(getMessageTask, timeoutHandling);
        }

        private Task<T> DequeueCommonAsync(
            MessageQueueTransactionType transactionType,
            Cursor cursor,
            TimeSpan timeout,
            CancellationToken cancellationToken, 
            TimeoutHandling timeoutHandling)
        {
            cancellationToken.ThrowIfCancellationRequested();
            Task<Message> getMessageTask;
            if (transactionType != MessageQueueTransactionType.None)
            {
                getMessageTask = Task.Run(() =>
                    cursor == null
                        ? BaseMessageQueue.Receive(timeout, cursor, transactionType)
                        : BaseMessageQueue.Receive(timeout, transactionType));
            }
            else
            {
                getMessageTask = DequeueMessageNonTransactionalAsync(timeout, cursor);
            }
            return PostRead(getMessageTask, timeoutHandling);
        }

        private Task<Message> DequeueMessageNonTransactionalAsync(
            TimeSpan timeout, 
            Cursor cursor)
        {
            return Task.Factory.FromAsync(
                cursor == null
                    ? BaseMessageQueue.BeginReceive(timeout, null, null)
                    : BaseMessageQueue.BeginReceive(timeout, cursor, null, null),
                BaseMessageQueue.EndReceive);
        }

        public Task EnqueueAsync(
            T item, 
            CancellationToken cancellationToken = default(CancellationToken))
        {
            return EnqueueAsync(item, null, cancellationToken);
        }

        public Task EnqueueAsync(
            T item, 
            MessageQueueTransaction transaction, 
            CancellationToken cancellationToken = default(CancellationToken))
        {
            if (item is Message) throw new InvalidOperationException();
            cancellationToken.ThrowIfCancellationRequested();
            return Task.Run((Action)(() =>
            {
                string label;
                object o = GetMessageFromItem(item, out label);
                if (transaction == null)
                {
                    if (label != null)
                    {
                        BaseMessageQueue.Send(o, label); return;
                    }
                    BaseMessageQueue.Send(o);
                    return;
                }
                if (label != null)
                {
                    BaseMessageQueue.Send(o, label, transaction);
                    return;
                }
                BaseMessageQueue.Send(o, transaction);
            }));
        }

        public Task EnqueueAsync(
            T item, 
            MessageQueueTransactionType transactionType = MessageQueueTransactionType.Automatic, 
            CancellationToken cancellationToken = default(CancellationToken))
        {
            if (item is Message) throw new InvalidOperationException();
            cancellationToken.ThrowIfCancellationRequested();
            return Task.Run((Action)(() =>
            {

                string label;
                object o = GetMessageFromItem(item, out label);
                if (transactionType == MessageQueueTransactionType.None)
                {
                    if (label != null)
                    {
                        BaseMessageQueue.Send(o, label); return;
                    }
                    BaseMessageQueue.Send(o);
                    return;
                }
                if (label != null)
                {
                    BaseMessageQueue.Send(o, label, transactionType);
                    return;
                }
                BaseMessageQueue.Send(o, transactionType);
            }));
        }

        protected virtual T GetItemFromMessage(Message message)
        {
            return (T)message.Body;
        }

        protected virtual object GetMessageFromItem(T item, out string label)
        {
            label = null;
            return item;
        }

        public Task<T> PeekAsync(
            int timeoutMs = -1, 
            CancellationToken cancellationToken = default(CancellationToken))
        {
            var timeout = GetTimeout(timeoutMs);
            return PeekCommonAsync(null, PeekAction.Current, timeout, cancellationToken);
        }

        public Task<T> PeekAsync(
            Cursor cursor, 
            PeekAction peekAction, 
            int timeoutMs = -1, 
            CancellationToken cancellationToken = default(CancellationToken))
        {
            if (cursor == null) throw new ArgumentNullException();
            var timeout = GetTimeout(timeoutMs);
            return PeekCommonAsync(cursor, peekAction, timeout, cancellationToken);
        }

        private Task<T> PeekCommonAsync(
            Cursor cursor, 
            PeekAction peekAction, 
            TimeSpan timeout, 
            CancellationToken cancellationToken)
        {
            cancellationToken.ThrowIfCancellationRequested();
            Task<Message> antecedant = Task.Factory.FromAsync(cursor == null
                ? BaseMessageQueue.BeginPeek(timeout, null, null)
                : BaseMessageQueue.BeginPeek(timeout, cursor, peekAction, null, null), BaseMessageQueue.EndPeek);
            return PostRead(antecedant, TimeoutHandling.OnTimeoutThrowTimeoutException);
        }

        private Task<T> PostRead(
            Task<Message> getMessageTask1, 
            TimeoutHandling timeoutHandling)
        {
            return getMessageTask1.ContinueWith(getMessageTask2 =>
            {
                switch (getMessageTask2.Status)
                {
                    case TaskStatus.RanToCompletion:
                        return GetItemFromMessage(getMessageTask2.Result);
                    case TaskStatus.Faulted:
                        break;
                    case TaskStatus.Canceled:
                    default:
                        throw new NotSupportedException();
                }
                var ex1 = getMessageTask2.Exception;
                var ex2 = ex1.Flatten();
                int timeoutErrorCount = 0;
                int ex2Length = ex2.InnerExceptions.Count;
                for (var i = 0; i < ex2Length; i += 1)
                {
                    var ex3 = ex2.InnerExceptions[i];
                    var ex4 = ex3 as MessageQueueException;
                    if (ex4 != null)
                    {
                        switch (ex4.MessageQueueErrorCode)
                        {
                            case MessageQueueErrorCode.IOTimeout:
                                timeoutErrorCount += 1;
                                break;
                        }
                    }
                }
                if (0 < timeoutErrorCount)
                {
                    var exList = ex2.InnerExceptions.Where(ex5 =>
                    {
                        var ex6 = ex5 as MessageQueueException;
                        return ex6 == null || ex6.MessageQueueErrorCode != MessageQueueErrorCode.IOTimeout;
                    }).ToList();
                    if (exList.Count == 0)
                    {
                        switch (timeoutHandling)
                        {
                            case TimeoutHandling.OnTimeoutThrowTimeoutException: throw new TimeoutException();
                            case TimeoutHandling.OnTimeoutThrowInvalidOperationException: throw new InvalidOperationException();
                            default: throw new ArgumentOutOfRangeException();
                        }
                    }
                    switch (timeoutHandling)
                    {
                        case TimeoutHandling.OnTimeoutThrowTimeoutException: exList.Add(new TimeoutException()); break;
                        case TimeoutHandling.OnTimeoutThrowInvalidOperationException: exList.Add(new InvalidOperationException()); break;
                        default: throw new ArgumentOutOfRangeException();
                    }
                    throw new AggregateException(exList);
                }
                throw ex1;
            });
        }

        public Task<T> TryDequeueAsync(
            Cursor cursor = null, 
            CancellationToken cancellationToken = default(CancellationToken))
        {
            return DequeueCommonAsync(null, cursor, TimeSpan.Zero, cancellationToken, TimeoutHandling.OnTimeoutThrowInvalidOperationException);
        }

        public Task<T> TryDequeueAsync(
            MessageQueueTransaction transaction, 
            Cursor cursor = null, 
            CancellationToken cancellationToken = default(CancellationToken))
        {
            return DequeueCommonAsync(transaction, cursor, TimeSpan.Zero, cancellationToken, TimeoutHandling.OnTimeoutThrowInvalidOperationException);
        }

        public Task<T> TryDequeueAsync(
            MessageQueueTransactionType transactionType = MessageQueueTransactionType.Automatic, 
            Cursor cursor = null, 
            CancellationToken cancellationToken = default(CancellationToken))
        {
            return DequeueCommonAsync(transactionType, cursor, TimeSpan.Zero, cancellationToken, TimeoutHandling.OnTimeoutThrowInvalidOperationException);
        }

        public Task<T> TryPeekAsync(
            CancellationToken cancellationToken = default(CancellationToken))
        {
            return PeekCommonAsync(null, PeekAction.Next, TimeSpan.Zero, cancellationToken);
        }

        public Task<T> TryPeekAsync(
            Cursor cursor, 
            PeekAction peekAction, 
            CancellationToken cancellationToken = default(CancellationToken))
        {
            if (cursor == null) throw new ArgumentNullException();
            return PeekCommonAsync(cursor, peekAction, TimeSpan.Zero, cancellationToken);
        }
    }
}
