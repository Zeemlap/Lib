using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
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

        // Throws timeout exception if all maxRetryCount + 1 attempts to perform the HttpClient operation ran by httpClient_sendAsyncFunc resulted in either a timeout (TimeoutException) or 
        // an exception for which IsUnreliableConnectivityException returns true.
        public static async Task<T> SendAsync_HandleUnreliableConnectivity<T>(
            Func<Task<T>> httpClient_sendAsyncFunc,
            int maxRetryCount = 2,
            int retryDelayInMilliseconds = 1000)
        {
            int retryCount = -1;
            while (true)
            {
                try
                {
                    return await httpClient_sendAsyncFunc();
                }
                catch (AggregateException ex1)
                {
                    ex1 = ex1.Flatten();
                    var ex1InnerEXList = ex1.InnerExceptions;
                    var ex1InnerEXList_filtered = new List<Exception>();
                    for (int i = 0; i < ex1InnerEXList.Count; i++)
                    {
                        if (IsUnreliableConnectivityException(ex1InnerEXList[i]))
                        {
                            continue;
                        }
                        if (ex1InnerEXList[i] is TimeoutException)
                        {
                            continue;
                        }
                        ex1InnerEXList_filtered.Add(ex1InnerEXList[i]);
                    }
                    if (0 < ex1InnerEXList_filtered.Count)
                    {
                        if (ex1InnerEXList_filtered.Count < ex1InnerEXList.Count)
                        {
                            throw new AggregateException(ex1InnerEXList_filtered.ToArray());
                        }
                        throw;
                    }
                }
                catch (Exception ex1)
                {
                    bool shouldRethrow = true;
                    if (IsUnreliableConnectivityException(ex1))
                    {
                        shouldRethrow = false;
                    }
                    if (ex1 is TimeoutException)
                    {
                        shouldRethrow = false;
                    }
                    if (shouldRethrow)
                    {
                        throw;
                    }
                }
                if (maxRetryCount < ++retryCount)
                {
                    throw new TimeoutException();
                }
                await Task.Delay(retryDelayInMilliseconds);
            }
        }

    }
}
