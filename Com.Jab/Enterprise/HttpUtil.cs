using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Sockets;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Com.Jab.Enterprise
{
    public static class HttpUtil
    {
        private static string s_sHttpStatusCodeExceptionPrefix = "Response status code does not indicate success:";
        private static Regex s_reHttpStatusCodeException = new Regex(@"^[ ]+(\d+)(?:[ ]+\(([^\)]*)\))?\.$");

        public static Encoding EncodingFromCharSet(string value)
        {
            if (value != null)
            {
                if ("UTF-8".Equals(value, StringComparison.OrdinalIgnoreCase))
                {
                    return Encoding.UTF8;
                }
                else if ("ISO-8859-1".Equals(value, StringComparison.OrdinalIgnoreCase))
                {
                    return Encoding.GetEncoding("ISO-8859-1");
                }
                else
                {
                    throw new NotImplementedException();
                }
            }
            return null;
        }

        // -1 if not HTTP exception
        public static int GetStatusCode(Exception ex)
        {
            var exHttpReq = ex as HttpRequestException;
            if (exHttpReq == null) return -1;
            int statusCode;
            string statusText;
            GetStatusCore(exHttpReq, out statusCode, out statusText);
            return statusCode;
        }

        private static void GetStatusCore(HttpRequestException exHttpReq, out int code, out string text)
        {
            code = -1;
            text = null;
            var exHttpReq_msg = exHttpReq.Message;
            if (exHttpReq_msg.StartsWith(s_sHttpStatusCodeExceptionPrefix))
            {
                // Response status code does not indicate success: {0} ({1}).
                int i = s_sHttpStatusCodeExceptionPrefix.Length;
                var m = s_reHttpStatusCodeException.Match(exHttpReq_msg, i, exHttpReq_msg.Length - i);
                code = int.Parse(m.Groups[1].Captures.Cast<Capture>().Single().Value, NumberStyles.None, null);
                text = m.Groups[2].Captures.Cast<Capture>().Single().Value;
            }
        }

        public static bool IsUnreliableConnectivityException(Exception ex)
        {
            var exHttpReq = ex as HttpRequestException;
            if (exHttpReq == null) return false;
            Exception exInnerMostEX = ex;
            while (exInnerMostEX.InnerException != null) exInnerMostEX = exInnerMostEX.InnerException;
            if (exHttpReq == exInnerMostEX)
            {
                int statusCode;
                string statusText;
                GetStatusCore(exHttpReq, out statusCode, out statusText);
                switch (statusCode)
                {
                    case 502: // Bad gateway.
                        return true;
                }
                return false;
            }
            var exSocket = exInnerMostEX as SocketException;
            if (exSocket != null)
            {
                switch (exSocket.SocketErrorCode)
                {
                    case SocketError.ConnectionAborted:
                        // An established connection was aborted by the software in your host machine.
                        return true;
                    case SocketError.TimedOut:
                        return true;
                }
                return false;
            }
            var exWeb = exInnerMostEX as WebException;
            if (exWeb != null)
            {
                switch (exWeb.Status)
                {
                    case WebExceptionStatus.NameResolutionFailure:
                        // The remote name could not be resolved: '{0}'
                        return true;
                }
                return false;
            }
            var exType = ex.GetType();
            var exInnerMostEXType = exInnerMostEX.GetType();
            return false;
        }

        public static Task<HttpRequestMessage> CreateGetHtmlRequestAsync(string uri)
        {
            HttpRequestMessage reqMsg = null;
            bool reqMsg_shouldDispose = true;
            try
            {
                reqMsg = new HttpRequestMessage(HttpMethod.Get, uri);
                reqMsg.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("text/html", 1.0));
                reqMsg.Headers.AcceptEncoding.Add(new StringWithQualityHeaderValue("gzip"));
                reqMsg.Headers.AcceptEncoding.Add(new StringWithQualityHeaderValue("deflate"));
                reqMsg_shouldDispose = false;
                return Task.FromResult(reqMsg);
            }
            finally
            {
                if (reqMsg_shouldDispose && reqMsg != null)
                {
                    reqMsg.Dispose();
                }
            }
        }

    }
}
