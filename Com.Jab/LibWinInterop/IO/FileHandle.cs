using Microsoft.Win32.SafeHandles;
using PersistentDictionary.Transactions;
using System;
using System.Runtime.InteropServices;
using System.Transactions;
using Com.Jab.LibWinInterop.Win32.PInvoke;
using Com.Jab.LibWinInterop.Win32;
using Com.Jab.LibWinInterop.Transactions;

namespace Com.Jab.LibWinInterop.IO
{
    public class FileHandle : IDisposable
    {
        internal static FileHandle Null { get; } = new FileHandle()
        {
            Handle = new SafeFileHandle(Win32Constants.InvalidHandleValue, false),
        };

        private const uint s_dwDesiredAccess_default = (uint)(GenericAccessRights.Read | GenericAccessRights.Write);
        private const FileShareMode s_dwShareMode_default = FileShareMode.Read | FileShareMode.Write;
        private const FileCreationDisposition s_dwCreationDisposition_default = FileCreationDisposition.CreateAlways;
        private const FileFlagsAndAttributes s_dwFlagsAndAttributes_default = FileFlagsAndAttributes.Attribute_Normal;

        internal SafeFileHandle Handle;

        private FileHandle()
        {

        }
        
        public unsafe long FilePointer
        {
            get
            {
                return SetFilePointer(0, FilePointerMoveMethod.Current);
            }
        }
        
        public unsafe static FileHandle New(
            string fileName,
            uint dwDesiredAccess = s_dwDesiredAccess_default,
            FileShareMode dwShareMode = s_dwShareMode_default,
            FileCreationDisposition dwCreationDisposition = s_dwCreationDisposition_default,
            FileFlagsAndAttributes dwFlagsAndAttributes = s_dwFlagsAndAttributes_default)
        {
            fixed (char* lpFileName = fileName)
            {
                return New(lpFileName, 
                    dwDesiredAccess, 
                    dwShareMode, 
                    dwCreationDisposition, 
                    dwFlagsAndAttributes);
            }
        }

        public unsafe static FileHandle New(
            char* lpFileName,
            uint dwDesiredAccess = s_dwDesiredAccess_default,
            FileShareMode dwShareMode = s_dwShareMode_default,
            FileCreationDisposition dwCreationDisposition = s_dwCreationDisposition_default,
            FileFlagsAndAttributes dwFlagsAndAttributes = s_dwFlagsAndAttributes_default)
        {
            if (!Win32Util.IsCreationDispositionValid(dwCreationDisposition)) throw new ArgumentOutOfRangeException();
            bool ex = true;
            SafeFileHandle handle = null;
            try
            {
                handle = NativeMethods.CreateFileW(
                    lpFileName,
                    dwDesiredAccess,
                    dwShareMode,
                    null,
                    dwCreationDisposition,
                    dwFlagsAndAttributes,
                    new SafeFileHandle(IntPtr.Zero, false));
                if (handle.IsInvalid)
                {
                    throw Win32Util.GetException(Marshal.GetLastWin32Error());
                }
                var fileUnsafe = new FileHandle();
                fileUnsafe.Handle = handle;
                ex = false;
                return fileUnsafe;
            }
            finally
            {
                if (ex)
                {
                    handle.Dispose();
                }
            }
        }

        public unsafe static FileHandle NewTx(
            string fileName,
            uint dwDesiredAccess = s_dwDesiredAccess_default,
            FileShareMode dwShareMode = s_dwShareMode_default,
            FileCreationDisposition dwCreationDisposition = s_dwCreationDisposition_default,
            FileFlagsAndAttributes dwFlagsAndAttributes = s_dwFlagsAndAttributes_default,
            Transaction transaction = null)
        {
            fixed (char* lpFileName = fileName)
            {
                return NewTx(lpFileName,
                    dwDesiredAccess,
                    dwShareMode,
                    dwCreationDisposition,
                    dwFlagsAndAttributes,
                    transaction);
            }
        }

        public unsafe static FileHandle NewTx(
            char* lpFileName,
            uint dwDesiredAccess = (uint)(GenericAccessRights.Read | GenericAccessRights.Write),
            FileShareMode dwShareMode = FileShareMode.Read | FileShareMode.Write,
            FileCreationDisposition dwCreationDisposition = FileCreationDisposition.CreateAlways,
            FileFlagsAndAttributes dwFlagsAndAttributes = FileFlagsAndAttributes.Attribute_Normal,
            Transaction transaction = null)
        {
            if (!Win32Util.IsCreationDispositionValid(dwCreationDisposition)) throw new ArgumentOutOfRangeException();
            if (transaction == null)
            {
                transaction = Transaction.Current;
                if (transaction == null) throw new InvalidOperationException();
            }
            using (var hKernelTransaction = transaction.GetKernelTransaction())
            {
                SafeFileHandle hFile = null;
                FileHandle fileHandle = null;
                var ex = false;
                try
                {
                    ushort miniVersion = 0xFFFF;
                    hFile = NativeMethods.CreateFileTransactedW(
                        lpFileName,
                        dwDesiredAccess,
                        dwShareMode,
                        null,
                        dwCreationDisposition,
                        dwFlagsAndAttributes,
                        new SafeFileHandle(IntPtr.Zero, false),
                        hKernelTransaction,
                        &miniVersion,
                        null);
                    if (hFile.IsInvalid)
                    {
                        throw Win32Util.GetException(Marshal.GetLastWin32Error());
                    }
                    fileHandle = new FileHandle();
                    fileHandle.Handle = hFile;
                    ex = false;
                    return fileHandle;
                }
                finally
                {
                    if (ex)
                    {
                        if (fileHandle != null)
                        {
                            fileHandle.Dispose();
                        }
                        else if (hFile != null)
                        {
                            hFile.Close();
                        }
                    }
                }
            }
        }
        
