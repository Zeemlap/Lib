using System;

namespace Com.Jab.LibWinInterop.IO
{
    [Flags]
    public enum FileFlagsAndAttributes : uint
    {
        Attribute_ReadOnly = 0x1,
        Attribute_Hidden = 0x2,
        Attribute_System = 0x4,
        Attribute_Directory = 0x10,
        Attribute_Archive = 0x20,
        // 0x40 is reserved for system use.
        // https://msdn.microsoft.com/en-us/library/windows/desktop/gg258117(v=vs.85).aspx
        Attribute_Normal = 0x80,
        Attribute_Temporary = 0x100,
        Attribute_SparseFile = 0x200,
        Attribute_HasReparsePointOrIsSymbolicLink = 0x400,
        Attribute_Compressed = 0x800, // Cannot be set using SetFileAttributes.
        Attribute_Offline = 0x1000,
        Attribute_NotContentIndexed = 0x2000,
        Attribute_Encrypted = 0x4000,
        // The directory or user data stream is configured with integrity (only supported on ReFS volumes).
        // https://msdn.microsoft.com/en-us/library/windows/desktop/gg258117(v=vs.85).aspx
        Attribute_IntegrityStream = 0x8000,
        // 0x10000 is reserved for system use.
        Attribute_NoScrubData = 0x20000,


        Flag_NoRecall =         0x00100000,
        Flag_OpenReparsePoints =0x00200000,

        Flag_SessionAware =     0x00800000,
        Flag_PosixSemantics =   0x01000000,
        Flag_BackupSemantics =  0x02000000,
        Flag_DeleteOnClose =    0x04000000,
        Flag_SequentialScan =   0x08000000,
        Flag_RandomAccess =     0x10000000,
        Flag_NoBuffering =      0x20000000,
        Flag_Overlapped =       0x40000000,
        Flag_WriteThrough =     0x80000000,
    }
}
