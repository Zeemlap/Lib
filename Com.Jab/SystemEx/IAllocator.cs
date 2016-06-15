using System;

namespace Com.Jab.SystemEx
{
    public interface IAllocator : IDisposable
    {
        ulong MaxObjectSize { get; }
        ulong Allocate(ulong size);
        void Free(ulong address);
    }
}
