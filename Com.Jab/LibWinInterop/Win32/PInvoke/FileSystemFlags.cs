﻿using System;

namespace Com.Jab.LibWinInterop.Win32.PInvoke
{
    [Flags]
    public enum FileSystemFlags : uint
    {
        CaseSensitiveSearch =           0x00000001,
        CasePreservedNames =            0x00000002,
        UnicodeOnDisk =                 0x00000004,
        PersistentAcls =                0x00000008,
        FileCompression =               0x00000010,
        VolumeQuotas =                  0x00000020,
        SupportsSparseFiles =           0x00000040,
        SupportsReparsePoints =         0x00000080,
        
        VolumeIsCompressed =            0x00008000,
        SupportsObjectIds =             0x00010000,
        SupportsEncryption =            0x00020000,
        NamedStreams =                  0x00040000,
        ReadOnlyVolume =                0x00080000,
        SequentialWriteOnce =           0x00100000,
        SupportsTransactions =          0x00200000,
        SupportsHardLinks =             0x00400000,
        SupportsExtendedAttributes =    0x00800000,
        SupportsOpenByFileId =          0x01000000,
        SupportsUsnJournal =            0x02000000,

    }
}
