using System;

namespace Com.Jab.Microsoft.Win32
{
    public static class Win32Constants
    {
        public const uint NoError = 0;
        public const uint ErrorFileNotFound = 0x2;
        public const uint ErrorPathNotFound = 0x3;
        public const uint ErrorInvalidHandle = 0x6;
        public const uint ErrorNotEnoughMemory = 0x8;
        public const uint ErrorSharingViolation = 0x20;
        public const uint ErrorFileExists = 0x50;
        public const uint ErrorInvalidParameter = 0x57;
        public const uint ErrorNegativeSeek = 0x83;
        public const uint ErrorAlreadyExists = 0xB7;
        public const uint ErrorMoreData = 0xEA;
        public const uint ErrorTransactionNotActive = 0x00001A2D;
        public const uint ErrorTransactionAlreadyAborted = 0x00001A30;

        public unsafe static readonly IntPtr InvalidHandleValue = new IntPtr(unchecked((void*)-1L));
        public const uint InvalidSetFilePointer = 0xFFFFFFFF;
        
        public const int MaxPath = 260;


        internal const uint IOControl_VolumeBase = 'V';
        internal const uint FileAnyAccess = 0;
        internal const uint FileReadData = 1;
        internal const uint FileWriteData = 2;
        internal const uint MethodBuffered = 0;
        internal const uint MethodInDirect = 1;
        internal const uint MethodOutDirect = 2;
        internal const uint MethodNeither = 3;
        internal const uint DeviceType_MassStorage = 0x2D;
        internal const uint IOControl_StorageBase = DeviceType_MassStorage;
        public static readonly uint IOControl_VolumeGetVolumeDiskExtents = ControlCode(IOControl_VolumeBase, 0, 0, FileAnyAccess);
        public static readonly uint IOControl_StorageQueryProperty = ControlCode(IOControl_StorageBase, 0x0500, MethodBuffered, FileAnyAccess);

        private static uint ControlCode(uint deviceType, uint function, uint method, uint access)
        {
            return (deviceType << 16) | (access << 14) | (function << 2) | method;
        }

    }
}
