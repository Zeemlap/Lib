using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Com.Jab.Enterprise.Redit
{
    public abstract class ReliableMessageChannelBase
    {
        internal const int s_messageOffset_processingTimeout = 8;
        internal const int s_messageOffset_id = 0;
        internal const int s_messageOffset_body = 16;
        internal const int s_messageProcessingTimeoutMs = 10 * 60 * 1000;


        protected ReliableMessageChannelBase(
            IDatabase database, 
            ISubscriber subscriber,
            string name)
        {
            RedisDb = database;
            RedisPubSub = subscriber;
            Name = name;
            RedisChannel = new RedisChannel($"{name}.Channel", RedisChannel.PatternMode.Literal);
            RedisKey_List_IdsOfQueuedMessages = $"{name}.List_IdsOfQueuedMessages";
            
        }

        protected RedisChannel RedisChannel { get; }
        public IDatabase RedisDb { get; }
        protected RedisKey RedisKey_List_IdsOfQueuedMessages { get; }
        public ISubscriber RedisPubSub { get; }
        public string Name { get; }
        
        protected RedisKey GetRedisKey_Message(long int64_messageId)
        {
            return $"{Name}.Messages.{int64_messageId}";
        }
    }
}
