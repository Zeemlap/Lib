using System;
using System.Collections.Generic;
using System.Text;
using Com.Jab.LibCore;
using Com.Jba.LibCore.Unicode;

namespace Com.Jab.LibWebCore
{
    public class HtmlStartTag
    {
        internal HtmlStartTag()
        {
        }

        public IReadOnlyDictionary<string, string> Attributes
        {
            get
            {
                return AttributesInternal;
            }
        }

        internal Dictionary<string, string> AttributesInternal = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        public string Name { get; internal set; }

        private unsafe static void AppendDecimalCharacterReference(StringBuilder sb, char* i, char* end)
        {
            int cp = 0;
            do
            {
                cp = cp * 10 + (*i - '0');
                if (0x10FFFF < cp)
                {
                    throw new ArgumentException();
                }
            } while (++i < end);
            if (!Html5Util.IsCharacterReferenceValid(cp)) throw new ArgumentException();
            sb.Append(new CodePoint(cp));
        }

        private unsafe static void AppendHexadecimalCharacterReference(StringBuilder sb, char* i, char* end)
        {
            int cp = 0;
            do
            {
                int base16v;
                if (*i <= '9') base16v = *i - '0';
                else if (*i <= 'f') base16v = *i - 'a' + 10;
                else base16v = *i - 'A' + 10;
                cp = cp * 16 + base16v;
                if (0x10FFFF < cp)
                {
                    throw new ArgumentException();
                }
            } while (++i < end);
            if (!Html5Util.IsCharacterReferenceValid(cp)) throw new ArgumentException();
            sb.Append(new CodePoint(cp));
        }

        private unsafe static void AppendNamedCharacterReference(StringBuilder sb, string name)
        {
            string value = Html5Util.TryGetNamedCharacterReference(name);
            if (value == null) throw new ArgumentException();
            sb.Append(value);
        }

