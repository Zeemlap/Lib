using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Com.Jab.Microsoft.Win32.IO
{
    [Flags]
    public enum FileAccessRights : uint
    {
        ListDirectory = 0x1,
        ReadData = 0x1,
        CreateFiles = 0x2,
        WriteData = 0x2,
        CreateSubdirectories = 0x4,
        AppendData = 0x4,
        CreatePipeInstance = 0x4,
        ReadExtendedAttributes = 0x8,
        WriteExtendedAttributes = 0x10,
        ExecuteFile = 0x20,
        Traverse = 0x20,
        DeleteSubdirectoriesAndFiles = 0x40,
        ReadAttributes = 0x80,
        WriteAttributes = 0x100,
    }
}
