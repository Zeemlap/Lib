using Com.Jab.LibCore;
using System;
using System.Diagnostics;

namespace Com.Jab.LibWinInterop.IO
{
    public static class Extensions
    {
        public static unsafe void Access(this RandomAccessFileHandle64 randAccFH, ulong byteOff, uint count, SectorAccessor accessor)
        {
            if (accessor == null) throw new ArgumentNullException(); 
            ulong sectorOff = byteOff >> randAccFH.SectorSizeLog2;
            bool needsFlush = false;
            byte* sectorBuff = null;
            try
            {
                sectorBuff = randAccFH.Allocate(sectorOff);
                int byteOff_buff = (int)(byteOff - (sectorOff << randAccFH.SectorSizeLog2));
                Debug.Assert(count <= (1 << randAccFH.SectorSizeLog2) - byteOff_buff);
                accessor(sectorBuff + byteOff_buff, out needsFlush);
            }
            finally
            {
                if (sectorBuff != null)
                {
                    randAccFH.Free(sectorBuff, needsFlush);
                }
            }
        }

        public static unsafe T Access<T>(this RandomAccessFileHandle64 randAccFH, ulong byteOff, uint count, SectorAccessor<T> accessor)
        {
            if (accessor == null) throw new ArgumentNullException();
            ulong sectorOff = byteOff >> randAccFH.SectorSizeLog2;
            bool needsFlush = false;
            byte* sectorBuff = null;
            try
            {
                sectorBuff = randAccFH.Allocate(sectorOff); 
                int byteOff_buff = (int)(byteOff - (sectorOff << randAccFH.SectorSizeLog2));
                Debug.Assert(count <= (1 << randAccFH.SectorSizeLog2) - byteOff_buff);
                void* bufferPtr = sectorBuff + byteOff_buff;
                return accessor(bufferPtr, out needsFlush);
            }
            finally
            {
                if (sectorBuff != null)
                {
                    randAccFH.Free(sectorBuff, needsFlush);
                }
            }
        }

        public static unsafe long GetInt64(this RandomAccessFileHandle64 randAccFH, ulong byteOff)
        {
            return randAccFH.Access(byteOff, sizeof(long), (void* bufferPtr, out bool needsFlush) =>
            {
                if (((long)bufferPtr & 0x7) != 0) throw new ArgumentOutOfRangeException();
                needsFlush = false;
                return *(long*)bufferPtr;
            });
        }

        public static unsafe void SetInt64(this RandomAccessFileHandle64 randAccFH, ulong byteOff, long value)
        {
            randAccFH.Access(byteOff, sizeof(long), (void* bufferPtr, out bool needsFlush) =>
            {
                if (((long)bufferPtr & 0x7) != 0) throw new ArgumentOutOfRangeException();
                *(long*)bufferPtr = value;
                needsFlush = true;
            });
        }

        public static unsafe ulong GetUInt64(this RandomAccessFileHandle64 randAccFH, ulong byteOff)
        {
            long value = randAccFH.GetInt64(byteOff);
            return *(ulong*)&value;
        }

        public static unsafe void SetUInt64(this RandomAccessFileHandle64 randAccFH, ulong byteOff, ulong value)
        {
            randAccFH.SetInt64(byteOff, *(long*)&value);
        }

        public static unsafe bool GetBit(this RandomAccessFileHandle64 randAccFH, ulong bitIndex)
        {
            ulong byteOff = (bitIndex >> 3) & ~7UL;
            ulong bitMaskULong = 1UL << unchecked((int)bitIndex + ((int)bitIndex & 0x38));
            return (randAccFH.GetUInt64(byteOff) & bitMaskULong) != 0;
        }

        public static unsafe bool ChangeBit(
            this RandomAccessFileHandle64 randAccFH,
            ulong bitIndex,
            BitChangeType changeType)
        {
            if (bitIndex < 0) throw new ArgumentOutOfRangeException();
            if (changeType != BitChangeType.Toggle && changeType != BitChangeType.Clear && changeType != BitChangeType.Set) throw new ArgumentOutOfRangeException();
            ulong byteOff = (bitIndex >> 3) & ~7UL; // 8 byte boundary aligned ulong file ptr containing bit
            ulong bitMaskULong = 1UL << unchecked((int)(bitIndex + (bitIndex & 0x38)));
            return randAccFH.Access(byteOff, sizeof(ulong), (void* bufferPtr, out bool needsFlush) =>
            {
                ulong* bitULongPtr = (ulong*)bufferPtr;
                switch (changeType)
                {
                    case BitChangeType.Clear:
                        *bitULongPtr &= ~bitMaskULong;
                        break;
                    case BitChangeType.Set:
                        *bitULongPtr |= bitMaskULong;
                        break;
                    case BitChangeType.Toggle:
                        *bitULongPtr ^= bitMaskULong;
                        break;
                }
                needsFlush = true;
                return (*bitULongPtr & bitMaskULong) != 0;
            });
        }

