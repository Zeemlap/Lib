using Com.Jab.LibWinInterop.Com;
using Com.Jab.LibWinInterop.Win32;
using Com.Jab.LibWinInterop.Win32.PInvoke;
using System;
using System.Runtime.InteropServices;
using System.Transactions;

namespace Com.Jab.LibWinInterop.Transactions
{
    public static class TransactionExtensions
    {

        internal static SafeTransactionHandle GetKernelTransaction(this Transaction transaction)
        {
            bool didGetException = true;
            IntPtr hKernelTx_dangerous = Win32Constants.InvalidHandleValue;
            SafeTransactionHandle hKernelTx_safe = null;
            var comKernelTx = (IKernelTransaction)TransactionInterop.GetDtcTransaction(transaction);
            try
            {
                comKernelTx.GetHandle(out hKernelTx_dangerous);
                hKernelTx_safe = new SafeTransactionHandle(hKernelTx_dangerous, true);
                didGetException = false;
                return hKernelTx_safe;
            }
            catch (COMException comEx)
            {
                int hr_getHKernelTx = comEx.HResult;
                if (hr_getHKernelTx == ComConstants.HResult_EInvalidArg)
                {
                    throw new TransactionException(TransactionErrorResources.TransactionAbortedOrCommited);
                }
                throw ComUtil.GetException(hr_getHKernelTx);
            }
            finally
            {
                if (didGetException)
                {
                    if (hKernelTx_safe != null)
                    {
                        hKernelTx_safe.Close();
                    }
                    else if (hKernelTx_dangerous != Win32Constants.InvalidHandleValue)
                    {
                        int dwLastError = Marshal.GetLastWin32Error();
                        NativeMethods.CloseHandle(hKernelTx_dangerous);
                        NativeMethods.SetLastError(unchecked((uint)dwLastError));
                    }
                }
            }
        }

    }
}
