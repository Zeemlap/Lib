using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace Com.Jab.Enterprise
{
    public class HttpClientSimple : IHttpClient
    {
        public const int DefaultDefaultTimeoutMs = -1;
        public const int DefaultDefaultMaxRetryCount = 2;
        public const int DefaultDefaultRetryDelayMs = 1000;

        private HttpClient m_httpClient;
        private int m_defaultTimeoutMs;
        private int m_defaultMaxRetryCount;
        private int m_defaultRetryDelayMs;

        public HttpClientSimple(
            int defaultTimeoutMs = DefaultDefaultTimeoutMs,
            int defaultMaxRetryCount = DefaultDefaultMaxRetryCount,
            int defaultRetryDelayMs = DefaultDefaultRetryDelayMs,
            HttpMessageHandler handler = null, 
            bool disposeHandler = true)
        {
            if (defaultTimeoutMs <= 0 && defaultTimeoutMs != Timeout.Infinite)
            {
                throw new ArgumentOutOfRangeException();
            }
            if (defaultMaxRetryCount < 0 || defaultRetryDelayMs < 0)
            {
                throw new ArgumentOutOfRangeException();
            }
            m_defaultTimeoutMs = defaultTimeoutMs;
            m_defaultRetryDelayMs = defaultRetryDelayMs;
            m_defaultMaxRetryCount = defaultMaxRetryCount;
            m_httpClient = handler == null ? new HttpClient() : new HttpClient(handler, disposeHandler);
        }

        public int DefaultTimeoutMs { get { return m_defaultTimeoutMs; } }

        public int DefaultRetryDelayMs { get { return m_defaultRetryDelayMs; } }

        public int DefaultMaxRetryCount { get { return m_defaultMaxRetryCount; } }
        
        public virtual async Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request, 
            HttpCompletionOption completionOption = HttpCompletionOption.ResponseContentRead,
            CancellationToken cancellationToken = default(CancellationToken),
            int timeoutMs = -2)
        {
            if (timeoutMs <= 0)
            {
                if (timeoutMs == -2) timeoutMs = DefaultTimeoutMs;
                else if (timeoutMs != Timeout.Infinite) throw new ArgumentOutOfRangeException();
            }
            if (timeoutMs == Timeout.Infinite)
            {
                return await m_httpClient.SendAsync(request,
                    completionOption,
                    cancellationToken);
            }
            var timeoutCts = new CancellationTokenSource(timeoutMs);
            var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(timeoutCts.Token, cancellationToken);
            try
            {
                return await m_httpClient.SendAsync(
                    request, 
                    completionOption, 
                    linkedCts.Token);
            }
            catch (AggregateException ex1)
            {
                ex1 = ex1.Flatten();
                bool isTimeoutEx = false;
                List<Exception> exList = new List<Exception>();
                foreach(var ex2 in ex1.InnerExceptions)
                {
                    var ex3 = ex2 as TaskCanceledException;
                    if (ex3 != null && ex3.CancellationToken == linkedCts.Token && timeoutCts.IsCancellationRequested)
                    {
                        isTimeoutEx = true;
                    }
                    else
                    {
                        exList.Add(ex2);
                    }
                }
                if (isTimeoutEx)
                {
                    if (exList.Count == 0) throw new TimeoutException();
                    exList.Add(new TimeoutException());
                    throw new AggregateException(exList);
                }
                throw;
            }
            catch (TaskCanceledException ex1)
            {
                if (ex1.CancellationToken == linkedCts.Token && timeoutCts.IsCancellationRequested)
                {
                    throw new TimeoutException();
                }
                throw;
            }
        }

        public async Task<T> SendWithRetriesAsync<T>(
            Func<Task<HttpRequestMessage>> getRequestFunc, 
            Func<HttpResponseMessage, Task<T>> parseResponseFunc,
            HttpCompletionOption completionOption = HttpCompletionOption.ResponseContentRead, 
            CancellationToken cancellationToken = default(CancellationToken), 
            Func<Exception, bool> shouldRetryFunc = null, 
            int timeoutMs = -2, 
            int maxRetryCount = -1, 
            int retryDelayMs = -1)
        {
            if (timeoutMs <= 0)
            {
                if (timeoutMs == -2) timeoutMs = DefaultTimeoutMs;
                else if (timeoutMs != Timeout.Infinite) throw new ArgumentOutOfRangeException();
            }
            if (maxRetryCount < 0)
            {
                if (maxRetryCount < -1) throw new ArgumentOutOfRangeException();
                maxRetryCount = DefaultMaxRetryCount;
            }
            if (retryDelayMs < 0)
            {
                if (retryDelayMs < -1) throw new ArgumentOutOfRangeException();
                retryDelayMs = DefaultRetryDelayMs;
            }
            if (shouldRetryFunc == null)
            {
                shouldRetryFunc = ex => HttpUtil.IsUnreliableConnectivityException(ex);
            }
            CancellationToken linkedCt = cancellationToken;
            CancellationTokenSource timeoutCts = null;
            if (timeoutMs != Timeout.Infinite && cancellationToken != CancellationToken.None)
            {
                timeoutCts = new CancellationTokenSource(timeoutMs);
                linkedCt = CancellationTokenSource.CreateLinkedTokenSource(timeoutCts.Token, cancellationToken).Token;
            }
            int retryCount = -1;
            while (true)
            {
                HttpRequestMessage request = null;
                HttpResponseMessage response = null;
                bool response_shouldDispose = false;
                try
                {
                    request = await getRequestFunc();
                    response = await SendAsync(request, completionOption, linkedCt, timeoutMs: Timeout.Infinite);
                    var r = await parseResponseFunc(response);
                    response_shouldDispose = !ReferenceEquals(r, response);
                    return r;
                }
                catch (Exception ex1)
                {
                    bool isTimeout = false;
                    Stack<Exception> exStack = new Stack<Exception>();
                    exStack.Push(ex1);
                    List<Exception> exList = new List<Exception>();
                    while (0 < exStack.Count)
                    {
                        var ex2 = exStack.Pop();
                        var ex3 = ex2 as AggregateException;
                        if (ex3 != null)
                        {
                            for (int i = ex3.InnerExceptions.Count; 0 <= --i;)
                            {
                                exStack.Push(ex3.InnerExceptions[i]);
                            }
                            continue;
                        }
                        bool ex2IsTimeoutException = false;
                        if (timeoutCts != null)
                        {
                            var ex4 = ex2 as TaskCanceledException;
                            if (ex4 != null && ex4.CancellationToken == linkedCt && timeoutCts.IsCancellationRequested)
                            {
                                ex2IsTimeoutException = true;
                            }
                        }
                        if (ex2IsTimeoutException)
                        {
                            if (!isTimeout)
                            {
                                exList.Add(new TimeoutException());
                                isTimeout = true;
                            }
                        }
                        else if (!shouldRetryFunc(ex2))
                        {
                            exList.Add(ex2);
                        }
                        
                    }
                    if (0 < exList.Count)
                    {
                        if (1 == exList.Count) throw exList[0];
                        throw new AggregateException(exList);
                    }
                }
                finally
                {
                    request?.Dispose();
                    if (response_shouldDispose) response?.Dispose();
                }
                if (maxRetryCount < ++retryCount)
                {
                    throw new TimeoutException();
                }
                if (0 < retryDelayMs) await Task.Delay(retryDelayMs);
            }
        }
    }
}
