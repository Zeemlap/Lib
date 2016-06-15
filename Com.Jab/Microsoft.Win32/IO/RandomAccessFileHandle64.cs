using Microsoft.Win32.SafeHandles;
using Com.Jab.SystemEx;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;

namespace Com.Jab.Microsoft.Win32.IO
{
    [StructLayout(LayoutKind.Sequential)]
    public class RandomAccessFileHandle64 : IDisposable
    {
        private const int s_offsetToSectorOffCur1InLongs = 3;
        private long m_pd1;
        private long m_pd2;
        private long m_pd3;
        private ulong m_sectorOffCur1;
        private ulong m_sectorOffCur2;
        private ulong m_sectorOffCur3;
        private long m_sectorSizeLog2;
        private ulong m_sectorOffMax;
        private byte[] m_buffer;
        private GCHandle m_bufferGCHandle;
        private bool m_isDisposed;
        internal FileHandle Handle;

        public RandomAccessFileHandle64(int sectorSize, FileHandle fileHandle)
        {
            bool ex = true;
            try
            {
                if (!sectorSize.IsPowerOfTwo()
                    || sectorSize == (1 << 30)) throw new ArgumentOutOfRangeException();
                if (fileHandle == null) throw new ArgumentNullException();
                m_sectorOffMax = ulong.MaxValue / unchecked((uint)sectorSize);
                if (ulong.MaxValue == m_sectorOffMax) m_sectorOffMax -= 1;
                m_sectorSizeLog2 = sectorSize.Log2Floor();
                m_buffer = new byte[sectorSize * 3];
                m_bufferGCHandle = GCHandle.Alloc(m_buffer, GCHandleType.Pinned);
                m_sectorOffCur1 = ulong.MaxValue;
                m_sectorOffCur2 = ulong.MaxValue;
                m_sectorOffCur3 = ulong.MaxValue;
                m_pd1 = 0;
                m_pd2 = 0;
                m_pd3 = 0;
                Handle = fileHandle;
                ex = false;
            }
            finally
            {
                if (ex && fileHandle != null)
                {
                    fileHandle.Dispose();
                }
            }
        }
        
        public int SectorSizeLog2
        {
            get
            {
                return (int)m_sectorSizeLog2;
            }
        }

        public unsafe byte* Allocate(ulong sectorOff)
        {
            int slot;
            if (m_isDisposed) goto invalidOperation;
            if (m_sectorOffMax < sectorOff) goto outOfRange;
            if (m_sectorOffCur1 == sectorOff)
            {
                slot = 0;
                goto winning;
            }
            if (m_sectorOffCur2 == sectorOff)
            {
                slot = 1;
                goto winning;
            }
            if (m_sectorOffCur3 == sectorOff)
            {
                slot = 2;
                goto winning;
            }
            goto losing;
        winning:
            fixed (long* pdPtr = &m_pd1)
            {
                if (0x7FFFFFFFFFFFFFFE <= pdPtr[slot]) return null;
                pdPtr[slot] += 2;
            }
            return (byte*)m_bufferGCHandle.AddrOfPinnedObject() + (slot << SectorSizeLog2);
        losing:
            if (m_pd1 < 2)
            {
                slot = 0;
            }
            else if (m_pd2 < 2)
            {
                slot = 1;
            }
            else if (m_pd3 < 2)
            {
                slot = 2;
            }
            else
            {
                return null;
            }
            fixed (long* pdPtr = &m_pd1)
            {
                byte* bufferPtr = (byte*)m_bufferGCHandle.AddrOfPinnedObject() + (slot << SectorSizeLog2);
                ulong* sectorOffCurPtr = (ulong*)pdPtr + s_offsetToSectorOffCur1InLongs;
                if ((pdPtr[slot] & 1L) != 0)
                {
                    Handle.Write(bufferPtr, 
                        sectorOffCurPtr[slot] << SectorSizeLog2, 
                        1U << SectorSizeLog2);
                    pdPtr[slot] &= ~1L;
                }
                Handle.Read(bufferPtr, sectorOff<< SectorSizeLog2, 1U << SectorSizeLog2);
                pdPtr[slot] += 2;
                sectorOffCurPtr[slot] = sectorOff;
                return bufferPtr;
            }
        outOfRange:
            throw new ArgumentOutOfRangeException();
        invalidOperation:
            throw new InvalidOperationException();
        }

        public unsafe void Dispose()
        {
            if (!m_isDisposed)
            {
                Flush();   
                m_bufferGCHandle.Free();
                Handle.Dispose();
                m_isDisposed = true;
            }
        }

        public unsafe void Flush()
        {
            if (m_isDisposed) goto invalidOperation;
            fixed (long* pdPtr = &m_pd1)
            {
                ulong* sectorOffCurPtr = (ulong*)pdPtr + s_offsetToSectorOffCur1InLongs;
                byte* bufferPtr = (byte*)m_bufferGCHandle.AddrOfPinnedObject();
                int slot = 0;
                while (true)
                {
                    if ((pdPtr[slot] & 1L) != 0)
                    {
                        Handle.Write(bufferPtr + slot * (1 << SectorSizeLog2), sectorOffCurPtr[slot], 1U << SectorSizeLog2);
                        pdPtr[slot] &= ~1L;
                    }
                    if (++slot == 3) break;
                }
            }
            return;
        invalidOperation:
            throw new InvalidOperationException();
        }

        public unsafe void Free(byte* fiBufferPtr, bool needsFlush)
        {
            if (m_isDisposed) goto invalidOperation;
            int slot = TryGetSlot(fiBufferPtr);
            if (0 <= slot)
            {
                fixed (long* pdPtr = &m_pd1)
                {
                    long pd = pdPtr[slot];
                    if (pd < 2) goto invalidOperation;
                    if ((pdPtr[slot] = (pd - 2) | (needsFlush ? 1L : 0)) < 2)
                    {
                        *((ulong*)pdPtr + s_offsetToSectorOffCur1InLongs) = ulong.MaxValue;
                    }
                }
                return;
            }
            throw new ArgumentOutOfRangeException();
        invalidOperation:
            throw new InvalidOperationException();
        }

        private unsafe int TryGetSlot(byte* fiBufferPtr)
        {
            byte* i1 = (byte*)m_bufferGCHandle.AddrOfPinnedObject();
            if (fiBufferPtr < i1)
            {
                return -1;
            }
            ulong i2 = (ulong)(fiBufferPtr - i1);
            if (long.MaxValue < i2
                || ((long)i2 & ((1 << SectorSizeLog2) - 1)) != 0)
            {
                return -1;
            }
            int slot = (int)((long)i2 >> SectorSizeLog2);
            if (2 < slot)
            {
                return -1;
            }
            return slot;
        }

    }
}
