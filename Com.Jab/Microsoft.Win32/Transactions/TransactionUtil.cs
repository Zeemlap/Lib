using Com.Jab.SystemEx;
using Com.Jab.Microsoft.Win32;
using Com.Jab.Microsoft.Win32.PInvoke;
using System;
using System.Runtime.InteropServices;

namespace PersistentDictionary.Transactions
{
    internal static class TransactionUtil
    {
        public unsafe static void GetId(SafeTransactionHandle hKernelTransaction, UInt128 id)
        {
            fixed (ulong* idPtr = &id.ULong1)
            {
                if (0 != NativeMethods.GetTransactionId(hKernelTransaction, idPtr))
                {
                    return;
                }
            }
            int dwErrCode = Marshal.GetLastWin32Error();
            switch (unchecked((uint)dwErrCode))
            {
                case Win32Constants.ErrorInvalidHandle:
                    throw new ArgumentException();
            }
            throw Win32Util.GetException(dwErrCode);
        }
    }
}
