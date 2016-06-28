using Com.Jab.Ex.System;
using System;
using System.IO;
using System.Net.Http;
using System.Security.AccessControl;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Com.Jab.Enterprise
{
    public class HttpClientWithLocalFallbackCache : HttpClientSimple
    {
        private string m_cacheDirName;
        private IHttpMessageSerializer m_httpResponseMessageSerializer;

        public HttpClientWithLocalFallbackCache(
            string cacheDirName,
            IHttpMessageSerializer httpResponseMessageSerializer,
            int defaultTimeoutMs = DefaultDefaultTimeoutMs,
            int defaultMaxRetryCount = DefaultDefaultMaxRetryCount,
            int defaultMaxRetryDelay = DefaultDefaultRetryDelayMs,
            HttpMessageHandler handler = null,
            bool disposeHandler = true)
            : base(defaultTimeoutMs,
                  defaultMaxRetryCount,
                  defaultMaxRetryDelay,
                  handler,
                  disposeHandler)
        {
            cacheDirName = Path.GetFullPath(cacheDirName);
            m_cacheDirName = cacheDirName;
            m_httpResponseMessageSerializer = httpResponseMessageSerializer;
        }

        private string CacheKeyToFileName(string cacheKey)
        {
            byte[] cacheKey_utf8 = Encoding.UTF8.GetBytes(cacheKey);
            string cacheKey_utf8_base64 = Convert.ToBase64String(cacheKey_utf8).Replace('/', '_');
            return Path.Combine(m_cacheDirName, cacheKey_utf8_base64);
        }

        public override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, HttpCompletionOption completionOption = HttpCompletionOption.ResponseContentRead, CancellationToken cancellationToken = default(CancellationToken), int timeoutMs = -2)
        {
            HttpResponseMessage response;
            string cacheFileName = null;
            if (request.Method == HttpMethod.Get)
            {
                if (request.RequestUri == null) throw new ArgumentException();
                var cacheKey = request.RequestUri.GetComponents(UriComponents.HttpRequestUrl, UriFormat.SafeUnescaped);
                cacheFileName = CacheKeyToFileName(cacheKey);
                response = await TryReadCacheFileAsync(cacheFileName);
                if (response != null) return response;
                Util.DeleteFile(cacheFileName);
            }
            response = await base.SendAsync(request, completionOption, cancellationToken, timeoutMs);
            if (cacheFileName != null)
            {
                try
                {
                    await TryWriteCacheFileAsync(cacheFileName, response);
                }
                catch (Exception)
                {
                    Util.DeleteFile(cacheFileName);
                    throw;
                }
            }
            return response;
        }

        private async Task<HttpResponseMessage> TryReadCacheFileAsync(string cacheFileName)
        {
            FileStream fs = null;
            try
            {
                fs = new FileStream(cacheFileName, FileMode.Open, FileSystemRights.ReadData, FileShare.Read, 4096, FileOptions.SequentialScan);
                var r = await m_httpResponseMessageSerializer.DeserializeToResponseAsync(fs, true);
                if (r.ValueOwnsStream)
                {
                    fs = null;
                }
                return r.Value;
            }
            catch (IOException ex) when (
                (fs == null && (ex is DirectoryNotFoundException || ex is FileNotFoundException)) 
                || (fs != null && ex is EndOfStreamException))
            { 
                return null;
            }
            finally
            {
                fs?.Close();
            }
        }

        private async Task TryWriteCacheFileAsync(string cacheFileName, HttpResponseMessage response)
        {
            FileStream fs = null;
            bool fDirNotFound = false;
            while (true)
            {
                try
                {
                    fs = new FileStream(
                        cacheFileName,
                        FileMode.Create,
                        FileAccess.Write,
                        FileShare.None,
                        4096, FileOptions.SequentialScan);
                    await m_httpResponseMessageSerializer.SerializeAsync(response, fs);
                    return;
                }
                catch (DirectoryNotFoundException)
                {
                    if (fDirNotFound || fs != null) throw;
                    Directory.CreateDirectory(m_cacheDirName);
                    fDirNotFound = true;
                }
                finally
                {
                    fs?.Close();
                }
            }
        }

    }
}
