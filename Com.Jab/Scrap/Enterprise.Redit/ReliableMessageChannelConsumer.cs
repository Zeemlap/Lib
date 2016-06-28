using StackExchange.Redis;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Com.Jab.Enterprise.Redit
{
    public class ReliableMessageChannelConsumer : ReliableMessageChannelBase
    {
        private const int s_cleanupIntervalMs = 60 * 1000;
        private const int s_ps_mainLoopIsNearPopping_mask = 1;
        private const int s_ps_mainLoopIsNearWaiting_mask = 2;
        private const int s_ps_eventLoopIsNearPulsing_mask = 4;

        private class RunState
        {

            private volatile int m_packedState;
            private readonly ReliableMessageChannelConsumer m_owner;
            private readonly Action<RedisChannel, RedisValue> m_handler;
            public DateTime LastCleanupTime;

            public RunState(ReliableMessageChannelConsumer owner)
            {
                m_owner = owner;
                m_handler = (matchedChannel, value) =>
                {
                    if (EventLoop_TryTransition_ToNearPulse())
                    {
                        lock (this)
                        {
                            Monitor.Pulse(this);
                            Clear(s_ps_eventLoopIsNearPulsing_mask);
                        }
                    }
                };
            }

            public async Task BeginAsync()
            {
                await m_owner.RedisPubSub.SubscribeAsync(m_owner.RedisChannel, m_handler);
                LastCleanupTime = DateTime.UtcNow;
            }

            public async Task EndAsync()
            {
                await m_owner.RedisPubSub.UnsubscribeAsync(m_owner.RedisChannel, m_handler);
            }

            public bool EventLoop_IsNearPulse
            {
                get
                {
                    return (m_packedState & s_ps_eventLoopIsNearPulsing_mask) != 0;
                }
            }

            public void Clear(int mask)
            {
                SpinWait spinWait = new SpinWait();
                while (true)
                {
                    int packedState = m_packedState;
                    if (Interlocked.CompareExchange(ref m_packedState, packedState & ~mask, packedState) == packedState)
                    {
                        break;
                    }
                    spinWait.SpinOnce();
                }
            }

            public void MainLoop_Transition_ToNearPopping()
            {
                int packedState;
                SpinWait spinWait = new SpinWait();
                while (true)
                {
                    packedState = m_packedState;
                    if (Interlocked.CompareExchange(ref m_packedState, (packedState & ~s_ps_mainLoopIsNearWaiting_mask) | s_ps_mainLoopIsNearPopping_mask, packedState) == packedState)
                    {
                        break;
                    }
                    spinWait.SpinOnce();
                }
            }

            public bool MainLoop_TryTransition_NearPoppingToNearWaiting()
            {
                int packedState;
                SpinWait spinWait = new SpinWait();
                while (true)
                {
                    packedState = m_packedState;
                    if ((packedState & s_ps_eventLoopIsNearPulsing_mask) != 0) return false;
                    if (Interlocked.CompareExchange(ref m_packedState, (packedState & ~s_ps_mainLoopIsNearPopping_mask) | s_ps_mainLoopIsNearWaiting_mask, packedState) == packedState)
                    {
                        break;
                    }
                    spinWait.SpinOnce();
                }
                return true;
            }

            public bool EventLoop_TryTransition_ToNearPulse()
            {
                int packedState;
                SpinWait spinWait = new SpinWait();
                while (true)
                {
                    packedState = m_packedState;
                    if ((packedState & s_ps_mainLoopIsNearPopping_mask) != 0) return false;
                    if (Interlocked.CompareExchange(ref m_packedState,
                        packedState | s_ps_eventLoopIsNearPulsing_mask,
                        packedState) == packedState)
                    {
                        return true;
                    }
                    spinWait.SpinOnce();
                }
            }

        }

        private Func<RedisValue, CancellationToken, Task> m_messageProcessorFunc;
        private RedisKey m_redisKey_List_IdsOfMessagesBeingProcessed;

        public ReliableMessageChannelConsumer(IDatabase database, ISubscriber subscriber, string name,
            Func<RedisValue, CancellationToken, Task> messageProcessorFunc)
            : base(database, subscriber, name)
        {
            m_messageProcessorFunc = messageProcessorFunc;
            m_redisKey_List_IdsOfMessagesBeingProcessed = $"{name}.List_IdsOfMessagesBeingProcessed";
        }

        private async Task DoCleanupAsync()
        {
            const int maxBatchSize = 2;
            RedisValue[] messageIds = await RedisDb.ListRangeAsync(m_redisKey_List_IdsOfMessagesBeingProcessed,
                start: 0,
                stop: maxBatchSize - 1);
            int actBatchSize = messageIds.Length;
            var dtUtcNow = DateTime.UtcNow;
            int noCleanedUpMessages = 0;
            for (int i = 0; i < actBatchSize; i++)
            {
                RedisValue redisValue_messageId = messageIds[i];
                long int64_messageId;
                if (redisValue_messageId.IsNull || !redisValue_messageId.TryParse(out int64_messageId))
                {
                    throw new NotImplementedException();
                }
                RedisKey redisKey_message = GetRedisKey_Message(int64_messageId);
                RedisValue redisValue_message = await RedisDb.StringGetAsync(redisKey_message);
                byte[] bytes_message_old = redisValue_message;
                long dtTicks_message_processingTimeout_old = BitConverter.ToInt64(bytes_message_old, s_messageOffset_processingTimeout);
                DateTime dt_message_processingTimeout_old = new DateTime(dtTicks_message_processingTimeout_old, DateTimeKind.Utc);
                if (dtUtcNow <= dt_message_processingTimeout_old)
                {
                    // A message that was processing timed out, recover here.
                    var transaction = RedisDb.CreateTransaction();
                    transaction.AddCondition(Condition.ListIndexEqual(m_redisKey_List_IdsOfMessagesBeingProcessed, i - noCleanedUpMessages, redisValue_messageId));
                    await UpdateMessageProcessingTimeoutAsync(
                        transaction,
                        redisValue_messageId,
                        redisKey_message,
                        bytes_message_old);
                    await transaction.ExecuteAsync();
                    noCleanedUpMessages += 1;
                }
            }
        }

        private async Task UpdateMessageProcessingTimeoutAsync(
            IDatabaseAsync database,
            RedisValue redisValue_messageId,
            RedisKey redisKey_message,
            byte[] bytes_message_old)
        {
            await database.ListLeftPushAsync(RedisKey_List_IdsOfQueuedMessages, redisValue_messageId);
            await database.ListRemoveAsync(m_redisKey_List_IdsOfMessagesBeingProcessed, redisValue_messageId, 1);
            byte[] bytes_message_new = (byte[])bytes_message_old.Clone();
            long dtTicks_message_processingTimeout_new = (DateTime.UtcNow + TimeSpan.FromMilliseconds(s_messageProcessingTimeoutMs)).Ticks;
            byte[] bytes_message_processingTimeout_new = BitConverter.GetBytes(dtTicks_message_processingTimeout_new);
            Buffer.BlockCopy(bytes_message_processingTimeout_new, 0, bytes_message_new, s_messageOffset_processingTimeout, sizeof(long));
            RedisValue redisValue_message_new = bytes_message_new;
            await database.StringSetAsync(redisKey_message, redisValue_message_new);
        }

        public async Task RunAsync(CancellationToken cancellationToken = default(CancellationToken))
        {
            RunState runState = new RunState(this);
            try
            {
                await runState.BeginAsync();
                DateTime dt_now;
                while (true)
                {
                    runState.MainLoop_Transition_ToNearPopping();
                    l1:
                    if (cancellationToken.IsCancellationRequested)
                    {
                        break;
                    }
                    dt_now = DateTime.UtcNow;
                    if (TimeSpan.FromMilliseconds(s_cleanupIntervalMs) <= dt_now - runState.LastCleanupTime)
                    {
                        runState.LastCleanupTime = dt_now;
                        await DoCleanupAsync();
                        if (cancellationToken.IsCancellationRequested)
                        {
                            break;
                        }
                    }
                    RedisValue redisValue_messageId = await RedisDb.ListRightPopLeftPushAsync(
                        RedisKey_List_IdsOfQueuedMessages,
                        m_redisKey_List_IdsOfMessagesBeingProcessed);
                    if (redisValue_messageId.IsNull)
                    {
                        if (!runState.MainLoop_TryTransition_NearPoppingToNearWaiting()) goto l1;
                        goto l2;
                    }
                    runState.Clear(s_ps_mainLoopIsNearPopping_mask);

                    RedisKey redisKey_message = (string)null;
                    byte[] bytes_message = null;
                    bool exDuringProcessing = true;
                    try
                    {
                        long int64_messageId;
                        if (!redisValue_messageId.TryParse(out int64_messageId))
                        {
                            throw new NotImplementedException();
                        }
                        redisKey_message = GetRedisKey_Message(int64_messageId);
                        var redisValue_message = await RedisDb.StringGetAsync(redisKey_message);
                        bytes_message = redisValue_message;
                        var dt_processingTimeout = new DateTime(BitConverter.ToInt64(bytes_message, s_messageOffset_processingTimeout), DateTimeKind.Utc);
                        dt_now = DateTime.UtcNow;
                        int processingTimeoutMs = GetProcessingTimeoutMs(dt_processingTimeout, dt_now);
                        CancellationToken ct_linked = cancellationToken;
                        if (0 < processingTimeoutMs)
                        {
                            var cts_processingTimeout = new CancellationTokenSource(processingTimeoutMs);
                            ct_linked = CancellationTokenSource.CreateLinkedTokenSource(ct_linked, cts_processingTimeout.Token).Token;
                        }
                        await m_messageProcessorFunc(redisValue_message, ct_linked);
                        exDuringProcessing = false;
                    }
                    finally
                    {
                        if (redisKey_message != default(RedisKey)
                            && bytes_message != null
                            && s_messageOffset_processingTimeout + sizeof(long) <= bytes_message.Length)
                        {
                            var transaction = RedisDb.CreateTransaction();
                            if (exDuringProcessing)
                            {
                                await UpdateMessageProcessingTimeoutAsync(transaction,
                                    redisValue_messageId,
                                    redisKey_message,
                                    bytes_message);
                            }
                            else
                            {
                                await transaction.KeyDeleteAsync(redisKey_message);
                            }
                            await transaction.ListRemoveAsync(m_redisKey_List_IdsOfMessagesBeingProcessed, redisValue_messageId);
                            if (!await transaction.ExecuteAsync())
                            {
                                throw new NotImplementedException();
                            }
                        }
                        else
                        {
                            await RedisDb.ListRemoveAsync(m_redisKey_List_IdsOfMessagesBeingProcessed, redisValue_messageId);
                        }
                    }
                    goto l1;
                    l2: lock (runState)
                    {
                        if (runState.EventLoop_IsNearPulse)
                        {
                            Monitor.Wait(runState);
                        }
                    }
                }
            }
            finally
            {
                await runState.EndAsync();
            }
        }

        private static int GetProcessingTimeoutMs(DateTime dt_processingTimeout, DateTime dt_now)
        {
            long timeoutTicks = (dt_processingTimeout - dt_now).Ticks;
            if (timeoutTicks <= 0) return -1;
            long timeoutMs_min = timeoutTicks / TimeSpan.TicksPerMillisecond;
            long timeoutMs = timeoutMs_min;
            if (TimeSpan.TicksPerMillisecond / 2 <= timeoutTicks % TimeSpan.TicksPerMillisecond)
            {
                timeoutMs += 1;
            }
            if (int.MaxValue < timeoutTicks)
            {
                return -1;
            }
            return unchecked((int)timeoutTicks);
        }
    }
}
