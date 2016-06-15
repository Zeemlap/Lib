using Com.Jab.LibCore;
using Com.Jab.LibWinInterop.IO;
using Com.Jab.LibWinInterop.Win32;
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;

namespace Com.Jab.LibEnterprise.Acid
{
    public class FileBuddyAllocator64 : IAllocator
    {
        private const int SectorSize_Default = 4096;

        [StructLayout(LayoutKind.Explicit)]
        private struct Block
        {
            public const uint ByteOff_NextBlock_Offset = 0;
            public const uint ByteOff_PrevBlock_Offset = 8;
            [FieldOffset((int)ByteOff_NextBlock_Offset)]
            public ulong ByteOff_NextBlock;
            [FieldOffset((int)ByteOff_PrevBlock_Offset)]
            public ulong ByteOff_PrevBlock;
        }
        
        private const uint s_header_fixedComponent_sizeOf = 8;
        public const int MaxOrder = 32;

        private const uint header_highestOrder_mask = 0x3F;
        private const uint header_order0SizeOfLog2_mask = 0xFC0;
        private const int header_order0SizeOfLog2_offset = 6;
        private const uint header_maxOrder_mask = 0x3F000;
        private const int header_maxOrder_offset = 12;

        private ulong m_header;
        private ulong m_byteOff_firstBlock;
        private ulong m_byteOff_minValidForFree;
        private ulong m_maxObjectSize;
        private ulong m_bitOff_isFirstBlockSplit;
        private ulong m_bitOff_isFirstBuddyPairFreeFlag;
        internal RandomAccessFileHandle64 RandAccFH;

        protected FileBuddyAllocator64()
        {
        }
        
        public static unsafe FileBuddyAllocator64 OpenOrCreate(string fileName, long byteSizeOf_order0, int maxOrder = int.MaxValue)
        {
            FileHandle fileHandle = null;
            bool ex = true;
            FileBuddyAllocator64 instance = null;
            try
            {
                fileHandle = FileHandle.New(fileName,
                    dwCreationDisposition: FileCreationDisposition.OpenAlways,
                    dwFlagsAndAttributes: FileFlagsAndAttributes.Attribute_Normal | FileFlagsAndAttributes.Flag_RandomAccess);
                int sectorSize = Win32Util.GetPhysicalSectorSize(fileHandle.Handle);
                if (sectorSize < 0) sectorSize = 4096;
                instance = new FileBuddyAllocator64();
                instance.RandAccFH = new RandomAccessFileHandle64(sectorSize, fileHandle);
                bool alreadyExists = Marshal.GetLastWin32Error() == unchecked((int)Win32Constants.ErrorAlreadyExists);
                if (alreadyExists)
                {
                    byte[] buffer = new byte[SectorSize_Default];
                    fixed (byte* bufferPtr = buffer)
                    {
                        fileHandle.Read(bufferPtr, 0, SectorSize_Default);
                        instance.m_header = *(ulong*)bufferPtr;
                    }
                    if ((1L << instance.ByteSizeOf_Order0SizeOfLog2) != byteSizeOf_order0) throw new ArgumentException();
                }
                else
                {
                    int byteSizeOf_order0Log2 = byteSizeOf_order0.Log2Floor();
                    if ((1L << byteSizeOf_order0Log2) != byteSizeOf_order0 || MaxOrder < byteSizeOf_order0Log2) throw new ArgumentOutOfRangeException();
                    maxOrder = Math.Min(maxOrder, MaxOrder - byteSizeOf_order0Log2);
                    if (maxOrder < 0) throw new ArgumentOutOfRangeException();
                    instance.ByteSizeOf_Order0SizeOfLog2 = byteSizeOf_order0Log2;
                    instance.m_maxOrder = maxOrder;
                }
                instance.Initialize();
                if (!alreadyExists)
                {
                    instance.InitializeFile();
                }
                ex = false;
                return instance;
            }
            finally
            {
                if (ex)
                {
                    if (instance != null && instance.RandAccFH != null) instance.RandAccFH.Dispose();
                    else if (fileHandle != null) fileHandle.Dispose();
                }
            }
        }
        
