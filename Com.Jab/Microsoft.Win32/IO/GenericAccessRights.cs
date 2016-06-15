using System;

namespace Com.Jab.Microsoft.Win32.IO
{
    [Flags]
    public enum GenericAccessRights : uint
    {
        All = 0x10000000,
        Execute = 0x20000000,
        Write = 0x40000000,
        Read = 0x80000000,
    }
}
