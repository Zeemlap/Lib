using System;

namespace Com.Jab.Microsoft.Win32.PInvoke
{ 
    [Flags]
    public enum LockFileFlags
    {
        ExclusiveLock = 2,
        FailImmediately = 1,
    }
}
