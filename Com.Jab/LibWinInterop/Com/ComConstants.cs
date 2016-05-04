using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Com.Jab.LibWinInterop.Com
{
    internal static class ComConstants
    {
        public const int HResult_SOk = 0;
        public const int HResult_XActENoTransaction = unchecked((int)0x8004d00e);
        public const int HResult_EInvalidArg = unchecked((int)0x80070057);

        public static bool Failed(int hr)
        {
            return hr < 0;
        }
    }
}
