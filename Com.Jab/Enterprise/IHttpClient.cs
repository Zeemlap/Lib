using System;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace Com.Jab.Enterprise
{
    public interface IHttpClient
    {
        int DefaultTimeoutMs { get; }
        int DefaultMaxRetryCount { get; }
        int DefaultRetryDelayMs { get; }

        // Same as HttpClient, except throws TimeoutException on timeout.
        Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            HttpCompletionOption completionOption = HttpCompletionOption.ResponseContentRead,
            CancellationToken cancellationToken = default(CancellationToken),
            int timeoutMs = -2);

        Task<T> SendWithRetriesAsync<T>(
            Func<Task<HttpRequestMessage>> getRequestFunc,
            Func<HttpResponseMessage, Task<T>> parseResponseFunc,
            HttpCompletionOption completionOption = HttpCompletionOption.ResponseContentRead,
            CancellationToken cancellationToken = default(CancellationToken),
            Func<Exception, bool> shouldRetryFunc = null,
            int timeoutMs = -2,
            int maxRetryCount = -1,
            int retryDelayMs = -1);
    }
}