        private ulong ByteOff_FirstBlock
        {
            get
            {
                return m_byteOff_firstBlock;
            }
        }

        private unsafe int HighestOrder
        {
            get
            {
                return (int)(m_header & header_highestOrder_mask);
            }
            set
            {
                if (value < 0 || header_highestOrder_mask < value) throw new ArgumentOutOfRangeException();
                m_header = (m_header & ~header_highestOrder_mask) | (uint)value;
            }
        }

        private unsafe int ByteSizeOf_Order0SizeOfLog2
        {
            get
            {
                return (int)((m_header & header_order0SizeOfLog2_mask) >> header_order0SizeOfLog2_offset);
            }
            set
            {
                if (value < 0 || (header_order0SizeOfLog2_mask >> header_order0SizeOfLog2_offset) < value)
                {
                    throw new ArgumentOutOfRangeException();
                }
                m_header = (m_header & ~header_order0SizeOfLog2_mask) | (uint)(value << header_order0SizeOfLog2_offset);
            }
        }

        private unsafe int m_maxOrder
        {
            get
            {
                return (int)((m_header & header_maxOrder_mask) >> header_maxOrder_offset);
            }
            set
            {
                if (value < 0 || (header_maxOrder_mask >> header_maxOrder_offset) < value)
                {
                    throw new ArgumentOutOfRangeException();
                }
                m_header = (m_header & ~header_maxOrder_mask) | (uint)(value << header_maxOrder_offset);
            }
        }

        public ulong MaxObjectSize
        {
            get
            {
                return m_maxObjectSize;
            }
        }

        private int ULongSizeOf_AreBlocksSplit
        {
            get
            {
                long i1 = (1L << m_maxOrder) - 1;
                int i2 = (int)((i1 + 7) >> 3);
                int i3 = (i2 + 7) >> 3;
                return i3;
            }
        }

        private int ULongSizeOf_AreBuddyPairsFreeFlags
        {
            get
            {
                long i1 = 1L << m_maxOrder;
                int i2 = (int)((i1 + 7) >> 3);
                int i3 = (i2 + 7) >> 3;
                return i3;
            }
        }

