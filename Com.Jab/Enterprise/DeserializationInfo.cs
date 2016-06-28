using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Com.Jab.Enterprise
{
    public class DeserializationInfo<T>
    {
        public DeserializationInfo(T value, bool valueOwnsStream)
        {
            Value = value;
            ValueOwnsStream = valueOwnsStream;
        }

        public T Value { get; }
        public bool ValueOwnsStream { get; }
    }
}
