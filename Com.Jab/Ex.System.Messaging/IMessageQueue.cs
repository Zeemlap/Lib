using System;
using System.Collections.Generic;
using System.Linq;
using System.Messaging;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Com.Jab.Ex.System.Messaging
{
    public interface IMessageQueue<T>
    {

        bool CanDequeue { get; }
        bool CanEnqueue { get; }

        Task<T> DequeueAsync(
            Cursor cursor = null,
            int timeoutMs = -1,
            CancellationToken cancellationToken = default(CancellationToken));
        Task EnqueueAsync(
            T item,
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
