using StackExchange.Redis;
using System;
using System.Threading.Tasks;

namespace Com.Jab.Redis.ReliableMessaging
{
    public class RedisReliableMessageChannel
    {
        private const string s_consumerNameSetSuffix = "consumers";
        private const string s_nextMessageIdSuffix = "nextMessageId";

        ConnectionMultiplexer m_conn;

        public RedisReliableMessageChannel(ConnectionMultiplexer conn, string baseName)
        {
            m_conn = conn;
            BaseName = baseName;
            RedisKey_ConsumerNameSet = $"{BaseName}.{s_consumerNameSetSuffix}";
            RedisKey_NextMessageId = $"{BaseName}.{s_nextMessageIdSuffix}";
        }

        public string BaseName { get; }
        
        private RedisKey RedisKey_ConsumerNameSet { get; set; }
        private RedisKey RedisKey_NextMessageId { get; set; }

        public async Task PublishAsync(byte[] message)
        {
            var nextMessageId = await m_conn.GetDatabase().StringIncrementAsync(RedisKey_NextMessageId, value: 1, flags: CommandFlags.None);
            var consumerBaseNames = await m_conn.GetDatabase().SetMembersAsync(RedisKey_ConsumerNameSet, CommandFlags.None);
            bool success = await m_conn.GetDatabase().StringSetAsync($"{BaseName}.messages.{nextMessageId}", message, expiry: TimeSpan.FromMinutes(15));
            if (!success) throw new NotImplementedException();
            var consumerPushTasks = new Task[consumerBaseNames.Length];
            for (int i = 0; i < consumerBaseNames.Length; i++)
            {
                consumerPushTasks[i++] = 
                    m_conn.GetDatabase().ListRightPushAsync($"{BaseName}.{consumerBaseNames[i]}.messages", nextMessageId)
                    .ContinueWith(_ =>
                    {

                    }, TaskContinuationOptions.OnlyOnRanToCompletion);
            }
            await Task.WhenAll(consumerPushTasks);
        }
        
        // True if consumer set changed.
        public async Task<bool> RegisterConsumerAsync(string baseName)
        {
            bool added = await m_conn.GetDatabase().SetAddAsync(RedisKey_ConsumerNameSet, baseName, CommandFlags.None);
            await m_conn.GetSubscriber().SubscribeAsync(new RedisChannel("bla", RedisChannel.PatternMode.Literal), (channel, value) =>
            {

            });
            return added;
        }

        // True if consumer set changed.
        public async Task<bool> UnregisterConsumerAsync(string baseName)
        {
            return await m_conn.GetDatabase().SetRemoveAsync(RedisKey_ConsumerNameSet, baseName, CommandFlags.None);
        }

        public async Task<byte[]> GetMessage()
        {
            await m_conn.GetDatabase().ListLeftPopAsync((RedisKey)"");
            return null;
        }
    }
}
