using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Com.Jab.Microsoft.Win32.PInvoke
{
    public struct StorageAccessAlignmentDescriptor
    {
        public uint Version;
        public uint Size;
        public uint BytesPerCacheLine;
        public uint BytesOffsetForCacheAlignment;
        public uint BytesPerLogicalSector;
        public uint BytesPerPhysicalSector;
        public uint BytesOffsetForSectorAlignment;
    }
}
