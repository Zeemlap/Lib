using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Com.Jab.SystemEx
{
    public struct IntervalInt32 : IEquatable<IntervalInt32>
    {
        public IntervalInt32(int min, int max)
        {
            Min = min;
            Max = max;
        }

        public int Min { get; set; }
        public int Max { get; set; }

        public bool IsEmpty
        {
            get
            {
                return Max < Min;
            }
        }

        public bool Contains(int value)
        {
            return Min <= value && value <= Max;
        }

        public override bool Equals(object obj)
        {
            if (!(obj is IntervalInt32)) throw new ArgumentException();
            return Equals((IntervalInt32)obj);
        }

        public bool Equals(IntervalInt32 other)
        {
            if (IsEmpty) return other.IsEmpty;
            return Min == other.Min && Max == other.Max;
        }

        public override int GetHashCode()
        {
            return IsEmpty ? 0 : Min * 65537 + Max;
        }
    }
}
