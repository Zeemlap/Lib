using StackExchange.Redis;
using System;
using System.Threading.Tasks;

namespace Com.Jab.Enterprise.Redit
{
    public class ReliableMessageChannel : ReliableMessageChannelBase
    {
        private RedisKey m_redisKey_string_nextMessageId;

        public ReliableMessageChannel(IDatabase database, ISubscriber subscriber, string name)
            : base(database, subscriber, name)
        {
            m_redisKey_string_nextMessageId = $"{name}.NextMessageId";

        }
        
        public async Task AddAsync(byte[] messageBody)
        {
            int message_sizeOf = s_messageOffset_body + messageBody.Length;
            byte[] bytes_message = new byte[message_sizeOf];
            long dtTicks_messageProcessingTimeout = (DateTime.UtcNow + TimeSpan.FromMilliseconds(s_messageProcessingTimeoutMs)).Ticks;
            byte[] bytes_messageProcessingTimeout = BitConverter.GetBytes(dtTicks_messageProcessingTimeout);
            Buffer.BlockCopy(bytes_messageProcessingTimeout, 0, bytes_message, s_messageOffset_processingTimeout, sizeof(long));
            Buffer.BlockCopy(messageBody, 0, bytes_message, s_messageOffset_body, messageBody.Length);
            long int64_messageId = await RedisDb.StringIncrementAsync(m_redisKey_string_nextMessageId, 1L);
            byte[] bytes_messageId = BitConverter.GetBytes(int64_messageId);
            Buffer.BlockCopy(bytes_messageId, 0, bytes_message, s_messageOffset_id, sizeof(long));
            RedisKey redisKey_message = GetRedisKey_Message(int64_messageId);
            RedisValue redisValue_message = bytes_message;
            RedisValue redisValue_messageId = int64_messageId;

            var transaction = RedisDb.CreateTransaction();
            await transaction.StringSetAsync(redisKey_message, redisValue_message);
            await transaction.ListLeftPushAsync(RedisKey_List_IdsOfQueuedMessages, redisValue_messageId);
            bool didFailOnNotifyingConsumers = false;
            try
            {
                await transaction.ExecuteAsync();
                didFailOnNotifyingConsumers = true;
                await RedisPubSub.PublishAsync(RedisChannel, (RedisValue)(string)null);
            }
            catch (Exception ex)
            {
                throw new ReliableMessageChannelAddException(didFailOnNotifyingConsumers, ex);
            }
        }
    }
}
