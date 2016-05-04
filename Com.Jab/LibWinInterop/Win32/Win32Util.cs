using Microsoft.Win32.SafeHandles;
using System;
using System.Runtime.InteropServices;
using System.ComponentModel;
using Com.Jab.LibCore;
using Com.Jab.LibWinInterop.IO;
using System.Transactions;
using Com.Jab.LibWinInterop.Win32.PInvoke;
using Com.Jab.LibWinInterop.Transactions;

namespace Com.Jab.LibWinInterop.Win32
{
    public static class Win32Util
    {
        public static bool IsCreationDispositionValid(FileCreationDisposition dwCreationDisposition)
        {
            return FileCreationDisposition.CreateNew <= dwCreationDisposition && dwCreationDisposition <= FileCreationDisposition.TruncateExisting;
        }
        
        public static Exception GetException(int dwLastError)
        {
            switch (unchecked((uint)dwLastError))
            {
                case Win32Constants.ErrorNotEnoughMemory: return new OutOfMemoryException();
                case Win32Constants.ErrorTransactionNotActive: return new TransactionException(TransactionErrorResources.TransactionNotActive);
                case Win32Constants.ErrorTransactionAlreadyAborted: throw new TransactionException(TransactionErrorResources.TransactionAborted);
            }
            return new Win32Exception(dwLastError);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="handle"></param>
        /// <param name="dwFlags"></param>
        /// <param name="s"></param>
        /// <exception cref="ArgumentException">If dwFlags is invalid.</exception>
        /// <exception cref="OutOfMemoryException">When allocating a buffer fails.</exception>
        /// <returns>
        /// Known return values: NoError, ErrorPathNotFound (https://msdn.microsoft.com/en-us/library/windows/desktop/aa364962(v=vs.85).aspx)
        /// </returns>
        public unsafe static int GetFinalPathName(SafeFileHandle handle, GetFinalPathNameByHandleFlags dwFlags, ref string s)
        {
            const int byteSizeOf_bufferAlloc1 = 256;
            long sLen2;
            long byteSizeOf_bufferAlloc2;
            int sLen1;
            if (s != null)
            {
                sLen1 = s.Length;
                goto winning2;
            }
            sLen1 = byteSizeOf_bufferAlloc1 / 2;
            winning1:
            s = Util.StringAllocate(sLen1);
            winning2:
            int n;
            fixed (char* sFirstChPtr = s)
            {
                n = unchecked((int)NativeMethods.GetFinalPathNameByHandleW(
                    handle,
                    sFirstChPtr,
                    unchecked((uint)sLen1) + 1,
                    dwFlags));
            }
            if (n < 0) throw new OutOfMemoryException();
            if (0 < n && n <= sLen1)
            {
                s = Util.StringSetLengthToIndexOfNullChar(s);
                return 0;
            }
            if (0 < n)
            {
                byteSizeOf_bufferAlloc2 = ((long)n - 1) * 2;
                goto losing1;
            }
            n = Marshal.GetLastWin32Error();
            switch (unchecked((uint)n))
            {
                case Win32Constants.ErrorNotEnoughMemory: throw new OutOfMemoryException();
                case Win32Constants.ErrorInvalidParameter: throw new ArgumentOutOfRangeException();
            }
            return n;
            losing1:
            int byteSizeOf_bufferAlloc2_log2Ceil = byteSizeOf_bufferAlloc1.Log2Ceil();
            sLen2 = 1 << (byteSizeOf_bufferAlloc2_log2Ceil - 1);
            if (int.MaxValue < sLen2) throw new OutOfMemoryException();
            sLen1 = unchecked((int)sLen2);
            goto winning1;
        }
        
        public unsafe static char GetVolumeLetter(string s)
        {
            fixed (char* sFirstChPtr = s)
            {
                int sLen = ((int*)sFirstChPtr)[-1];
                if (2 <= sLen)
                {
                    if (sFirstChPtr[1] != ':') goto losing1;
                    char r = sFirstChPtr[0];
                winning1:
                    if (('a' <= r && r <= 'z')
                        || ('A' <= r && r <= 'Z'))
                    {
                        return r;
                    }
                    return '\0';
                losing1:
                    if (*sFirstChPtr == '\\' && sFirstChPtr[1] == '\\' && 6 <= sLen)
                    {
                        bool isLittleEndian = *(byte*)sFirstChPtr == 0x5C;
                        if (isLittleEndian
                            ? (*(ulong*)(sFirstChPtr + 2) & 0xFFFF0000FFFFFFFFUL) == 0x003A0000005C003FUL
                            : (*(ulong*)(sFirstChPtr + 2) & 0xFFFFFFFF0000FFFFUL) == 0x003F005C0000003AUL)
                        {
                            r = sFirstChPtr[4];
                            goto winning1;
                        }
                    }
                }
            }
            return '\0';
        }

        public unsafe static int GetPhysicalSectorSize(SafeFileHandle handle)
        {
            string s1 = null;
            int lErrCode = GetFinalPathName(handle, 0, ref s1);
            if (lErrCode != Win32Constants.NoError)
            {
                throw Win32Util.GetException(lErrCode);
            }
            char volumeLetter = GetVolumeLetter(s1);
            if (volumeLetter == '\0')
            {
                throw new NotImplementedException();
            }
            ulong* volumeDeviceName = stackalloc ulong[2];
            *(char*)volumeDeviceName = volumeLetter;
            bool isLittleEndian = volumeDeviceName[0] == (ulong)volumeLetter;
            if (isLittleEndian)
            {
                volumeDeviceName[0] = 0x005C002E005C005C;
                volumeDeviceName[1] = (ulong)(volumeLetter | 0x3A0000);
            }
            else
            {
                volumeDeviceName[0] = 0x005C005C002E005C;
                volumeDeviceName[1] = ((ulong)volumeLetter << 48) | 0x003A00000000;
            }
            byte[] bytes_volumeDiskExtents;
            using (var hVolume = FileHandle.New(
                (char*)volumeDeviceName,
                dwDesiredAccess: 0,
                dwShareMode: FileShareMode.Read | FileShareMode.Write,
                dwCreationDisposition: FileCreationDisposition.OpenExisting,
                dwFlagsAndAttributes: 0))
            {
                int diskExtentCapacity = 1;
                while (true)
                {
                    int bytes_volumeDiskExtents_capacity = checked(sizeof(VolumeDiskExtents) + sizeof(DiskExtent) * (diskExtentCapacity - 1));
                    bytes_volumeDiskExtents = new byte[bytes_volumeDiskExtents_capacity];
                    fixed (byte* bytePtr_volumeDiskExtents = bytes_volumeDiskExtents)
                    {
                        uint bytes_volumeDiskExtents_len;
                        if (0 == NativeMethods.DeviceIoControl(
                            hVolume.Handle,
                            Win32Constants.IOControl_VolumeGetVolumeDiskExtents,
                            null,
                            0,
                            bytePtr_volumeDiskExtents,
                            unchecked((uint)bytes_volumeDiskExtents_capacity),
                            &bytes_volumeDiskExtents_len,
                            null))
                        {
                            uint dwErrCode = unchecked((uint)Marshal.GetLastWin32Error());
                            if (dwErrCode == Win32Constants.ErrorMoreData)
                            {
                                if (diskExtentCapacity == 1 << 30) throw new OutOfMemoryException();
                                diskExtentCapacity <<= 1;
                                continue;
                            }
                            throw GetException(unchecked((int)dwErrCode));
                        }
                        if (unchecked((uint)bytes_volumeDiskExtents_capacity) < bytes_volumeDiskExtents_len) throw new NotImplementedException();
                        int i = unchecked((int)bytes_volumeDiskExtents_len) - sizeof(VolumeDiskExtents);
                        int diskExtentCount = i / sizeof(DiskExtent);
                        if (diskExtentCount * sizeof(DiskExtent) != i) throw new NotImplementedException();
                        diskExtentCount += 1;
                        if (unchecked((uint)diskExtentCount) != ((VolumeDiskExtents*)bytePtr_volumeDiskExtents)->NumberOfDiskExtents) throw new NotImplementedException();
                        break;
                    }
                }
            }
            uint ret = uint.MaxValue;
            fixed (byte* bytePtr_volumeDiskExtents = bytes_volumeDiskExtents)
            {
                StoragePropertyQuery query;
                query.PropertyId = StoragePropertyId.AccessAlignmentDescriptor;
                query.QueryType = QueryType.Standard;
                StorageAccessAlignmentDescriptor a;

                uint i = ((VolumeDiskExtents*)bytePtr_volumeDiskExtents)->NumberOfDiskExtents;
                DiskExtent* diskExtent = &((VolumeDiskExtents*)bytePtr_volumeDiskExtents)->FirstExtent;
                while (0 < i)
                {

                    string name = @"\\.\PhysicalDrive" + diskExtent->DiskNumber;
                    using (var hStorageMedia = FileHandle.New(
                        name,
                        0,
                        dwCreationDisposition: FileCreationDisposition.OpenExisting,
                        dwFlagsAndAttributes: 0))
                    {
                        uint noBytes;
                        if (0 == NativeMethods.DeviceIoControl(
                            hStorageMedia.Handle,
                            Win32Constants.IOControl_StorageQueryProperty,
                            &query,
                            unchecked((uint)sizeof(StoragePropertyQuery)),
                            &a,
                            unchecked((uint)sizeof(StorageAccessAlignmentDescriptor)),
                            &noBytes,
                            null))
                        {
                            throw GetException(Marshal.GetLastWin32Error());
                        }
                        if (a.BytesOffsetForSectorAlignment != 0
                            || (a.BytesPerLogicalSector & (a.BytesPerLogicalSector - 1)) != 0
                            || (a.BytesPerPhysicalSector & (a.BytesPerLogicalSector - 1)) != 0
                            || (a.BytesPerPhysicalSector & (a.BytesPerPhysicalSector - 1)) != 0
                            || (diskExtent->StartingOffset & (a.BytesPerPhysicalSector - 1)) != 0)
                        {
                            return -1;
                        }
                        if (a.BytesPerPhysicalSector < ret)
                        {
                            ret = a.BytesPerPhysicalSector;
                        }
                    }
                    i -= 1;
                    diskExtent++;
                }
            }
            if (int.MaxValue < ret) return -1;
            return unchecked((int)ret);
        }


        public static void Run(ErrorMode errorMode, Action action)
        {
            ErrorModeSynchronization.Instance.Run(errorMode, action);
        }
    }
}
