using Com.Jab.Ex.System;
using System;
using System.Globalization;
using System.Reflection;
using System.Threading;

namespace Com.Jab.Ex.System.Unicode
{
    public struct CodePoint : IEquatable<CodePoint>, IComparable<CodePoint>, IComparable
    {
        private unsafe struct Flags256T
        {
            internal const int BitLength = 256;
            private const int UInt32Length = (BitLength + 31) >> 5;
            internal bool IsInitialized;
            private fixed uint V[UInt32Length];
            internal unsafe bool this[int index]
            {
                get
                {
                    fixed (uint* v = V)
                    {
                        return (v[index >> 5] & (1U << index)) != 0;
                    }
                }
                set
                {
                    fixed (uint* v = V)
                    {
                        if (value)
                        {
                            v[index >> 5] |= (1U << index);
                        }
                        else
                        {
                            v[index >> 5] &= ~(1U << index);
                        }
                    }
                }
            }
        }

        private unsafe struct HexDigitValuesT
        {
            internal const int Length = 'f' + 1;
            internal bool IsInitialized;
            internal fixed sbyte V[Length];
        }

        private const uint s_ps_value_mask = 0x1FFFFF;
        public const int MaxValue = 0x10FFFF;
        private const int s_ps_value_offset = 0;
        private const uint s_ps_catCache_mask = 0xFFE00000;
        private const int s_ps_cacCache_offset = 21;
        private static volatile Func<int, UnicodeCategory> s_getCategoryFunc;
        private static HexDigitValuesT s_hexDigitValues;
        private static Flags256T s_isAsciiAlphanumericFlags;
        private static Flags256T s_isLetterFlags;
        
        private uint m_ps;

        public CodePoint(int value)
        {
            if (MaxValue < unchecked((uint)value))
            {
                throw new ArgumentOutOfRangeException();
            }
            m_ps = unchecked((uint)value) << s_ps_value_offset;
        }
        
        public UnicodeCategory Category
        {
            get
            {
                var i = CategoryCache;
                if (i != (UnicodeCategory)(-1)) return i;
                i = GetCategoryInternal(Value);
                CategoryCache = i;
                return i;
            }
        }

        private UnicodeCategory CategoryCache
        {
            get
            {
                return unchecked((UnicodeCategory)((int)((m_ps & s_ps_catCache_mask) >> s_ps_cacCache_offset) - 1));
            }
            set
            {
                m_ps = (unchecked((uint)((int)value + 1)) << s_ps_cacCache_offset) | (m_ps & ~s_ps_catCache_mask);
            }
        }
        
        public int Value
        {
            get
            {
                return unchecked((int)((m_ps & s_ps_value_mask) >> s_ps_value_offset));
            }
        }

        int IComparable.CompareTo(object obj)
        {
            if (!(obj is CodePoint)) throw new ArgumentException();
            return CompareTo((CodePoint)obj);
        }

        public int CompareTo(CodePoint other)
        {
            return unchecked(Value - other.Value);
        }

        public override bool Equals(object obj)
        {
            return obj is CodePoint && Equals((CodePoint)obj);
        }

        public bool Equals(CodePoint other)
        {
            return Value == other.Value; 
        }
        
        public static UnicodeCategory GetCategory(int cp)
        {
            if (MaxValue < unchecked((uint)cp)) throw new ArgumentOutOfRangeException();
            return GetCategoryInternal(cp);
        }

        internal static UnicodeCategory GetCategoryInternal(int cp)
        {
            if (s_getCategoryFunc != null) return s_getCategoryFunc(cp);
            InitializeGetCategoryFunc();
            return s_getCategoryFunc(cp);
        }

        private unsafe static UnicodeCategory GetCategorySlow(int cp)
        {
            if (cp < 0xFFFF)
            {
                return CharUnicodeInfo.GetUnicodeCategory(unchecked((char)cp));
            }
            string s = Util.StringAllocate(2);
            int i1 = cp - 0x10000;
            fixed (char* sPtr = s)
            {
                sPtr[0] = unchecked((char)((i1 >> 10) + 0xD800));
                sPtr[1] = unchecked((char)((i1 & 0x3FF) + 0xDC00));
            }
            return CharUnicodeInfo.GetUnicodeCategory(s, 0);
        }

