using System;
using System.Collections.Generic;
using System.Linq;
using System.Messaging;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Com.Jab.Ex.System.Messaging
{
    public interface ITransactionalMessageQueue<T>
    {
        bool CanDequeue { get; }
        bool CanEnqueue { get; }

        Task<T> DequeueAsync(
            MessageQueueTransactionType transactionType = MessageQueueTransactionType.Automatic,
            Cursor cursor = null,
            int timeoutMs = -1,
            CancellationToken cancellationToken = default(CancellationToken));
        Task<T> DequeueAsync(
            MessageQueueTransaction transaction,
            Cursor cursor = null,
            int timeoutMs = -1,
            CancellationToken cancellationToken = default(CancellationToken));
        Task EnqueueAsync(
            T item,
            MessageQueueTransactionType transactionType = MessageQueueTransactionType.Automatic,
            CancellationToken cancellationToken = default(CancellationToken));
        Task EnqueueAsync(
            T item,
            MessageQueueTransaction transaction,
            CancellationToken cancellationToken = default(CancellationToken));

        Task<T> PeekAsync(
            int timeoutMs = -1,
            CancellationToken cancellationToken = default(CancellationToken));
        Task<T> PeekAsync(
            Cursor cursor,
            PeekAction peekAction,
            int timeoutMs = -1,
            CancellationToken cancellationToken = default(CancellationToken));

        Task<T> TryDequeueAsync(
            MessageQueueTransactionType transactionType = MessageQueueTransactionType.Automatic,
            Cursor cursor = null,
            CancellationToken cancellationToken = default(CancellationToken));
        Task<T> TryDequeueAsync(
            MessageQueueTransaction transaction,
            Cursor cursor = null,
            CancellationToken cancellationToken = default(CancellationToken));

        Task<T> TryPeekAsync(
            CancellationToken cancellationToken = default(CancellationToken));
        Task<T> TryPeekAsync(
            Cursor cursor,
            PeekAction peekAction,
            CancellationToken cancellationToken = default(CancellationToken));
    }
}
