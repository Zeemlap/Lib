using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Com.Jab.Microsoft.Win32.IO
{
    public unsafe delegate void SectorAccessor(void* bufferPtr, out bool needsFlush);
    public unsafe delegate T SectorAccessor<T>(void* bufferPtr, out bool needsFlush);
}