        public unsafe ulong Allocate(ulong size)
        {
            if (size == 0 || MaxObjectSize < size) throw new ArgumentOutOfRangeException();
            int sizeLog2Ceil = size.Log2Floor() + ((size & (size - 1)) != 0 ? 1 : 0);
            int sizeOrder = Math.Max(0, sizeLog2Ceil - ByteSizeOf_Order0SizeOfLog2);
            // order is in interval [0-m_maxOrder]
            ulong byteOff_block1;
            ulong byteOff_block2;
            if (HighestOrder < sizeOrder || (byteOff_block1 = GetFirstFreeBlockByteOff(sizeOrder)) == 0) goto losing1;
            winning1:
            byteOff_block2 = RandAccFH.GetUInt64(byteOff_block1 + Block.ByteOff_NextBlock_Offset);
            if (byteOff_block2 != 0)
            {
                RandAccFH.SetInt64(byteOff_block2 + Block.ByteOff_PrevBlock_Offset, 0);
            }
            SetFirstFreeBlockByteOff(unchecked((uint)sizeOrder), byteOff_block2);
            ChangeIsBuddyPairFreeFlag(GetBuddyPairIndex(GetBlockIndex(byteOff_block1, sizeOrder)), BitChangeType.Toggle);
            return byteOff_block1;
            losing1:
            int order = sizeOrder;
            while (++order <= HighestOrder)
            {
                if (GetFirstFreeBlockByteOff(order) != 0) goto winning2;
            }
            goto losing2;
            winning2:
            byte* sectorBuff = null;
            try
            {
                do
                {
                    byteOff_block1 = GetFirstFreeBlockByteOff(order);
                    ulong sectorOff_block = byteOff_block1 >> RandAccFH.SectorSizeLog2;
                    sectorBuff = RandAccFH.Allocate(sectorOff_block);
                    Block* sectorBuff_block = (Block*)(sectorBuff + (byteOff_block1 - (sectorOff_block << RandAccFH.SectorSizeLog2)));
                    var blockIndex = GetBlockIndex(byteOff_block1, order);
                    SetIsBlockSplit(blockIndex, true);
                    uint buddyPairIndex = GetBuddyPairIndex(blockIndex);
                    ChangeIsBuddyPairFreeFlag(buddyPairIndex, BitChangeType.Toggle);
                    byteOff_block2 = sectorBuff_block->ByteOff_NextBlock;
                    SetFirstFreeBlockByteOff(unchecked((uint)order), byteOff_block2);
                    if (byteOff_block2 != 0)
                    {
                        RandAccFH.SetInt64(byteOff_block2 + Block.ByteOff_PrevBlock_Offset, 0);
                    }
                    byteOff_block2 = byteOff_block1 + (1UL << (order - 1 + ByteSizeOf_Order0SizeOfLog2));
                    sectorBuff_block->ByteOff_NextBlock = byteOff_block2;
                    RandAccFH.Free(sectorBuff, true);
                    sectorBuff = null;

                    sectorOff_block = byteOff_block2 >> RandAccFH.SectorSizeLog2;
                    sectorBuff = RandAccFH.Allocate(sectorOff_block);
                    sectorBuff_block = (Block*)(sectorBuff + (byteOff_block2 - (sectorOff_block << RandAccFH.SectorSizeLog2)));
                    sectorBuff_block->ByteOff_NextBlock = 0;
                    sectorBuff_block->ByteOff_PrevBlock = byteOff_block1;
                    RandAccFH.Free(sectorBuff, true);
                    sectorBuff = null;

                    Debug.Assert(GetFirstFreeBlockByteOff(order - 1) == 0);
                    SetFirstFreeBlockByteOff(unchecked((uint)(order - 1)), byteOff_block1);
                } while (sizeOrder < --order);
            }
            finally
            {
                if (sectorBuff != null)
                {
                    RandAccFH.Free(sectorBuff, true);
                }
            }
            byteOff_block1 = GetFirstFreeBlockByteOff(sizeOrder);
            goto winning1;
            losing2:
            if (order <= m_maxOrder)
            {
                GrowHighestOrder(order);
                if ((byteOff_block1 = GetFirstFreeBlockByteOff(sizeOrder)) != 0) goto winning1;
                order -= 1;
                goto winning2;
            }
            return 0;
        }
        
        private unsafe bool ChangeIsBuddyPairFreeFlag(uint flagIndex, BitChangeType op)
        {
            return RandAccFH.ChangeBit(
                checked(m_bitOff_isFirstBuddyPairFreeFlag + flagIndex),
                op);
        }
        
        public unsafe void Dispose()
        {
            RandAccFH.Dispose();
        }

        private unsafe void FlushHeader()
        {
            byte* sectorBuff = null;
            try
            {
                sectorBuff = RandAccFH.Allocate(0);
                *(ulong*)sectorBuff = m_header;
            }
            finally
            {
                if (sectorBuff != null)
                {
                    RandAccFH.Free(sectorBuff, true);
                }
            }
        }

