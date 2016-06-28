using Com.Jab.Ex.System;
using Com.Jab.Microsoft.Win32;
using Com.Jab.Microsoft.Win32.PInvoke;
using System;
using System.Runtime.InteropServices;

namespace Com.Jab.Microsoft.Win32.IO
{

    public static class FilePath
    {
        internal static unsafe string CheckFileName(string fileName)
        {
            fixed (char* chFirstPtr = fileName)
            {
                char* chPtr = chFirstPtr;
                int rem = fileName.Length;
                if (2 <= rem)
                {
                    if ((('A' <= *chPtr && *chPtr <= 'Z')
                        || ('a' <= *chPtr && *chPtr <= 'z'))
                        && chPtr[1] == ':')
                    {
                        rem -= 2;
                        chPtr += 2;
                        goto localPath;
                    }
                }
                throw new NotImplementedException();
            localPath:
                if (*chPtr != '\\')
                {
                    throw new NotImplementedException();
                }
                chPtr += 1;
                rem -= 1;
            localPath_absolute:
                if (256 < rem)
                {
                    ulong buf = *chFirstPtr;
                    buf |= *(char*)&buf == *chFirstPtr
                        ? 0x0000005C003A0000UL
                        : 0x0000003A005C0000UL;
                    var vi = new VolumeInfo((char*)&buf);
                    
                    throw new NotImplementedException();
                    // path too long!!
                    // use prefix to expand limitation!!!
                    return @"\\?\" + null;
                }
                // some other constraint could have been violated...
                throw new NotImplementedException();
            }
        }

        public unsafe static string GetFullPathName(string lpFileName)
        {
            int i;
            return GetFullPathName(lpFileName, out i);
        }
        public unsafe static string GetFullPathName(string lpFileName, out int indexOfFileName)
        {
            if (lpFileName == null) throw new ArgumentNullException();
            const int sLen = 104;
            string s = Util.StringAllocate(sLen);
            int l1;
            char* sLastCompStartPtr;
            fixed (char* sFirstCharPtr = s)
            {
                l1 = unchecked((int)NativeMethods.GetFullPathNameW(lpFileName, sLen, sFirstCharPtr, &sLastCompStartPtr));
                if (l1 <= 0) goto error;
                if (l1 <= sLen)
                {
                    ((int*)sFirstCharPtr)[-1] = l1;
                    sFirstCharPtr[l1] = '\0';
                    indexOfFileName = unchecked((int)((sLastCompStartPtr - sFirstCharPtr) >> 1));
                    return s;
                }
            }
            s = Util.StringAllocate(l1 - 1);
            fixed (char* sFirstCharPtr = s)
            {
                int l2 = unchecked((int)NativeMethods.GetFullPathNameW(lpFileName, unchecked((uint)l1), sFirstCharPtr, &sLastCompStartPtr));
                if (l2 <= 0) goto error;
                if (unchecked(l2 + 1) != l1) throw new NotImplementedException();
                indexOfFileName = unchecked((int)((sLastCompStartPtr - sFirstCharPtr) >> 1));
                return s;
            }
            error:
            if (l1 < 0) throw new OutOfMemoryException();
            l1 = Marshal.GetLastWin32Error();
            throw Win32Util.GetException(l1);
        }
    }
}
