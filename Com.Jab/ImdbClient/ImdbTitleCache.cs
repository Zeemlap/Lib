using Com.Jab.Ex.System;
using HtmlAgilityPack;
using System;
using System.Text.RegularExpressions;

namespace Com.Jab.ImdbClient
{
    public class ImdbTitleCache
    {
        public string Id
        {
            get;
            internal set;
        }

        public ImdbTitleCache(string id)
        {
            if (id == null) throw new ArgumentNullException();
            if (!Regex.IsMatch(id, @"^tt\d+$")) throw new ArgumentException();
            Id = id;
        }

        internal bool ReleasedYearInterval_IsInitialized { get; set; }
        internal IntervalInt32 ReleasedYearInterval
        {
            get;
            set;
        }

        internal HtmlDocument PrimaryHtmlDoc { get; set; }

        internal HtmlDocument ReleaseInfoHtmlDoc
        {
            get;
            set;
        }
        internal string PrimaryName { get; set; }
    }
}