        public unsafe void Free(ulong byteOff_block1)
        {
            int order;
            if (m_byteOff_minValidForFree <= byteOff_block1
                && 0 <= (order = GetBlockOrder(byteOff_block1)))
            {
                byte* sectorBuffer = null;
                try
                {
                    ulong sectorOff_block = byteOff_block1 >> RandAccFH.SectorSizeLog2;
                    sectorBuffer = RandAccFH.Allocate(sectorOff_block);
                    Block* sectorBuffer_block = (Block*)(sectorBuffer + (byteOff_block1 - (sectorOff_block << RandAccFH.SectorSizeLog2)));
                    ulong byteOff_block2 = sectorBuffer_block->ByteOff_NextBlock = GetFirstFreeBlockByteOff(order);
                    sectorBuffer_block->ByteOff_PrevBlock = 0;
                    RandAccFH.Free(sectorBuffer, true);
                    sectorBuffer = null;
                    SetFirstFreeBlockByteOff(unchecked((uint)order), byteOff_block1);
                    if (byteOff_block2 != 0)
                    {
                        RandAccFH.SetUInt64(byteOff_block2 + Block.ByteOff_PrevBlock_Offset, byteOff_block1);
                    }
                    uint blockIndex = GetBlockIndex(byteOff_block1, order);

                    bool isBuddyNotFree;
                    while (order < m_maxOrder && !(isBuddyNotFree = ChangeIsBuddyPairFreeFlag(GetBuddyPairIndex(blockIndex), BitChangeType.Toggle)))
                    {
                        ulong byteSizeOf_block = 1UL << (order + ByteSizeOf_Order0SizeOfLog2);
                        ulong byteOff_blockBuddyLeftBlock = ((byteOff_block1 - ByteOff_FirstBlock) & ~byteSizeOf_block) + ByteOff_FirstBlock;
                        ulong byteOff_blockBuddyRightBlock = ((byteOff_block1 - ByteOff_FirstBlock) | byteSizeOf_block) + ByteOff_FirstBlock;
                        RemoveFromFreeList(byteOff_blockBuddyLeftBlock, order);
                        RemoveFromFreeList(byteOff_blockBuddyRightBlock, order);
                        order += 1;

                        byteOff_block1 = byteOff_blockBuddyLeftBlock;
                        sectorOff_block = byteOff_block1 >> RandAccFH.SectorSizeLog2;
                        sectorBuffer = RandAccFH.Allocate(sectorOff_block);
                        sectorBuffer_block = (Block*)(sectorBuffer + (byteOff_block1 - (sectorOff_block << RandAccFH.SectorSizeLog2)));
                        sectorBuffer_block->ByteOff_PrevBlock = 0;
                        sectorBuffer_block->ByteOff_NextBlock = GetFirstFreeBlockByteOff(order);
                        RandAccFH.Free(sectorBuffer, true);
                        sectorBuffer = null;

                        SetFirstFreeBlockByteOff(unchecked((uint)order), byteOff_block1);
                        blockIndex = GetBlockIndex(byteOff_block1, order);
                        SetIsBlockSplit(blockIndex, false);
                    }
                }
                finally
                {
                    if (sectorBuffer != null)
                    {
                        RandAccFH.Free(sectorBuffer, true);
                    }
                }
                return;
            }
            throw new ArgumentOutOfRangeException();
        }

        // -1 if order = m_maxOrder
        // This occurs if blockPtr is the largest possible block.
        private uint GetBlockIndex(ulong byteOff_block, int order)
        {
            ulong blockIndexWithinOrder = (byteOff_block - ByteOff_FirstBlock) >> (order + ByteSizeOf_Order0SizeOfLog2);
            return unchecked((uint)(blockIndexWithinOrder + ((1UL << (m_maxOrder - order)) - 1)));
        }

        // -1 if foBlock is invalid.
        private int GetBlockOrder(ulong byteOff_block)
        {
            if (((byteOff_block - ByteOff_FirstBlock) & ((1UL << ByteSizeOf_Order0SizeOfLog2) - 1)) == 0)
            {
                for (int i = 1; i <= m_maxOrder; i++)
                {
                    if (GetIsBlockSplit(GetBlockIndex(byteOff_block, i)))
                    {
                        return i - 1;
                    }
                }
                return m_maxOrder;
            }
            return -1;
        }

        private static uint GetBuddyPairIndex(uint blockIndex)
        {
            if (blockIndex != 0)
            {
                uint indexOfLeftBlockInBuddyPair = blockIndex - 1 + (blockIndex & 1);
                return (indexOfLeftBlockInBuddyPair - 1) / 2 + 1;
                // We add one additional element to the m_isBuddyPairFreeFlags array 
                // so that GetBuddyBlockPairIndex works for order m_maxOrder, hence the + 1.
            }
            return 0;
        }

