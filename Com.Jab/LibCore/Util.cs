using System;
using System.Reflection;
using System.Threading;

namespace Com.Jab.LibCore
{
    public static class Util
    {
        private static volatile Func<int, string> s_stringAllocateFunc = null;
        
        public static string StringAllocate(int length)
        {
            if (s_stringAllocateFunc != null) return s_stringAllocateFunc(length);
            InitializeStringAllocateFunc();
            return s_stringAllocateFunc(length);
        }

        public static void InitializeStringAllocateFunc()
        {
            var stringAllocateFastMI = typeof(string).GetMethod(
                "FastAllocateString",
                BindingFlags.NonPublic | BindingFlags.Static | BindingFlags.Public | BindingFlags.DeclaredOnly,
                null,
                CallingConventions.Any,
                new Type[] {
                    typeof(int),
                },
                null);
            Func<int, string> stringAllocateFunc;
            if (stringAllocateFastMI != null)
            {
                stringAllocateFunc = (Func<int, string>)stringAllocateFastMI.CreateDelegate(typeof(Func<int, string>));
            }
            else
            {
                stringAllocateFunc = i => new string('\0', i);
            }
            Interlocked.CompareExchange(ref s_stringAllocateFunc, stringAllocateFunc, null);
        }
        
        public unsafe static string StringSetLengthToIndexOfNullChar(string s1)
        {
            fixed (char* s1ChPtr = s1)
            {
                int s1LenCur = ((int*)s1ChPtr)[-1];
                int s1LenReq = WStrNullTerminated_IndexOfNullChar(s1ChPtr, s1LenCur);
                if (s1LenReq <= s1LenCur >> 1)
                {
                    string s2 = StringAllocate(s1LenReq);
                    fixed (char* s2ChPtr = s2)
                    {
                        StringCopy(s1ChPtr, s2ChPtr, s1LenReq);
                    }
                    return s2;
                }
                ((int*)s1ChPtr)[-1] = s1LenReq;
            }
            return s1;
        }

        private unsafe static void StringCopy(char* srcChPtr, char* dstChPtr, int rem)
        {
            if (0 < rem)
            {
                *(uint*)dstChPtr = *(uint*)srcChPtr;
                srcChPtr += 2;
                dstChPtr += 2;
                rem -= 2;
                while (8 <= rem)
                {
                    *(ulong*)dstChPtr = *(ulong*)srcChPtr;
                    *((ulong*)dstChPtr + 1) = *((ulong*)srcChPtr + 1);
                    dstChPtr += 8;
                    srcChPtr += 8;
                    rem -= 8;
                }
                if ((rem & 4) != 0)
                {
                    *(ulong*)dstChPtr = *(ulong*)srcChPtr;
                    dstChPtr += 4;
                    srcChPtr += 4;
                }
                if ((rem & 2) != 0)
                {
                    *(uint*)dstChPtr = *(uint*)srcChPtr;
                    dstChPtr += 2;
                    srcChPtr += 2;
                }
                if ((rem & 1) == 0) return;
            }
            *dstChPtr = *srcChPtr;
        }
        
        private static bool HasZeroChar(uint i)
        {
            return ((i - 0x00010001U) & ~i & 0x80008000) != 0;
        }

        private static bool HasZeroChar(ulong i)
        {
            return ((i - 0x0001000100010001UL) & ~i & 0x8000800080008000UL) != 0;
        }

        private unsafe static int WStrNullTerminated_IndexOfNullChar(char* sChPtr, int sLen)
        {
            if (((long)sChPtr & 3) != 0) throw new ArgumentException();
            int noChRem = sLen;
            if (0 < sLen && !HasZeroChar(*(uint*)sChPtr))
            {
                noChRem -= 2;
                sChPtr += 2;
                while (3 <= noChRem)
                {
                    if (HasZeroChar(*(ulong*)sChPtr))
                    {
                        if (!HasZeroChar(*(uint*)sChPtr))
                        {
                            noChRem -= 2;
                            sChPtr += 2;
                        }
                        goto success;
                    }
                    noChRem -= 4;
                    sChPtr += 4;
                }
                if (1 <= noChRem)
                {
                    if (HasZeroChar(*(ulong*)sChPtr))
                    {
                        goto success;
                    }
                    noChRem -= 2;
                    sChPtr += 2;
                }
            }
            success: return sLen - noChRem + (*sChPtr != 0 ? 1 : 0);
        }
    }
}
