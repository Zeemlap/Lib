using Com.Jab.Enterprise;
using HtmlAgilityPack;
using System;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Com.Jab.Enterprise.HtmlAgilityPack
{
    public static class Extensions
    {
        public static async Task<HtmlDocument> GetHtmlDocumentAsync(this IHttpClient httpClient,
            string url,
            TimeSpan timeout,
            CancellationToken cancellationToken = default(CancellationToken))
        {
            var reqMsg = new HttpRequestMessage(HttpMethod.Get, url);
            reqMsg.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("text/html", 1));
            reqMsg.Headers.AcceptEncoding.Add(new StringWithQualityHeaderValue("gzip"));
            reqMsg.Headers.AcceptEncoding.Add(new StringWithQualityHeaderValue("deflate"));
            HttpResponseMessage resMsg = await httpClient.SendAsync(reqMsg,
                timeout,
                HttpCompletionOption.ResponseContentRead,
                cancellationToken);
            resMsg.EnsureSuccessStatusCode();
            Stream stream1 = null;
            try
            {
                var contentType = resMsg.Content.Headers.ContentType;
                if (contentType.MediaType != "text/html")
                {
                    throw new NotImplementedException();
                }
                var contentCharSet = HttpUtil.EncodingFromCharSet(contentType.CharSet);
                var contentEncoding = resMsg.Content.Headers.ContentEncoding.SingleOrDefault();
                stream1 = await resMsg.Content.ReadAsStreamAsync();
                if (contentEncoding != null)
                {
                    switch (contentEncoding)
                    {
                        case "gzip":
                            stream1 = new GZipStream(stream1, CompressionMode.Decompress, false);
                            break;
                        case "deflate":
                            stream1 = new DeflateStream(stream1, CompressionMode.Decompress, false);
                            break;
                        default:
                            throw new NotImplementedException();
                    }
                }
                var htmlDoc = new HtmlDocument();
                htmlDoc.Load(stream1, contentCharSet, false);
                return htmlDoc;
            }
            finally
            {
                stream1?.Dispose();
            }
        }
    }
}