        public static bool Delete(string lpFileName)
        {
            if (0 != NativeMethods.DeleteFileW(lpFileName)) return true;
            uint lastError = unchecked((uint)Marshal.GetLastWin32Error());
            switch (lastError)
            {
                case Win32Constants.ErrorFileNotFound: return false;
            }
            throw Win32Util.GetException(unchecked((int)lastError));
        }

        public static bool DeleteTx(
            string fileName, 
            Transaction transaction = null)
        {
            if (transaction == null)
            {
                transaction = Transaction.Current;
                if (transaction == null) throw new InvalidOperationException();
            }
            using (var hKernelTransaction = transaction.GetKernelTransaction())
            {
                if (0 != NativeMethods.DeleteFileTransactedW(fileName, hKernelTransaction)) return true;
                uint lastError = unchecked((uint)Marshal.GetLastWin32Error());
                switch (lastError)
                {
                    case Win32Constants.ErrorFileNotFound: return false;
                }
                throw Win32Util.GetException(unchecked((int)lastError));
            }
        }

        public void Dispose()
        {
            Handle.Dispose();
            Handle = null;
        }

        public string GetFinalPathName(GetFinalPathNameByHandleFlags dwFlags = 0, string buffer = null)
        {
            if (Handle == null) throw new InvalidOperationException();
            int dwErrCode = Win32Util.GetFinalPathName(Handle, dwFlags, ref buffer);
            if (dwErrCode == 0) return buffer;
            if (dwErrCode == Win32Constants.ErrorPathNotFound) return null;
            throw Win32Util.GetException(dwErrCode);
        }

        public unsafe void Read(byte* bufferPtr, ulong fo, uint noBytesToRead)
        {
            uint noBytesRead;
            if (Handle == null) throw new InvalidOperationException();
            byte* t = bufferPtr + noBytesToRead;
            if ((t < bufferPtr || t < (byte*)noBytesToRead) && null < t) throw new ArgumentException();
            Overlapped overlapped = new Overlapped();
            overlapped.Offset = fo;
            while (true)
            {
                if (0 == NativeMethods.ReadFile(
                    Handle,
                    bufferPtr,
                    noBytesToRead,
                    &noBytesRead,
                    &overlapped))
                {
                    // ERROR_OPERATION_ABORTED
                    // ERROR_NOT_ENOUGH_QUOTA
                    // region being read is locked
                    throw Win32Util.GetException(Marshal.GetLastWin32Error());
                }
                if (noBytesRead == 0) throw new ArgumentException();
                if (noBytesToRead < noBytesRead) throw new OverflowException();
                noBytesToRead -= noBytesRead;
                if (noBytesToRead == 0)
                {
                    return;
                }
                bufferPtr = unchecked(bufferPtr + noBytesRead);
            }
        }

        public void SetEndOfFile()
        {
            if (Handle == null) throw new InvalidOperationException();
            if (0 != NativeMethods.SetEndOfFile(Handle)) return;
            uint lastError = unchecked((uint)Marshal.GetLastWin32Error());
            throw Win32Util.GetException(unchecked((int)lastError));

        }
        
        public unsafe long SetFilePointer(long value, FilePointerMoveMethod m)
        {
            if (Handle == null) throw new InvalidOperationException();
            int i1 = unchecked((int)(uint)((ulong)value >> 32));
            int i2 = NativeMethods.SetFilePointer(Handle, (int)value, &i1, m);
            uint lastError;
            if (unchecked((uint)i2) == Win32Constants.InvalidSetFilePointer
                && (lastError = unchecked((uint)Marshal.GetLastWin32Error())) != Win32Constants.NoError)
            {
                if (lastError == Win32Constants.ErrorNegativeSeek) throw new ArgumentOutOfRangeException();
                throw Win32Util.GetException(unchecked((int)lastError));
            }
            return unchecked((long)(((ulong)(uint)i1 << 32) | (uint)i2));
        }

        public unsafe void Write(byte* bufferPtr, ulong fo, uint noBytesToWrite)
        {
            uint noBytesWritten;
            if (Handle == null) throw new InvalidOperationException();
            byte* t = bufferPtr + noBytesToWrite;
            if ((t < bufferPtr || t < (byte*)noBytesToWrite) && null < t) throw new ArgumentException();
            Overlapped overlapped = new Overlapped();
            overlapped.Offset = fo;
            while (true)
            {
                if (0 == NativeMethods.WriteFile(
                    Handle,
                    bufferPtr,
                    noBytesToWrite,
                    &noBytesWritten,
                    &overlapped))
                {
                    // ERROR_OPERATION_ABORTED
                    // ERROR_NOT_ENOUGH_QUOTA
                    // region being read is locked
                    throw Win32Util.GetException(Marshal.GetLastWin32Error());
                }
                if (noBytesWritten == 0) throw new ArgumentException();
                if (noBytesToWrite < noBytesWritten) throw new OverflowException();
                noBytesToWrite -= noBytesWritten;
                if (noBytesToWrite == 0)
                {
                    return;
                }
                bufferPtr = unchecked(bufferPtr + noBytesToWrite);
            }
        }
    }
}
