using System;
using System.Runtime.InteropServices;

namespace Com.Jab.LibWinInterop.Com
{
    [ComImport]
    [InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    [Guid("79427A2B-F895-40e0-BE79-B57DC82ED231")]
    public interface IKernelTransaction
    {
        void GetHandle([Out] out IntPtr handle);
    }

}