        private unsafe ulong GetFirstFreeBlockByteOff(int index)
        {
            return RandAccFH.GetUInt64(s_header_fixedComponent_sizeOf + ((ulong)index << 3));
        }

        private unsafe bool GetIsBlockSplit(uint index)
        {
            return RandAccFH.GetBit(m_bitOff_isFirstBlockSplit + index);
        }

        private unsafe void GrowHighestOrder(int highestOrder_new)
        {
            Debug.Assert(HighestOrder < highestOrder_new);
            Debug.Assert(highestOrder_new <= m_maxOrder);
            byte* sectorBuff = null;
            try
            {
                UpdateFileSize(highestOrder_new);
                do
                {
                    ulong byteOff_block = ByteOff_FirstBlock + (1UL << (HighestOrder + ByteSizeOf_Order0SizeOfLog2));
                    ulong sectorOff_block = byteOff_block >> RandAccFH.SectorSizeLog2;
                    sectorBuff = RandAccFH.Allocate(sectorOff_block);
                    Block* sectorBuff_block = (Block*)(sectorBuff + (byteOff_block - (sectorOff_block << RandAccFH.SectorSizeLog2)));
                    sectorBuff_block->ByteOff_NextBlock = 0;
                    sectorBuff_block->ByteOff_PrevBlock = 0;
                    RandAccFH.Free(sectorBuff, true);
                    sectorBuff = null;
                    SetFirstFreeBlockByteOff(unchecked((uint)HighestOrder), byteOff_block);
                } while (++HighestOrder < highestOrder_new);
                FlushHeader();
            }
            finally
            {
                if (sectorBuff != null)
                {
                    RandAccFH.Free(sectorBuff, true);
                }
            }
        }

        private unsafe void Initialize()
        {
            int maxOrder = m_maxOrder;
            int order0SizeOfLog2 = ByteSizeOf_Order0SizeOfLog2;
            m_byteOff_firstBlock = s_header_fixedComponent_sizeOf + (unchecked((uint)maxOrder) + 1UL) << 3;
            if ((m_byteOff_firstBlock & 0xF) != 0)
            {
                m_byteOff_firstBlock = (m_byteOff_firstBlock & ~0xFUL) + 0x10;
            }
            int uLongSizeOf_areBlocksSplit = ULongSizeOf_AreBlocksSplit;
            m_bitOff_isFirstBlockSplit = m_byteOff_firstBlock << 3;
            m_bitOff_isFirstBuddyPairFreeFlag = (m_byteOff_firstBlock + (unchecked((uint)uLongSizeOf_areBlocksSplit) << 3)) << 3;
            m_maxObjectSize = 1UL << (maxOrder + order0SizeOfLog2);
            
            uint byteSizeOf_bitArrays = unchecked((uint)((uLongSizeOf_areBlocksSplit + ULongSizeOf_AreBuddyPairsFreeFlags))) << 3;
            ulong byteSizeOf_leaf = 1UL << order0SizeOfLog2;
            m_byteOff_minValidForFree = m_byteOff_firstBlock + (byteSizeOf_bitArrays + (byteSizeOf_leaf - 1)) / byteSizeOf_leaf * byteSizeOf_leaf;
        }

