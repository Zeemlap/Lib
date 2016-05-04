using Com.Jab.LibWinInterop.Transactions;
using Com.Jab.LibWinInterop.Win32;
using System;
using System.Runtime.InteropServices;
using System.Transactions;

namespace Com.Jab.LibWinInterop.Com
{
    internal class ComUtil
    {
        public static Exception GetException(int hr)
        {
            if (unchecked((uint)hr) >> 16 == 0x8007)
            {
                return Win32Util.GetException(hr & 0xFFFF);
            }
            switch (hr)
            {
                case ComConstants.HResult_XActENoTransaction:
                    return new TransactionException(TransactionErrorResources.InvalidMicrosoftDtcTransaction);
            }
            return Marshal.GetExceptionForHR(hr);
        }
    }
}