        public static unsafe void SetBitRange(this RandomAccessFileHandle64 randAccFH, 
            ulong firstBitIndex, 
            ulong count, 
            bool value)
        {
            if (firstBitIndex < 0) throw new ArgumentOutOfRangeException();
            if (27 < randAccFH.SectorSizeLog2) throw new ArgumentException();
            ulong byteOff_firstBitULong = (firstBitIndex >> 3) & ~7UL;
            uint n1 = unchecked((uint)((firstBitIndex + (firstBitIndex & 0x38UL)) & 0x3FUL));
            // n1 is the number of bits to skip in the first ulong.
            ulong sectorOff = byteOff_firstBitULong >> randAccFH.SectorSizeLog2;
            byte* sectorBuff = null;
            try
            {
                sectorBuff = randAccFH.Allocate(sectorOff);
                uint n2;
                ulong* bitULongPtr = (ulong*)(sectorBuff + (byteOff_firstBitULong - (sectorOff << randAccFH.SectorSizeLog2)));
                ulong bitMaskULong;
                if (0 != n1) goto losing1;
            winning1:
                bitMaskULong = value ? 0xFFFFFFFFFFFFFFFF : 0;
                
                n2 = unchecked((uint)((ulong)sectorBuff + (1U << randAccFH.SectorSizeLog2) - (ulong)bitULongPtr));
                n2 = checked(n2 << 3);
                // n2 is the remaining number of bits in the current IO unit
                Debug.Assert((n2 & 63) == 0);
                if (count >= n2)
                {
                    n1 = n2 >> 6;
                    do
                    {
                        *bitULongPtr++ = bitMaskULong;
                    } while (0 < --n1);
                    count -= n2;
                    randAccFH.Free(sectorBuff, true);
                    sectorBuff = null;
                }

                n2 = 1U << (randAccFH.SectorSizeLog2 + 3);
                // n2 is the number of bits in an IO unit
                while (count >= n2)
                {
                    sectorOff += 1;
                    sectorBuff = randAccFH.Allocate(sectorOff);
                    bitULongPtr = (ulong*)sectorBuff;
                    n1 = n2 >> 6;
                    do
                    {
                        *bitULongPtr++ = bitMaskULong;
                    } while (0 < --n1);
                    count -= n2;
                    randAccFH.Free(sectorBuff, true);
                    sectorBuff = null;
                }
                if (count != 0)
                {
                    if (sectorBuff == null)
                    {
                        sectorOff += 1;
                        sectorBuff = randAccFH.Allocate(sectorOff);
                        bitULongPtr = (ulong*)sectorBuff;
                    }
                    while (64 <= count)
                    {
                        *bitULongPtr++ = bitMaskULong;
                        count -= 64;
                    }
                    if (count != 0)
                    {
                        bitMaskULong = ((1UL << unchecked((int)count)) - 1) << (64 - unchecked((int)count));
                        *bitULongPtr = value
                            ? *bitULongPtr | bitMaskULong
                            : *bitULongPtr & ~bitMaskULong;
                    }
                }
                return;
            losing1:
                // n2 is the number of bits to set in the first ulong.
                n2 = 64 - n1;
                if (n2 <= count)
                {
                    // Set bits in first ulong, then proceed to winning1.
                    bitMaskULong = (1UL << unchecked((int)n2)) - 1;
                    *bitULongPtr++ = value
                        ? *bitULongPtr | bitMaskULong
                        : *bitULongPtr & ~bitMaskULong;
                    count -= n2;
                    goto winning1;
                }
                // We only have to edit the first ulong.
                bitMaskULong = unchecked(((1UL << (int)count) - 1) << ((int)n2 - (int)count));
                *bitULongPtr = value
                    ? *bitULongPtr | bitMaskULong
                    : *bitULongPtr & ~bitMaskULong;
            }
            finally
            {
                if (sectorBuff != null)
                {
                    randAccFH.Free(sectorBuff, true);
                }
            }
        }

    }
}