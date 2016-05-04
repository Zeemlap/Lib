using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Com.Jab.LibWinInterop.Transactions
{
    internal static class TransactionErrorResources
    {
        public static string TransactionAborted { get; } = "TransactionAborted";
        public static string TransactionNotActive { get; } = "TransactionNotActive";
        public static string InvalidMicrosoftDtcTransaction { get; } = "InvalidMicrosoftDtcTransaction";
        public static string TransactionAbortedOrCommited { get; } = "TransactionAbortedOrCommited";
    }
}
