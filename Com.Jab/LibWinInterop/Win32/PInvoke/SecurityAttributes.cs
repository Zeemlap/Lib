using System;
using System.Runtime.InteropServices;

namespace Com.Jab.LibWinInterop.Win32.PInvoke
{

    [StructLayout(LayoutKind.Sequential)]
    public struct SecurityAttributes
    {
        private static readonly uint s_nLength = (uint)Marshal.SizeOf<SecurityAttributes>();

        private uint m_nLength;
        public IntPtr lpSecurityDescriptor;
        private int m_bInheritHandle;

        public SecurityAttributes(IntPtr lpSecurityDescriptor, bool bInheritHandle)
        {
            m_nLength = s_nLength;
            this.lpSecurityDescriptor = lpSecurityDescriptor;
            m_bInheritHandle = bInheritHandle ? 1 : 0;
        }

        public uint nLength
        {
            get
            {
                return m_nLength;
            }
        }
        public bool bInheritHandle
        {
            get
            {
                return m_bInheritHandle != 0;
            }
            set
            {
                m_bInheritHandle = value ? 1 : 0;
            }
        }
    }

}
