using System;

namespace Com.Jab.Ex.System
{
    public interface IAllocator : IDisposable
    {
        ulong MaxObjectSize { get; }
        ulong Allocate(ulong size);
        void Free(ulong address);
    }
}
