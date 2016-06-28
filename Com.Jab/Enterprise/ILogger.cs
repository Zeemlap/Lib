using System;
using System.Runtime.CompilerServices;

namespace Com.Jab.Enterprise
{
    public interface ILogger
    {
        void Log(
            string messageFormat = null,
            LogLevel level = LogLevel.Error,
            object[] messageArgs = null,
            Exception exception = null,
            [CallerFilePath] string callerFile = null,
            [CallerLineNumber] int callerLineNumber = 0);

    }
}
