using HtmlAgilityPack;
using System;
using Com.Jab.Ex.System;
using System.Linq;
using Com.Jab.Ex.System.Unicode;

namespace Com.Jab.Ex.HtmlAgilityPack
{
    public static class Extensions
    {
        public static bool HasClass(this HtmlNode htmlNode, string @class, StringComparison c = StringComparison.OrdinalIgnoreCase)
        {
            if (@class == null) throw new ArgumentNullException();
            if (@class.CodePoints(0, @class.Length).Any(cp => CodePoint.IsWhiteSpace(cp))) throw new ArgumentException();
            string classList = htmlNode.GetAttributeValue("class", null);
            if (classList == null) return false;
            int i1 = 0;
            int end = classList.Length;
            while (true)
            {
                i1 = classList.TrimStartWhile(i1, end, cp => CodePoint.IsWhiteSpace(cp));
                if (i1 == end) return false;
                int i2 = classList.TrimStartWhile(i1, end, cp => !CodePoint.IsWhiteSpace(cp));
                if (i2 - i1 == @class.Length && string.Compare(classList, i1, @class, 0, @class.Length, c) == 0)
                {
                    return true;
                }
                if (i2 == end) return false;
                i1 = i2;
            }
        }

    }
}
