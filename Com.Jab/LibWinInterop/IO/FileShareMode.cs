using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Com.Jab.LibWinInterop.IO
{
    [Flags]
    public enum FileShareMode : uint
    {
        None = 0,
        DeleteOrRename = 4,
        Read = 1,
        Write = 2,
    }
}
