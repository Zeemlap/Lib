using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Com.Jab.Microsoft.Win32.PInvoke
{
    public struct DiskExtent
    {
        public uint DiskNumber;
        public long StartingOffset;
        public long ExtentLength;
    }
    public struct VolumeDiskExtents
    {
        public uint NumberOfDiskExtents;
        public DiskExtent FirstExtent;
    }
}
