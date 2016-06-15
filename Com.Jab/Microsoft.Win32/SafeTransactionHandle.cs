using System;
using Microsoft.Win32.SafeHandles;
using Com.Jab.Microsoft.Win32.PInvoke;

namespace Com.Jab.Microsoft.Win32
{
    public class SafeTransactionHandle : SafeHandleMinusOneIsInvalid
    {
        
        public SafeTransactionHandle(IntPtr handle, bool ownsHandle = true)
            : base(ownsHandle)
        {
            this.handle = handle;
        }
        
        protected override bool ReleaseHandle()
        {
            return NativeMethods.CloseHandle(handle) != 0;
        }
    }
}
