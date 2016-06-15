using System;
using System.Runtime.InteropServices;

namespace Com.Jab.Microsoft.Win32.PInvoke
{

    [StructLayout(LayoutKind.Sequential)]
    public struct Overlapped
    {
        public UIntPtr InternalLow;
        public UIntPtr InternalHigh;
        private uint m_offsetLow;
        private uint m_offsetHigh;
        public UIntPtr hEvent;

        static Overlapped()
        {
            if (Marshal.SizeOf<Overlapped>() != IntPtr.Size * 3 + 4 * 2)
            {
                throw new NotImplementedException();
            }
        }

        public ulong Offset
        {
            get
            {
                return m_offsetLow | ((ulong)m_offsetHigh << 32);
            }
            set
            {
                m_offsetLow = (uint)value;
                m_offsetHigh = (uint)(value >> 32);
            }
        }
    }
}
