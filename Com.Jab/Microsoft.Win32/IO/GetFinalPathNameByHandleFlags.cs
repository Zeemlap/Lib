using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Com.Jab.Microsoft.Win32.IO
{
    public enum GetFinalPathNameByHandleFlags : uint
    {
        FileNameNormalized = 0,
        FileNameOpened = 8,
        VolumeNameDos = 0,
        VolumeNameGuid = 1,
        VolumeNameNone = 4,
        VolumeNameNt = 2,
    }
}
