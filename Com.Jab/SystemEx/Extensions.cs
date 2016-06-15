using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Configuration;
using System.Globalization;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Com.Jab.SystemEx
{
    public static class Extensions
    {   
        #region System.[U]Int(64|32)

        public unsafe static int CountOneBits(this int i)
        {
            return CountOneBits(*(uint*)&i);
        }

        public unsafe static int CountOneBits(this long i)
        {
            return CountOneBits(*(ulong*)&i);
        }

        public static int CountOneBits(this uint i)
        {
            i = i - ((i >> 1) & 0x55555555);                    // reuse input as temporary
            i = unchecked((i & 0x33333333) + ((i >> 2) & 0x33333333));     // temp
            return unchecked((int)(((i + (i >> 4) & 0xF0F0F0F) * 0x1010101) >> 24)); // count
        }

        public static int CountOneBits(this ulong i)
        {
            return CountOneBits(unchecked((uint)(i >> 32))) + CountOneBits(unchecked((uint)i));
        }

        public static bool IsPowerOfTwo(this int i)
        {
            return 0 < i && (i & (i - 1)) == 0;
        }

        public static bool IsPowerOfTwo(this long i)
        {
            return 0 < i && (i & (i - 1)) == 0;
        }

        public static bool IsPowerOfTwo(this uint i)
        {
            return 0 < i && (i & (i - 1)) == 0;
        }

        public static bool IsPowerOfTwo(this ulong i)
        {
            return 0 < i && (i & (i - 1)) == 0;
        }

        public static int Log2Ceil(this int v)
        {
            if (v <= 0) throw new ArgumentOutOfRangeException();
            return ((uint)v).Log2Ceil();
        }

        public static int Log2Ceil(this long v)
        {
            if (v <= 0) throw new ArgumentOutOfRangeException();
            return ((ulong)v).Log2Ceil();
        }

        public static int Log2Ceil(this uint v)
        {
            int i;
            if (v == 0) throw new ArgumentOutOfRangeException();
            i = 32 - v.Lzc() - 1;
            return i + ((1U << i) < v ? 1 : 0);
        }

        public static int Log2Ceil(this ulong v)
        {
            int i;
            if (v == 0) throw new ArgumentOutOfRangeException();
            i = 64 - v.Lzc() - 1;
            return i + ((1UL << i) < v ? 1 : 0);
        }

        public static int Log2Floor(this int v)
        {
            if (v <= 0) throw new ArgumentOutOfRangeException();
            return ((uint)v).Log2Floor();
        }

        public static int Log2Floor(this long v)
        {
            if (v <= 0) throw new ArgumentOutOfRangeException();
            return ((ulong)v).Log2Floor();
        }

        public static int Log2Floor(this uint v)
        {
            if (v == 0) throw new ArgumentOutOfRangeException();
            return 32 - v.Lzc() - 1;
        }

        public static int Log2Floor(this ulong v)
        {
            if (v == 0) throw new ArgumentOutOfRangeException();
            return 64 - v.Lzc() - 1;
        }

        public unsafe static int Lzc(this int i)
        {
            return Lzc(*(uint*)&i);
        }

        public unsafe static int Lzc(this long i)
        {
            return Lzc(*(ulong*)&i);
        }

        public static int Lzc(this uint i)
        {
            if (i == 0) return 32;
            int r = 0;
            if ((i & 0xFFFF0000) == 0)
            {
                r += 16;
                i <<= 16;
            }
            if ((i & 0xFF000000) == 0)
            {
                r += 8;
                i <<= 8;
            }
            if ((i & 0xF0000000) == 0)
            {
                r += 4;
                i <<= 4;
            }
            if ((i & 0xC0000000) == 0)
            {
                r += 2;
                i <<= 2;
            }
            if ((i & 0x80000000) == 0)
            {
                return r + 1;
            }
            return r;
        }

        public static int Lzc(this ulong i)
        {
            if ((i & 0xFFFFFFFF00000000) == 0)
            {
                return 32 + Lzc(unchecked((uint)i));
            }
            return Lzc(unchecked((uint)(i >> 32)));
        }

        #endregion

        #region Char|String[Builder]

        public static StringBuilder Append(this StringBuilder sb, int cp)
        {
            if (Com.Jab.SystemEx.Unicode.CodePoint.MaxValue < unchecked((uint)cp)) throw new ArgumentOutOfRangeException();
            if (cp <= char.MaxValue)
            {
                return sb.Append(unchecked((char)cp));
            }
            cp -= 0x10000;
            return sb
                .Append(unchecked((char)((cp >> 10) + 0xD800)))
                .Append(unchecked((char)((cp & 0x3FF) + 0xDC00)));
        }

        public static unsafe int CodePoint(this string s, int i)
        {
            fixed (char* sFirstChPtr = s)
            {
                int cu1, cu2;
                cu1 = sFirstChPtr[i];
                if (0xDFFF - 0xD800 < unchecked((uint)(cu1 - 0xD800))) return cu1;
                if (cu1 < 0xDC00)
                {
                    cu2 = sFirstChPtr[i + 1];
                    if (0xDFFF - 0xDC00 < unchecked((uint)(cu2 - 0xDC00))) return cu1;
                    return CodePointMake(cu1, cu2);
                }
                if (i == 0 || 0xDC00 - 0xD800 <= unchecked((uint)((cu2 = s[i - 1]) - 0xD800))) return cu1;
                return CodePointMake(cu2, cu1);
            }
        }

        public static int CodePoint(this StringBuilder sb, int i)
        {
            int cu1, cu2;
            cu1 = sb[i];
            if (0xDFFF - 0xD800 < unchecked((uint)(cu1 - 0xD800))) return cu1;
            if (cu1 < 0xDC00)
            {
                if (i + 1 == sb.Length || 0xDFFF - 0xDC00 < unchecked((uint)((cu2 = sb[i + 1]) - 0xDC00))) return cu1;
                return CodePointMake(cu1, cu2);
            }
            if (i == 0 || 0xDC00 - 0xD800 <= unchecked((uint)((cu2 = sb[i - 1]) - 0xD800))) return cu1;
            return CodePointMake(cu2, cu1);
        }

        private static int CodePointMake(int cu1, int cu2)
        {
            return ((cu1 - 0xD800) << 10) + (cu2 - 0xDC00) + 0x10000;
        }

        public static IEnumerable<int> CodePoints(this string s, int start = 0)
        {
            return CodePoints(s, start, s.Length);
        }

        public static IEnumerable<int> CodePoints(this string s, int start, int end)
        {
            int sLen = s.Length;
            if (start < 0
                || end < start
                || sLen < end)
            {
                throw new ArgumentOutOfRangeException();
            }
            int cu1, cu2;
            for (int i = start; i < end;)
            {
                cu1 = s[i];
                if (0xDC00 - 0xD800 <= unchecked((uint)(cu1 - 0xD800))
                    || i + 1 == end
                    || 0xDFFF - 0xDC00 < unchecked((uint)((cu2 = s[i + 1]) - 0xDC00)))
                {
                    yield return cu1;
                    i += 1;
                }
                else
                {
                    yield return CodePointMake(cu1, cu2);
                    i += 2;
                }
            }
        }

        public static IEnumerable<int> CodePoints(this StringBuilder sb, int start = 0)
        {
            return sb.CodePoints(start, sb.Length);
        }

        public static IEnumerable<int> CodePoints(this StringBuilder sb, int start, int end)
        {

            int sbLen = sb.Length;
            if (start < 0
                || end < start
                || sbLen < end)
            {
                throw new ArgumentOutOfRangeException();
            }
            int cu1, cu2;
            for (int i = start; i < end;)
            {
                cu1 = sb[i];
                if (0xDC00 - 0xD800 <= unchecked((uint)(cu1 - 0xD800))
                    || i + 1 == end
                    || 0xDFFF - 0xDC00 < unchecked((uint)((cu2 = sb[i + 1]) - 0xDC00)))
                {
                    yield return cu1;
                    i += 1;
                }
                else
                {
                    yield return CodePointMake(cu1, cu2);
                    i += 2;
                }
            }
        }

        public static IEnumerable<int> CodePointsReverse(this string s, int start = 0)
        {
            return CodePointsReverse(s, start, s.Length);
        }

        public static IEnumerable<int> CodePointsReverse(this string s, int start, int end)
        {
            int sLen = s.Length;
            if (start < 0
                || end < start
                || sLen < end)
            {
                throw new ArgumentOutOfRangeException();
            }
            int cu1, cu2;
            for (int i = end; start <= --i;)
            {
                cu2 = s[i];
                if (0xDC00 <= cu2
                    && cu2 <= 0xDFFF
                    && start <= i - 1
                    && 0xD800 <= (cu1 = s[i - 1])
                    && cu1 < 0xDC00)
                {
                    i -= 1;
                    yield return CodePointMake(cu1, cu2);
                }
                else
                {
                    yield return cu2;
                }
            }
        }

        public static IEnumerable<int> CodePointsReverse(this StringBuilder sb, int start = 0)
        {
            return sb.CodePointsReverse(start, sb.Length);
        }

        public static IEnumerable<int> CodePointsReverse(this StringBuilder sb, int start, int end)
        {
            int sLen = sb.Length;
            if (start < 0
                || sLen < start
                || end < start
                || sLen < end)
            {
                throw new ArgumentOutOfRangeException();
            }
            int cu1, cu2;
            for (int i = end; start <= --i;)
            {
                cu2 = sb[i];
                if (0xDC00 <= cu2
                    && cu2 <= 0xDFFF
                    && start <= i - 1
                    && 0xD800 <= (cu1 = sb[i - 1])
                    && cu1 < 0xDC00)
                {
                    i -= 1;
                    yield return CodePointMake(cu1, cu2);
                }
                else
                {
                    yield return cu2;
                }
            }
        }

        public static UnicodeCategory GetCategory(this char ch)
        {
            return Com.Jab.SystemEx.Unicode.CodePoint.GetCategoryInternal(ch);
        }

        public static int GetHexDigitValue(this char ch)
        {
            return Com.Jab.SystemEx.Unicode.CodePoint.GetHexDigitValueInternal(ch);
        }

        public static bool IsAsciiAlphanumeric(this char ch)
        {
            return Com.Jab.SystemEx.Unicode.CodePoint.IsAsciiAlphanumericInternal(ch);
        }

        public static bool IsLetter(this char ch)
        {
            return Com.Jab.SystemEx.Unicode.CodePoint.IsLetterInternal(ch);
        }

        public static bool IsNonCharacter(this char ch)
        {
            return Com.Jab.SystemEx.Unicode.CodePoint.IsNonCharacterInternal(ch);
        }

        public static bool IsWhiteSpace(this char ch)
        {
            return Com.Jab.SystemEx.Unicode.CodePoint.IsWhiteSpaceInternal(ch);
        }

        public static bool IsWhiteSpace(this string s)
        {
            return !s.CodePoints().Any(cp => !Com.Jab.SystemEx.Unicode.CodePoint.IsWhiteSpaceInternal(cp));
        }

        public unsafe static int TrimStartWhile(this string s, int start, int end, Func<int, bool> pred)
        {
            if (pred == null) throw new ArgumentNullException();
            foreach(var cp in s.CodePoints(start, end))
            {
                if (!pred(cp)) break;
                start += 1;
            }
            return start;
        }

        public static int TrimEndWhile(this string s, int start, int end, Func<int, bool> pred)
        {
            if (pred == null) throw new ArgumentNullException();
            foreach(var cp in s.CodePointsReverse(start, end))
            {
                if (!pred(cp)) break;
                end -= 1;
            }
            return end;
        }

        #endregion

        #region DateTime

        public static DateTime Truncate(this DateTime dt, TimePointPrecision precision)
        {
            long dtTicksMod;
            switch (precision)
            {
                case TimePointPrecision.Zero:
                    return new DateTime(DateTime.MinValue.Ticks, dt.Kind);
                case TimePointPrecision.Year:
                    return new DateTime(dt.Year, 1, 1, 0, 0, 0, dt.Kind);
                case TimePointPrecision.Month:
                    return new DateTime(dt.Year, dt.Month, 1, 0, 0, 0, dt.Kind);
                case TimePointPrecision.DayOfMonth:
                    dtTicksMod = TimeSpan.TicksPerDay;
                    break;
                case TimePointPrecision.Hour:
                    dtTicksMod = TimeSpan.TicksPerHour;
                    break;
                case TimePointPrecision.Minute:
                    dtTicksMod = TimeSpan.TicksPerMinute;
                    break;
                case TimePointPrecision.Second:
                    dtTicksMod = TimeSpan.TicksPerSecond;
                    break;
                default:
                    throw new ArgumentOutOfRangeException();
            }
            return new DateTime(dt.Ticks - dt.Ticks % dtTicksMod, dt.Kind);
        }

        #endregion

        #region System.Type

        public static bool IsInstanceOfType_Null(this Type type, object value)
        {
            if (type.IsInstanceOfType(value)) return true;
            return value == null 
                && type.IsValueType 
                && type.IsNullableType_Instantiated();
        }
        
        public static bool IsNullableType_Instantiated(this Type type)
        {
            return type.IsValueType 
                && type.IsGenericType 
                && !type.IsGenericTypeDefinition 
                && type.GetGenericTypeDefinition() == typeof(Nullable<>);
        }


        #endregion

        #region TPL

        public struct CultureAwaiter : ICriticalNotifyCompletion, INotifyCompletion
        {
            private readonly Task m_task;

            public bool IsCompleted
            {
                get
                {
                    return m_task.IsCompleted;
                }
            }

            public CultureAwaiter(Task task)
            {
                m_task = task;
            }

            public CultureAwaiter GetAwaiter()
            {
                return this;
            }

            public void GetResult()
            {
                m_task.GetAwaiter().GetResult();
            }

            public void OnCompleted(Action continuation)
            {
                throw new NotImplementedException();
            }

            public void UnsafeOnCompleted(Action continuation)
            {
                var currentCulture1 = Thread.CurrentThread.CurrentCulture;
                var currentUICulture1 = Thread.CurrentThread.CurrentUICulture;
                m_task.ConfigureAwait(false).GetAwaiter().UnsafeOnCompleted(delegate
                {
                    var currentCulture2 = Thread.CurrentThread.CurrentCulture;
                    var currentUICulture2 = Thread.CurrentThread.CurrentUICulture;
                    Thread.CurrentThread.CurrentCulture = currentCulture1;
                    Thread.CurrentThread.CurrentUICulture = currentUICulture1;
                    try
                    {
                        continuation();
                    }
                    finally
                    {
                        Thread.CurrentThread.CurrentCulture = currentCulture2;
                        Thread.CurrentThread.CurrentUICulture = currentUICulture2;
                    }
                });
            }
        }

        public struct CultureAwaiter<T> : ICriticalNotifyCompletion, INotifyCompletion
        {
            private readonly Task<T> m_task;

            public bool IsCompleted
            {
                get
                {
                    return m_task.IsCompleted;
                }
            }

            public CultureAwaiter(Task<T> task)
            {
                m_task = task;
            }

            public CultureAwaiter<T> GetAwaiter()
            {
                return this;
            }

            public T GetResult()
            {
                return m_task.GetAwaiter().GetResult();
            }

            public void OnCompleted(Action continuation)
            {
                throw new NotImplementedException();
            }

            public void UnsafeOnCompleted(Action continuation)
            {
                var currentCulture1 = Thread.CurrentThread.CurrentCulture;
                var currentUICulture1 = Thread.CurrentThread.CurrentUICulture;
                m_task.ConfigureAwait(false).GetAwaiter().UnsafeOnCompleted(delegate
                {
                    var currentCulture2 = Thread.CurrentThread.CurrentCulture;
                    var currentUICulture2 = Thread.CurrentThread.CurrentUICulture;
                    Thread.CurrentThread.CurrentCulture = currentCulture1;
                    Thread.CurrentThread.CurrentUICulture = currentUICulture1;
                    try
                    {
                        continuation();
                    }
                    finally
                    {
                        Thread.CurrentThread.CurrentCulture = currentCulture2;
                        Thread.CurrentThread.CurrentUICulture = currentUICulture2;
                    }
                });
            }
        }

        public static CultureAwaiter EnsureCurrentCulturesAsyncFlow(this Task task)
        {
            return new CultureAwaiter(task);
        }

        public static CultureAwaiter<T> EnsureCurrentCulturesAsyncFlow<T>(this Task<T> task)
        {
            return new CultureAwaiter<T>(task);
        }

        #endregion

        #region Collections

        public static int FindIndex<T>(this IReadOnlyList<T> list, Func<T, bool> predicate)
        {
            if (predicate == null) throw new ArgumentNullException();
            for (int i = 0; i < list.Count; i++)
            {
                if (predicate(list[i])) return i;
            }
            return -1;
        }

        #endregion
    }
}

