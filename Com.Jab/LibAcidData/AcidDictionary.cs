using Com.Jab.LibWinInterop.IO;
using System;
using System.Collections;
using System.Collections.Generic;

namespace Com.Jab.LibEnterprise.Acid
{
    internal static class Bla2<TKey>
    {
        public unsafe delegate bool AreKeysEqualFunc(byte* entryBuff, TKey key);
    }
    internal static class Bla3<TValue>
    {
        public unsafe delegate TValue GetValueEmbeddedInEntryFunc(byte* entryBuff);
    }
    internal enum AcidDictionaryValueFormat
    {
        EmbeddedInEntry,
        EmbeddedInEntry_Partial,
        EntryPointsToSeparateObject,
    }
    public class AcidDictionary<TKey, TValue> : AcidObject, IDictionary<TKey, TValue>
    {
        public AcidDictionary()
        {
            ComputeFormat();
        }
        
        private ulong ByteOff_FirstEntry
        {
            get
            {
                var v = m_address + Format_ByteOff_FirstEntry;
                if (v < m_address) throw new OverflowException();
                return v;
            }
        }

        private uint Capacity
        {
            get
            {
                throw new NotImplementedException();
            }
        }

        private Bla2<TKey>.AreKeysEqualFunc Format_AreKeysEqualFunc
        {
            get
            {
                throw new NotImplementedException();
            }
        }

        private uint Format_ByteOff_FirstEntry
        {
            get
            {
                throw new NotImplementedException();
            }
        }

        private uint Format_ByteSizeOf_Entry
        {
            get
            {
                throw new NotImplementedException();
            }
        }

        private int Format_EntryByteOff_ValueAddress
        {
            get
            {
                throw new NotImplementedException();
            }
        }

        private int Format_EntryByteOff_NextEntryIndex
        {
            get
            {
                throw new NotImplementedException();
            }
        }

        private Func<ulong, RandomAccessFileHandle64, TValue> Format_GetValueAtAddressFunc
        {
            get
            {
                throw new NotImplementedException();
            }
        }

        private Bla3<TValue>.GetValueEmbeddedInEntryFunc Format_GetValueEmbeddedInEntryFunc
        {
            get
            {
                throw new NotImplementedException();
            }
        }

        private AcidDictionaryValueFormat Format_ValueFormat
        {
            get
            {
                throw new NotImplementedException();
            }
        }
            
        public unsafe TValue this[TKey key]
        {
            get
            {
                uint format_byteSizeOf_entry = Format_ByteSizeOf_Entry;
                if ((format_byteSizeOf_entry & (format_byteSizeOf_entry - 1)) != 0) throw new NotImplementedException();
                uint hc = unchecked((uint)key.GetHashCode());
                uint entryIdx = hc % Capacity;
                var randAccFH = GetRandAccFH();
                ulong byteOff_entry;
                ulong sectorOff_entry;
                byte* sectorBuff = null;
                try
                {
                    while (true)
                    {
                        byteOff_entry = ByteOff_FirstEntry + format_byteSizeOf_entry * entryIdx;
                        sectorOff_entry = byteOff_entry >> randAccFH.SectorSizeLog2;
                        sectorBuff = randAccFH.Allocate(sectorOff_entry);
                        byte* entryBuff = sectorBuff + (byteOff_entry - (sectorOff_entry << randAccFH.SectorSizeLog2));
                        if (Format_AreKeysEqualFunc(entryBuff, key))
                        {
                            if (Format_ValueFormat == AcidDictionaryValueFormat.EmbeddedInEntry)
                            {
                                return Format_GetValueEmbeddedInEntryFunc(entryBuff);
                            }
                            if (Format_ValueFormat == AcidDictionaryValueFormat.EntryPointsToSeparateObject)
                            {
                                ulong valueAddress = *(ulong*)(entryBuff + Format_EntryByteOff_ValueAddress);
                                return Format_GetValueAtAddressFunc(valueAddress, randAccFH);
                            }
                            
                            throw new NotImplementedException();
                        }
                        entryIdx = *(uint*)(entryBuff + Format_EntryByteOff_NextEntryIndex);
                        if (entryIdx == 0)
                        {
                            throw new KeyNotFoundException();
                        }
                        entryIdx -= 1;
                        randAccFH.Free(sectorBuff, false);
                    }
                }
                finally
                {
                    if (sectorBuff != null)
                    {
                        randAccFH.Free(sectorBuff, false);
                    }
                }
            }
            set
            {
                throw new NotImplementedException();
            }
        }

        public int Count
        {
            get
            {
                throw new NotImplementedException();
            }
        }

        public bool IsReadOnly
        {
            get
            {
                throw new NotImplementedException();
            }
        }

        public ICollection<TKey> Keys
        {
            get
            {
                throw new NotImplementedException();
            }
        }

        public ICollection<TValue> Values
        {
            get
            {
                throw new NotImplementedException();
            }
        }

        public void Add(KeyValuePair<TKey, TValue> item)
        {
            throw new NotImplementedException();
        }

        public void Add(TKey key, TValue value)
        {
            throw new NotImplementedException();
        }
        
        public void Clear()
        {
            throw new NotImplementedException();
        }

        private void ComputeFormat()
        {
            // entry size must be smaller than sector size and must be power of two
            throw new NotImplementedException();
        }

        public bool Contains(KeyValuePair<TKey, TValue> item)
        {
            throw new NotImplementedException();
        }

        public bool ContainsKey(TKey key)
        {
            throw new NotImplementedException();
        }

        public void CopyTo(KeyValuePair<TKey, TValue>[] array, int arrayIndex)
        {
            throw new NotImplementedException();
        }

        public IEnumerator<KeyValuePair<TKey, TValue>> GetEnumerator()
        {
            throw new NotImplementedException();
        }

        public bool Remove(KeyValuePair<TKey, TValue> item)
        {
            throw new NotImplementedException();
        }

        public bool Remove(TKey key)
        {
            throw new NotImplementedException();
        }

        public bool TryGetValue(TKey key, out TValue value)
        {
            throw new NotImplementedException();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            throw new NotImplementedException();
        }
    }
}