        public override int GetHashCode()
        {
            return Value;
        }

        public int GetHexDigitValue()
        {
            return GetHexDigitValueInternal(Value);    
        }

        public static int GetHexDigitValue(int cp)
        {
            if (MaxValue < unchecked((uint)cp)) throw new ArgumentOutOfRangeException();
            return GetHexDigitValueInternal(cp);
        }

        private static int GetHexDigitValueComputed(int cp)
        {
            if ('0' <= cp && cp <= '9') return cp - '0';
            if ('A' <= cp && cp <= 'F') return cp - 'F' + 10;
            if ('a' <= cp && cp <= 'f') return cp - 'a' + 10;
            return -1;
        }

        internal unsafe static int GetHexDigitValueInternal(int cp)
        {
            if (cp < HexDigitValuesT.Length)
            {
                if (s_hexDigitValues.IsInitialized)
                {
                    fixed (sbyte* hexDigitValues = s_hexDigitValues.V)
                    {
                        return hexDigitValues[cp];
                    }
                }
                InitializeHexDigitValues();
                fixed (sbyte* hexDigitValues = s_hexDigitValues.V)
                {
                    return hexDigitValues[cp];
                }
            }
            return -1;
        }

        private static void InitializeGetCategoryFunc()
        {
            Func<int, UnicodeCategory> getCategoryFunc;
            var getCategoryMI = typeof(CharUnicodeInfo).GetMethod(
                    "InternalGetUnicodeCategory",
                    BindingFlags.Static | BindingFlags.NonPublic | BindingFlags.Public | BindingFlags.DeclaredOnly,
                    null,
                    CallingConventions.Any,
                    new Type[] { typeof(int), },
                    null);
            if (getCategoryMI != null)
            {
                getCategoryFunc = (Func<int, UnicodeCategory>)getCategoryMI.CreateDelegate(typeof(Func<int, UnicodeCategory>));
            }
            else
            {
                getCategoryFunc = GetCategorySlow;
            }
            Interlocked.CompareExchange(ref s_getCategoryFunc, getCategoryFunc, null);
        }

        private unsafe static void InitializeHexDigitValues()
        {
            fixed (sbyte* hexDigitValues = s_hexDigitValues.V)
            {
                for (int i = 0; i < HexDigitValuesT.Length; i++)
                {
                    hexDigitValues[i] = unchecked((sbyte)GetHexDigitValueComputed(i));
                }
            }
            s_hexDigitValues.IsInitialized = true;
        }

        private static void InitializeIsAsciiAlphanumericFlags()
        {
            for (int i = 0; i < Flags256T.BitLength; i++)
            {
                s_isAsciiAlphanumericFlags[i] = ('0' <= i && i <= '9')
                    || ('a' <= i && i <= 'z')
                    || ('A' <= i && i <= 'Z');
            }
            s_isAsciiAlphanumericFlags.IsInitialized = true;
        }

        private static void InitializeIsLetterFlags()
        {
            for (int i = 0; i < Flags256T.BitLength; i++)
            {
                s_isLetterFlags[i] = IsLetterComputed(i);
            }
            s_isLetterFlags.IsInitialized = true;
        }

        public bool IsAsciiAlphanumeric()
        {
            return IsAsciiAlphanumeric(Value);
        }

        public unsafe static bool IsAsciiAlphanumeric(int cp)
        {
            if (MaxValue < unchecked((uint)cp)) throw new ArgumentOutOfRangeException();
            return IsAsciiAlphanumericInternal(cp);
        }

        internal unsafe static bool IsAsciiAlphanumericInternal(int cp)
        {
            if (cp < Flags256T.BitLength)
            {
                if (s_isAsciiAlphanumericFlags.IsInitialized)
                {
                    return s_isAsciiAlphanumericFlags[cp];
                }
                InitializeIsAsciiAlphanumericFlags();
                return s_isAsciiAlphanumericFlags[cp];
            }
            return false;
        }

