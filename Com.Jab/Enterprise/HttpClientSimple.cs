using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace Com.Jab.Enterprise
{
    public class HttpClientSimple : IHttpClient
    {
        private HttpClient m_httpClient;

        public HttpClientSimple(HttpMessageHandler handler = null, bool disposeHandler = true)
        {
            m_httpClient = handler == null ? new HttpClient() : new HttpClient(handler, disposeHandler);
        }
        
        public async Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request, 
            TimeSpan timeout,
            HttpCompletionOption completionOption = HttpCompletionOption.ResponseContentRead,
            CancellationToken cancellationToken = default(CancellationToken)) 
        {
            if (timeout == Timeout.InfiniteTimeSpan)
            {
                return await m_httpClient.SendAsync(request,
                    completionOption,
                    cancellationToken);
            }
            long timeoutL = (long)timeout.TotalMilliseconds;
            if (timeoutL < -1 || int.MaxValue < timeoutL) throw new ArgumentOutOfRangeException();
            var cts2 = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            var timer = new Timer(state => 
            {
                cts2.Cancel();
            }, null, (int)timeoutL, Timeout.Infinite);
            try
            {
                return await m_httpClient.SendAsync(
                    request, 
                    completionOption, 
                    cts2.Token);
            }
            catch (AggregateException ex1)
            {
                if (!cts2.IsCancellationRequested) throw;
                ex1 = ex1.Flatten();
                bool fShouldHaveTimeoutEx = false;
                List<Exception> exList = new List<Exception>();
                foreach(var ex2 in ex1.InnerExceptions)
                {
                    var ex3 = ex2 as TaskCanceledException;
                    if (ex3 != null && ex3.CancellationToken == cts2.Token)
                    {
                        fShouldHaveTimeoutEx = true;
                    }
                    else
                    {
                        exList.Add(ex2);
                    }
                }
                if (fShouldHaveTimeoutEx)
                {
                    if (exList.Count == 0) throw new TimeoutException();
                    exList.Add(new TimeoutException());
                    throw new AggregateException(exList);
                }
                throw;
            }
            catch (TaskCanceledException ex1)
            {
                if (ex1.CancellationToken == cts2.Token)
                {
                    throw new TimeoutException();
                }
                throw;
            }
        }
    }
}
