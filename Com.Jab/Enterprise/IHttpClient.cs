using System;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace Com.Jab.Enterprise
{
    public interface IHttpClient
    {
        /// <summary>
        /// Same as HttpClient, except throws TimeoutException on timeout.
        /// </summary>
        /// <param name="request"></param>
        /// <param name="timeout"></param>
        /// <param name="completionOption"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request, 
            TimeSpan timeout,
            HttpCompletionOption completionOption = HttpCompletionOption.ResponseContentRead, 
            CancellationToken cancellationToken = default(CancellationToken));
    }
}
