using Microsoft.Win32.SafeHandles;
using Com.Jab.Microsoft.Win32.IO;
using System;
using System.Runtime.InteropServices;

namespace Com.Jab.Microsoft.Win32.PInvoke
{
    public static class NativeMethods
    {
        public const uint StandardAccessRights_Required = 0xF0000;
        public const uint AccessRights_Reserved = 3U << 26;
        public const uint AccessRights_Specific = 0xFFFF;
        public const uint AccessRights_AccessSystemSecurity = 0x1000000;
        public const uint AccessRights_MaximumAllowed = 0x2000000;

        // Reserved for system use.
        public const uint FileFlagsAndAttributes_Attribute_Device = 0x40;
        public const uint FileFlagsAndAttributes_Attribute_Virtual = 0x10000;

        [DllImport("kernel32.dll", SetLastError = true)]
        public static extern uint CloseHandle(IntPtr handle);

        [DllImport("kernel32.dll", SetLastError = true)]
        public static unsafe extern int CommitTransaction(SafeTransactionHandle transactionHandle);

        [DllImport("kernel32.dll", SetLastError = true)]
        public static unsafe extern int CopyFileExW(
            char* lpExistingFileName,
            char* lpNewFileName,
            ProgressRoutine lpProgressRoutine,
            void* lpData,
            int* pbCancel,
            CopyFileFlags dwCopyFlags);

        [DllImport("kernel32.dll", SetLastError = true)]
        public static unsafe extern SafeFileHandle CreateFileW(
            char* lpFileName,
            uint dwDesiredAccess,
            FileShareMode dwShareMode,
            SecurityAttributes* lpSecurityAttributes,
            FileCreationDisposition dwCreationDisposition,
            FileFlagsAndAttributes dwFlagsAndAttributes,
            SafeFileHandle hTemplateFile);

        [DllImport("kernel32.dll", SetLastError = true)]
        public static unsafe extern SafeFileHandle CreateFileTransactedW(
            char* lpFileName,
            uint dwDesiredAccess,
            FileShareMode dwShareMode,
            SecurityAttributes* lpSecurityAttributes,
            FileCreationDisposition dwCreationDisposition,
            FileFlagsAndAttributes dwFlagsAndAttributes,
            SafeFileHandle hTemplateFile,
            SafeTransactionHandle hTransaction,
            ushort* pusMiniVersion,
            void* pExtendedParameter);

        [DllImport("ktmW32.dll", SetLastError = true)]
        public static unsafe extern SafeTransactionHandle CreateTransaction(
            SecurityAttributes* lpSecurityAttributes,
            void* uow,
            uint createOptions,
            uint isolationLevel,
            uint isolationFlags,
            uint timeout,
            [MarshalAs(UnmanagedType.LPWStr)] string description);

        [DllImport("kernel32.dll", SetLastError = true)]
        public static unsafe extern int DeleteFileW(
            [MarshalAs(UnmanagedType.LPTStr)] string lpFileName);

        [DllImport("kernel32.dll", SetLastError = true)]
        public static unsafe extern int DeleteFileTransactedW(
            [MarshalAs(UnmanagedType.LPWStr)] string lpFileName,
            SafeTransactionHandle hTransaction);

        [DllImport("kernel32.dll", SetLastError = true)]
        public static unsafe extern int DeviceIoControl(
            SafeFileHandle hDevice,
            uint dwIoControlCode,
            void* lpInBuffer,
            uint nInBufferSize,
            void* lpOutBuffer,
            uint nOutBufferSize,
            uint* lpBytesReturned,
            Overlapped* lpOverlapped);

        [DllImport("kernel32.dll", SetLastError = true)]
        public static unsafe extern int FormatMessageW(
            FormatMessageFlags dwFlags,
            void* lpSource,
            uint dwMessageId,
            uint dwLanguageId,
            char* lpBuffer,
            uint nSize,
            IntPtr arguments);

        //DWORD WINAPI FormatMessage(
        //  _In_ DWORD   dwFlags,
        //  _In_opt_ LPCVOID lpSource,
        //  _In_ DWORD   dwMessageId,
        //  _In_ DWORD   dwLanguageId,
        //  _Out_ LPTSTR  lpBuffer,
        //  _In_ DWORD   nSize,
        //  _In_opt_ va_list *Arguments
        //);

        [DllImport("kernel32.dll", SetLastError = true)]
        public static unsafe extern uint GetFullPathNameW(
            [MarshalAs(UnmanagedType.LPWStr)] string lpFileName,
            uint nBufferLength,
            char* lpBuffer,
            char** lpFilePart);

        [DllImport("kernel32.dll", SetLastError = true)]
        public static unsafe extern uint GetFinalPathNameByHandleW(
            SafeFileHandle hFile,
            char* lpszFilePath,
            uint cchFilePath,
            GetFinalPathNameByHandleFlags dwFlags);

        [DllImport("ktmW32.dll", SetLastError = true)]
        public static unsafe extern int GetTransactionId(
            SafeTransactionHandle transactionHandle,
            void* transactionGuid);

        [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
        public static unsafe extern int GetVolumeInformationW(
            char* lpRootPathName,
            char* lpVolumeNameBuffer,
            uint nVolumeNameSize,
            uint* lpVolumeSerialNumber,
            uint* lpMaximumComponentLength,
            uint* lpFileSystemFlags,
            char* lpFileSystemNameBuffer,
            uint nFileSystemNameSize);

        [DllImport("kernel32.dll", SetLastError = true)]
        public static unsafe extern IntPtr LocalFree(IntPtr hLocal);

        [DllImport("kernel32.dll", SetLastError = true)]
        public static unsafe extern int LockFileEx(
            SafeFileHandle hFile,
            LockFileFlags dwFlags,
            uint dwReserved,
            uint nNumberOfBytesToLockLow,
            uint nNumberOfBytesToLockHigh,
            Overlapped* lpOverlapped);

        [DllImport("kernel32.dll", SetLastError = true)]
        public static unsafe extern int ReadFile(
            SafeFileHandle hFile,
            void* lpBuffer,
            uint nNumberOfBytesToRead,
            uint* nNumberOfBytesRead,
            Overlapped* lpOverlapped);
        
        [DllImport("kernel32.dll", SetLastError = true)]
        public static unsafe extern int SetEndOfFile(SafeFileHandle hFile);

        [DllImport("kernel32.dll", SetLastError = true)]
        public static unsafe extern ErrorMode SetErrorMode(ErrorMode dwNewMode);

        [DllImport("kernel32.dll", SetLastError = true)]
        public static unsafe extern int SetFilePointer(
            SafeFileHandle hFile,
            int lDistanceToMove,
            int* lpDistanceToMoveHigh,
            FilePointerMoveMethod dwMoveMethod);

        [DllImport("kernel32.dll", SetLastError = true)]
        public static unsafe extern void SetLastError(uint dwErrCode);

        [DllImport("kernel32.dll", SetLastError = true)]
        public static unsafe extern int WriteFile(
            SafeFileHandle hFile,
            void* lpBuffer,
            uint nNumberOfBytesToWrite,
            uint* nNumberOfBytesWritten,
            Overlapped* lpOverlapped);

    }
}
