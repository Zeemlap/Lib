using System;
using System.Runtime.InteropServices;

namespace Com.Jab.Ex.System
{
    [StructLayout(LayoutKind.Sequential)]
    public class UInt128 : IEquatable<UInt128>
    {
        internal ulong ULong1;
        internal ulong ULong2;
        
        public override bool Equals(object obj)
        {
            return Equals(obj as UInt128);
        }
        public bool Equals(UInt128 value)
        {
            if (value == null) return false;
            return ULong1 == value.ULong1 && ULong2 == value.ULong2;
        }
        public override int GetHashCode()
        {
            return base.GetHashCode();
        }
        public static bool operator ==(UInt128 left, UInt128 right)
        {
            return ReferenceEquals(left, right) || (!ReferenceEquals(left, null) && left.Equals(right));
        }
        public static bool operator !=(UInt128 left, UInt128 right)
        {
            return !(left == right);
        }

    }
}
