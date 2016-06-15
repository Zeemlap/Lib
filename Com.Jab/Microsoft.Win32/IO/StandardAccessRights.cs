using System;

namespace Com.Jab.Microsoft.Win32.IO
{
    [Flags]
    public enum StandardAccessRights : uint
    {
        Delete = 0x10000,
        Execute = 0x20000,
        Read = 0x20000,
        ReadControl = 0x20000,
        Write = 0x20000,
        WriteDac = 0x40000,
        WriteOwner = 0x80000,
        Synchronize = 0x100000,
        All = 0x1F0000,
    }
}
