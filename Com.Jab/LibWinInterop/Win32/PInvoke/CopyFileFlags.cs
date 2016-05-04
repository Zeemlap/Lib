using System;

namespace Com.Jab.LibWinInterop.Win32.PInvoke
{
    [Flags]
    public enum CopyFileFlags : uint
    {
        AllowDecryptedDestination = 0x008,
        CopySymbolicLinks = 0x800,
        FailIfExists = 0x1,
        NoBuffering = 0x1000,
        OpenSourceForWrite = 0x4,
        Restartable = 0x2,
    }
}
