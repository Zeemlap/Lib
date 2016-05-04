using Com.Jab.LibCore;
using Com.Jab.LibWinInterop.Win32;
using Com.Jab.LibWinInterop.Win32.PInvoke;
using System.Runtime.InteropServices;

namespace Com.Jab.LibWinInterop.Win32
{

    [StructLayout(LayoutKind.Sequential)]
    public class VolumeInfo
    {
        private uint m_volumeSerialNumber;
        private uint m_maximumComponentLength;
        private FileSystemFlags m_fileSystemFlags;
        
        public unsafe VolumeInfo(char* lpRootPathName)
        {
            VolumeName = Util.StringAllocate(Win32Constants.MaxPath + 1);
            FileSystemName = Util.StringAllocate(Win32Constants.MaxPath + 1);
            Win32Util.Run(ErrorMode.Sem_FailCriticalErrors, () =>
            {
                fixed (char* lpVolumeNameBuffer = VolumeName)
                {
                    fixed (char* lpFileSystemNameBuffer = FileSystemName)
                    {
                        fixed (uint* lpVolumeSerialNumber = &m_volumeSerialNumber)
                        {
                            if (0 != NativeMethods.GetVolumeInformationW(
                                lpRootPathName,
                                lpVolumeNameBuffer,
                                unchecked((uint)VolumeName.Length),
                                lpVolumeSerialNumber,
                                lpVolumeSerialNumber + 1,
                                lpVolumeSerialNumber + 2,
                                lpFileSystemNameBuffer,
                                unchecked((uint)FileSystemName.Length)))
                            {
                                return;
                            }
                            int lastError = Marshal.GetLastWin32Error();
                            throw Win32Util.GetException(lastError);
                        }
                    }
                }
            });
            VolumeName = Util.StringSetLengthToIndexOfNullChar(VolumeName);
            FileSystemName = Util.StringSetLengthToIndexOfNullChar(FileSystemName);
        }
        public string VolumeName { get; private set; }
        public uint VolumeSerialNumber { get { return m_volumeSerialNumber; } }
        public uint MaximumComponentLength { get { return m_maximumComponentLength; } }
        public FileSystemFlags FileSystemFlags { get { return m_fileSystemFlags; } }
        public string FileSystemName { get; private set; }

    }

}