        private unsafe void InitializeFile()
        {
            uint byteSizeOf_bitArrays = unchecked((uint)((ULongSizeOf_AreBlocksSplit + ULongSizeOf_AreBuddyPairsFreeFlags))) << 3;
            ulong byteSizeOf_leaf = 1UL << ByteSizeOf_Order0SizeOfLog2;
            int noLeaves = (int)((byteSizeOf_bitArrays + (byteSizeOf_leaf - 1)) / byteSizeOf_leaf);
            int noLeaves_log2Ceil = noLeaves.Log2Floor() + ((noLeaves & (noLeaves - 1)) != 0 ? 1 : 0);
            HighestOrder = noLeaves_log2Ceil;
            UpdateFileSize(noLeaves_log2Ceil);
            RandAccFH.SetBitRange(checked(ByteOff_FirstBlock << 3), (ulong)byteSizeOf_bitArrays << 3, false);
            uint noBlocks = unchecked((uint)noLeaves);
            ulong blockSizeOf = byteSizeOf_leaf;
            int order = 0;
            while (true)
            {
                if ((noBlocks & 1) != 0)
                {
                    ChangeIsBuddyPairFreeFlag(
                        GetBuddyPairIndex(
                            GetBlockIndex(
                                ByteOff_FirstBlock + (noBlocks - 1) * blockSizeOf,
                                order)),
                        BitChangeType.Set);
                }
                if (noBlocks.IsPowerOfTwo())
                {
                    SetFirstFreeBlockByteOff(unchecked((uint)order), 0);
                }
                else
                {
                    SetFirstFreeBlockByteOff(unchecked((uint)order), ByteOff_FirstBlock + blockSizeOf * noBlocks);
                }
                if (0 < order)
                {
                    SetAreBlocksSplit((1UL << (m_maxOrder - order)) - 1, noBlocks, true);
                }
                if (noBlocks == 1)
                {
                    break;
                }
                noBlocks = (noBlocks + 1) >> 1;
                blockSizeOf <<= 1;
                order += 1;
            }
            while (++order <= m_maxOrder)
            {
                uint blockIndex = GetBlockIndex(ByteOff_FirstBlock, order);
                ChangeIsBuddyPairFreeFlag(GetBuddyPairIndex(blockIndex), BitChangeType.Set);
                SetIsBlockSplit(blockIndex, true);
            }
            FlushHeader();
        }
        
        private unsafe void RemoveFromFreeList(ulong byteOff_block, int order)
        {
            ulong sectorOff_block = byteOff_block >> RandAccFH.SectorSizeLog2;
            byte* sectorBuff = null;
            try
            {
                sectorBuff = RandAccFH.Allocate(sectorOff_block);
                Block* sectorBuff_block = (Block*)(sectorBuff + (byteOff_block - (sectorOff_block << RandAccFH.SectorSizeLog2)));
                if (sectorBuff_block->ByteOff_PrevBlock != 0)
                {
                    RandAccFH.SetUInt64(sectorBuff_block->ByteOff_PrevBlock + Block.ByteOff_NextBlock_Offset, sectorBuff_block->ByteOff_NextBlock);
                }
                else
                {
                    SetFirstFreeBlockByteOff(unchecked((uint)order), sectorBuff_block->ByteOff_NextBlock);
                }
                if (sectorBuff_block->ByteOff_NextBlock != 0)
                {
                    RandAccFH.SetUInt64(sectorBuff_block->ByteOff_NextBlock + Block.ByteOff_PrevBlock_Offset, sectorBuff_block->ByteOff_PrevBlock);
                }
            }
            finally
            {
                if (sectorBuff != null)
                {
                    RandAccFH.Free(sectorBuff, false);
                }
            }
        }

        private unsafe void SetAreBlocksSplit(ulong index, uint count, bool value)
        {
            RandAccFH.SetBitRange(checked(m_bitOff_isFirstBlockSplit + index), count, value);
        }

        private unsafe void SetFirstFreeBlockByteOff(uint index, ulong value)
        {
            RandAccFH.SetUInt64(s_header_fixedComponent_sizeOf + ((ulong)index << 3), value);
        }

        private unsafe void SetIsBlockSplit(uint index, bool value)
        {
            RandAccFH.ChangeBit(checked(m_bitOff_isFirstBlockSplit + index), value ? BitChangeType.Set : BitChangeType.Clear);
        }
        
        private void UpdateFileSize(int order)
        {
            var leafSize = 1UL << ByteSizeOf_Order0SizeOfLog2;
            var fileSize = (1UL << order) * leafSize + ByteOff_FirstBlock;
            var sectorSize = 1U << RandAccFH.SectorSizeLog2;
            fileSize = (fileSize + (sectorSize - 1)) / sectorSize * sectorSize;
            RandAccFH.Handle.SetFilePointer(checked((long)fileSize), FilePointerMoveMethod.Begin);
            RandAccFH.Handle.SetEndOfFile();
        }
    }
}
