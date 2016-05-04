using System;

namespace Com.Jab.LibWinInterop.Win32.PInvoke
{
    [Flags]
    public enum FormatMessageFlags : uint
    {
        AllocateBuffer = 0x100,
        ArgumentArray = 0x2000,
        FromHModule = 0x800,
        FromString = 0x400,
        FromSystem = 0x1000,
        IgnoreInserts = 0x200,
        MaxWidthMask = 0xFF,
    }
}
