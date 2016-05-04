using System;

namespace Com.Jab.LibWinInterop.Win32.PInvoke
{ 
    [Flags]
    public enum LockFileFlags
    {
        ExclusiveLock = 2,
        FailImmediately = 1,
    }
}
