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
        public static async Task<HtmlDocument> ReadAsHtmlDocumentAsync(this HttpResponseMessage resMsg)
        {
            resMsg.EnsureSuccessStatusCode();
            Stream stream1 = null;
            try
            {
                var contentType = resMsg.Content.Headers.ContentType;
                if (contentType.MediaType != "text/html")
                {
                    throw new InvalidOperationException();
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
                            throw new NotSupportedException();
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