        public unsafe static HtmlStartTag ParseHtmlStartTag(string s)
        {
            if (s == null) throw new ArgumentNullException();
            int noRemChars = s.Length;
            var result = new HtmlStartTag();
            fixed (char* sFirstCharPtr = s)
            {
                char* sCharPtr = sFirstCharPtr;
                if (noRemChars == 0 || *sCharPtr != '<') throw new ArgumentException();
                ++sCharPtr;
                --noRemChars;
                if (noRemChars == 0 || !sCharPtr->IsAsciiAlphanumeric()) throw new ArgumentException();
                int i = checked((int)(sCharPtr - sFirstCharPtr));
                while (true)
                {
                    ++sCharPtr;
                    if (--noRemChars == 0) break;
                    if (!sCharPtr->IsAsciiAlphanumeric()) break;
                }
                result.Name = s.Substring(i, checked((int)(sCharPtr - sFirstCharPtr)) - i);
                StringBuilder attrValBuilder = null;
                while (true)
                {
                    if (noRemChars == 0 || !Html5Util.IsSpaceChar(*sCharPtr)) break;
                    while (true)
                    {
                        if (--noRemChars == 0) break;
                        if (!Html5Util.IsSpaceChar(*++sCharPtr)) break;
                    }
                    attrNameStart:
                    if (!Html5Util.IsAttributeNameChar_AssumeNotSpaceChar(*sCharPtr))
                    {
                        break;
                    }
                    int j = checked((int)(sCharPtr - sFirstCharPtr));
                    while (true)
                    {
                        i = *sCharPtr;
                        --noRemChars;
                        ++sCharPtr;
                        if (0xD800 <= i && i <= 0xDFFF)
                        {
                            if (0xDC00 <= i || noRemChars == 0 || *sCharPtr < 0xDC00 || 0xDFFF < *sCharPtr) throw new ArgumentException();
                            --noRemChars;
                            ++sCharPtr;
                        }
                        if (noRemChars == 0 || !Html5Util.IsAttributeNameChar_AssumeNotSpaceChar(*sCharPtr)) break;
                    }
                    var attrName = s.Substring(j, checked((int)(sCharPtr - sFirstCharPtr) - j));
                    attrName = attrName.Normalize(NormalizationForm.FormC);
                    result.AttributesInternal.Add(attrName, null);
                    if (noRemChars == 0) break;
                    while (Html5Util.IsSpaceChar(*sCharPtr))
                    {
                        if (--noRemChars == 0) break;
                        ++sCharPtr;
                    }
                    if (noRemChars == 0) break;
                    if (*sCharPtr != '=') goto attrNameStart;
                    if (--noRemChars == 0) throw new ArgumentException();
                    while (Html5Util.IsSpaceChar(*++sCharPtr))
                    {
                        if (--noRemChars == 0) throw new ArgumentException();
                    }
                    switch (*sCharPtr)
                    {
                        case '\'':
                        case '"':
                            i = *sCharPtr;
                            if (--noRemChars == 0) throw new ArgumentException();
                            ++sCharPtr;
                            break;
                        default:
                            i = 0;
                            break;
                    }
                    if (attrValBuilder == null) attrValBuilder = new StringBuilder();
                    else attrValBuilder.Clear();
                    while (true)
                    {
                        j = *sCharPtr;
                        if (0xD800 <= j && j <= 0xDFFF)
                        {
                            --noRemChars;
                            if (0xDC00 <= *sCharPtr || noRemChars == 0) throw new ArgumentException();
                            ++sCharPtr;
                            if (*sCharPtr < 0xDC00 && 0xDFFF < *sCharPtr) throw new ArgumentException();
                            j = ((j - 0xD800) << 10 | (*sCharPtr - 0xDC00)) + 0x10000;
                        }
                        if (!Html5Util.IsAttributeValueChar(j, i)) break;
                        ++sCharPtr;
                        --noRemChars;
                        if (j != '&' || noRemChars == 0)
                        {
                            attrValBuilder.Append(new CodePoint(j));
                        }
                        if (j == '&')
                        {
                            if (*sCharPtr == '#')
                            {
                                ++sCharPtr;
                                --noRemChars;
                                if (noRemChars == 0)
                                {
                                    attrValBuilder.Append("&#");
                                    break;
                                }
                                int hex = 0;
                                if (*sCharPtr == 'x' || *sCharPtr == 'X')
                                {
                                    hex = *sCharPtr == 'x' ? 1 : 2;
                                    ++sCharPtr;
                                    --noRemChars;
                                    if (noRemChars == 0)
                                    {
                                        attrValBuilder.Append(hex == 1 ? 'x' : 'X');
                                        break;
                                    }
                                }
                                j = checked((int)(sCharPtr - sFirstCharPtr));
                                if (*sCharPtr < '0' || '9' < *sCharPtr || (hex != 0
                                    && ('a' <= *sCharPtr && *sCharPtr <= 'f') || ('A' <= *sCharPtr && *sCharPtr <= 'F')))
                                {
                                    attrValBuilder.Append("&#");
                                    attrValBuilder.Append(*sCharPtr);
                                    goto nextAttrValChar;
                                }
                                ++sCharPtr;
                                --noRemChars;
                                while ('0' <= *sCharPtr && *sCharPtr <= '9' || (hex != 0
                                    && ('a' <= *sCharPtr && *sCharPtr <= 'f') || ('A' <= *sCharPtr && *sCharPtr <= 'F')))
                                {
                                    ++sCharPtr;
                                    --noRemChars;
                                    if (noRemChars == 0) break;
                                }
                                if (noRemChars == 0 || *sCharPtr != ';')
                                {
                                    attrValBuilder.Append(checked(sFirstCharPtr + j), checked((int)(sCharPtr - sFirstCharPtr)));
                                    if (noRemChars == 0)
                                    {
                                        break;
                                    }
                                    attrValBuilder.Append(*sCharPtr);
                                    goto nextAttrValChar;
                                }
                                if (hex != 0)
                                {
                                    AppendHexadecimalCharacterReference(attrValBuilder, checked(sFirstCharPtr + j), sCharPtr);
                                }
                                else
                                {
                                    AppendDecimalCharacterReference(attrValBuilder, checked(sFirstCharPtr + j), sCharPtr);
                                }
                                goto nextAttrValChar;
                            }
                            if (!sCharPtr->IsAsciiAlphanumeric())
                            {
                                attrValBuilder.Append('&');
                                goto nextAttrValChar;
                            }
                            j = checked((int)(sCharPtr - sFirstCharPtr));
                            while (true)
                            {
                                ++sCharPtr;
                                --noRemChars;
                                if (noRemChars == 0 || !sCharPtr->IsAsciiAlphanumeric()) break;
                            }
                            if (noRemChars == 0 || *sCharPtr != ';')
                            {
                                attrValBuilder.Append('&');
                                attrValBuilder.Append(checked(sFirstCharPtr + j), checked((int)(sCharPtr - sFirstCharPtr)));
                                if (noRemChars == 0) break;
                                attrValBuilder.Append(*sCharPtr);
                                goto nextAttrValChar;
                            }
                            AppendNamedCharacterReference(attrValBuilder, s.Substring(j, checked((int)(sCharPtr - sFirstCharPtr) - j)));
                            goto nextAttrValChar;
                        }
                        continue;
                        nextAttrValChar:
                        ++sCharPtr;
                        --noRemChars;
                        if (noRemChars == 0) break;
                    }
                    if (i == 0)
                    {
                        if (attrValBuilder.Length == 0) throw new ArgumentException();
                    }
                    else
                    {
                        if (noRemChars == 0 || *sCharPtr != i) throw new ArgumentException();
                        ++sCharPtr;
                        --noRemChars;
                    }
                    result.AttributesInternal[attrName] = attrValBuilder.ToString();
                }
                if (noRemChars == 0) throw new ArgumentException();
                while (Html5Util.IsSpaceChar(*sCharPtr))
                {
                    ++sCharPtr;
                    --noRemChars;
                    if (noRemChars == 0) throw new ArgumentException();
                }
                if (*sCharPtr == '/')
                {
                    ++sCharPtr;
                    --noRemChars;
                    if (noRemChars == 0) throw new ArgumentException();
                }
                if (*sCharPtr != '>') throw new ArgumentException();
                ++sCharPtr;
                --noRemChars;
                if (noRemChars != 0) throw new ArgumentException();
            }
            return result;
        }
    }
}
