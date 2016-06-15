using System;

namespace Com.Jab.Microsoft.Win32.PInvoke
{
    public unsafe delegate uint ProgressRoutine(
        long totalFileSize,
        long totalBytesTransferred,
        long streamSize,
        long streamBytesTransferred,
        uint dwStreamNumber,
        uint dwCallbackReason,
        IntPtr hSourceFile,
        IntPtr hDestinationFile,
        void* lpData);
}