        public bool IsLetter()
        {
            return IsLetterInternal(Value);
        }

        public static bool IsLetter(int cp)
        {
            if (MaxValue < unchecked((uint)cp)) throw new ArgumentOutOfRangeException();
            return IsLetterInternal(cp);
        }

        internal static bool IsLetterInternal(int cp)
        {
            if (cp < Flags256T.BitLength)
            {
                if (s_isLetterFlags.IsInitialized)
                {
                    return s_isLetterFlags[cp];
                }
                InitializeIsLetterFlags();
                return s_isLetterFlags[cp];
            }
            return IsLetterComputed(cp);
        }

        private static bool IsLetterComputed(int cp)
        {
            switch (GetCategoryInternal(cp))
            {
                case UnicodeCategory.LetterNumber:
                case UnicodeCategory.LowercaseLetter:
                case UnicodeCategory.ModifierLetter:
                case UnicodeCategory.OtherLetter:
                case UnicodeCategory.TitlecaseLetter:
                case UnicodeCategory.UppercaseLetter:
                    return true;
            }
            return false;
        }

        public bool IsNonCharacter()
        {
            return IsNonCharacterInternal(Value);
        }

        public static bool IsNonCharacter(int cp)
        {
            if (MaxValue < unchecked((uint)cp)) throw new ArgumentOutOfRangeException();
            return IsNonCharacterInternal(cp);
        }

        internal static bool IsNonCharacterInternal(int cp)
        {
            const int min1 = 0xFDD0;
            const int max1 = 0xFDEF;
            const int min2 = 0xFFFE;
            const int max2 = 0xFFFF;
            return unchecked((uint)(cp - min1)) <= max1 - min1
                || unchecked((uint)((cp & 0xFFFF) - min2)) <= max2 - min2;
        }

        // the code points that are considered white space are the same as those that http://msdn.microsoft.com/en-us/library/system.char.iswhitespace(v=vs.110).aspx consideres whitespace
        public bool IsWhiteSpace()
        {
            if (IsWhiteSpaceSwitch(Value)) return true;
            switch (Category)
            {
                case UnicodeCategory.SpaceSeparator:
                case UnicodeCategory.LineSeparator:
                case UnicodeCategory.ParagraphSeparator:
                    return true;
            }
            return false;
        }

        public static bool IsWhiteSpace(int cp)
        {
            if (MaxValue < unchecked((uint)cp)) throw new ArgumentOutOfRangeException();
            return IsWhiteSpaceInternal(cp);
        }

        internal static bool IsWhiteSpaceInternal(int cp)
        {
            if (IsWhiteSpaceSwitch(cp)) return true;
            switch (GetCategoryInternal(cp))
            {
                case UnicodeCategory.LineSeparator:
                case UnicodeCategory.SpaceSeparator:
                case UnicodeCategory.ParagraphSeparator:
                    return true;
            }
            return false;
        }

        private static bool IsWhiteSpaceSwitch(int cp)
        {
            switch (cp)
            {
                case '\t':
                case '\n':
                case '\u000B':
                case '\f':
                case '\r':
                case '\u0085':
                case '\u00A0':
                case ' ':
                    return true;
            }
            return false;
        }

        public static bool operator <=(CodePoint l, CodePoint r)
        {
            return l.CompareTo(r) <= 0;
        }

        public static bool operator <(CodePoint l, CodePoint r)
        {
            return l.CompareTo(r) < 0;
        }

        public static bool operator >=(CodePoint l, CodePoint r)
        {
            return l.CompareTo(r) >= 0;
        }

        public static bool operator >(CodePoint l, CodePoint r)
        {
            return l.CompareTo(r) > 0;
        }

        public static bool operator ==(CodePoint l, CodePoint r)
        {
            return l.Equals(r);
        }

        public static bool operator !=(CodePoint l, CodePoint r)
        {
            return !l.Equals(r);
        }
    }
}
