using Com.Jab.Ex.System;
using System;
using System.Collections.Specialized;
using System.Net;
using System.Text;

namespace Com.Jab.Ex.System.Web
{
    public static class WebUtil
    { 
        public static void HtmlDecode(string s, StringBuilder sb)
        {
            StringBuilderTextWriter sbtw = null;
            try
            {
                sbtw = new StringBuilderTextWriter(sb);
                WebUtility.HtmlDecode(s, sbtw);
            }
            finally
            {
                sbtw?.Close();
            }
        }

        public static string ToQueryString(NameValueCollection nvc)
        {
            var sb = new StringBuilder();
            ToQueryString(nvc, sb);
            return sb.ToString();
        }

        public static void ToQueryString(NameValueCollection nvc, StringBuilder sb)
        {
            if (sb == null)
            {
                throw new ArgumentNullException();
            }
            int n;
            if (nvc != null && 0 < (n = nvc.Count))
            {
                bool isNotFirstKeyValuePair = false;
                int i = 0;
                do
                {
                    var key = nvc.GetKey(i);
                    var values = nvc.GetValues(i);
                    if (values.Length == 0)
                    {
                        throw new ArgumentException();
                    }
                    for (int j = 0; j < values.Length; j++)
                    {
                        if (isNotFirstKeyValuePair)
                        {
                            sb.Append('&');
                        }
                        sb.Append(WebUtility.UrlEncode(key));
                        sb.Append('=');
                        sb.Append(WebUtility.UrlEncode(values[j]));
                        isNotFirstKeyValuePair = true;
                    }
                } while (++i < n);
            }
        }
    }
}
