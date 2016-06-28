using Com.Jab.Ex.System;
using Com.Jab.Microsoft.Win32.PInvoke;
using System;
using System.Threading;

namespace Com.Jab.Microsoft.Win32
{
    public class ErrorModeSynchronization
    {
        
        // A thread is running if it is waiting for its desired error mode to be set by another thread, 
        //      it's action is running or it's action has just finished running.
        // state bit field
        // 0x0000 0000 0000 000F // index (error mode) for which threads are currently running, about to run and may run
        // 0x0000 0000 0000 7FF0 // number of threads with this error mode running
        // 0x0000 0000 0000 8000 // Whether running threads should wait for the error mode to be set. 
        //     No thread should be running it's action if this flag is not set.
        // 0x0000 0000 FFFF 0000 // per index (error mode) whether a thread is waiting to run with this error mode
        private volatile int m_packedState;
        private readonly object[] m_waitObjects;
        [ThreadStatic] private static bool s_reentrancyFlag = false;

        private static readonly ErrorMode s_errorMode_allFlags =
            ErrorMode.Sem_FailCriticalErrors
            | ErrorMode.Sem_NoAlignmentFaultExceptions
            | ErrorMode.Sem_NoGPFaultErrorBox
            | ErrorMode.Sem_NoOpenFileErrorBox;
        private static volatile ErrorModeSynchronization s_instance;
        private static readonly int s_maxIndex = ErrorModeToIndex(s_errorMode_allFlags);

        private ErrorModeSynchronization()
        {
            m_waitObjects = new object[s_maxIndex + 1];
            for (int i = 0; i <= s_maxIndex; i++)
            {
                m_waitObjects[i] = new object();
            }
        }

        public static ErrorModeSynchronization Instance
        {
            get
            {
                var instance = s_instance;
                if (instance != null) return instance;
                instance = new ErrorModeSynchronization();
                return Interlocked.CompareExchange(ref s_instance, instance, null) ?? instance;
            }
        }

        private static int ErrorModeToIndex(ErrorMode errorMode)
        {
            int index = unchecked((int)(uint)errorMode);
            return (index & 7) | (index >> 12);
        }
        private void IncrementNoRunningThreads_Reliable()
        {
            SpinWait spinWait = default(SpinWait);
            while (true)
            {
                int packedState = m_packedState;
                if ((packedState & 0x7FF0) == 0x7FF0) throw new OverflowException();
                if (packedState == Interlocked.CompareExchange(ref m_packedState, packedState + 0x10, packedState)) break;
                spinWait.SpinOnce();
            }
        }
        private static ErrorMode IndexToErrorMode(int index)
        {
            return unchecked((ErrorMode)(uint)((index & 7) | ((index & ~7) << 12)));
        }

        private void UpdateErrorMode_Reliable()
        {
            NativeMethods.SetErrorMode(IndexToErrorMode(m_packedState & 0xF));
        }
        private void UpdateErrorModeAndSignalWaitingThreads_Reliable()
        {
            UpdateErrorMode_Reliable();
            int index = m_packedState & 0xF;
            UpdatePackedStateAtomically_Reliable(0x8000, 0x8000 | (0x10000 << index));
            object waitObject = m_waitObjects[index];
            lock (waitObject)
            {
                Monitor.PulseAll(waitObject);
            }
        }
        private void UpdatePackedStateAtomically_Reliable(int newBits, int updateMask)
        {
            SpinWait spinWait = default(SpinWait);
            while (true)
            {
                int packedState = m_packedState;
                if (Interlocked.CompareExchange(ref m_packedState, newBits | (packedState & ~updateMask), packedState) == packedState) break;
                spinWait.SpinOnce();
            }
        }
        public void Run(ErrorMode errorMode, Action action)
        {
            if (s_reentrancyFlag) throw new InvalidOperationException();
            if ((errorMode & ~s_errorMode_allFlags) != 0) throw new ArgumentOutOfRangeException();
            int index = ErrorModeToIndex(errorMode);
            SpinWait spinWait = default(SpinWait);
            while (true)
            {
                int packedState = m_packedState;
                if ((packedState & 0xF) != index)
                {
                    if ((packedState & 0x7FF0) != 0)
                    {
                        if (packedState == Interlocked.CompareExchange(ref m_packedState, packedState | (0x10000 << index), packedState)) goto wait;
                    }
                    else if (packedState == Interlocked.CompareExchange(ref m_packedState, (packedState & ~0xFFFF) | index | 0x10, packedState))
                    {
                        UpdateErrorMode_Reliable();
                        UpdatePackedStateAtomically_Reliable(0x8000, 0x8000);
                        goto runWithoutWait;
                    }
                }
                else
                {
                    if ((packedState & 0x7FF0) == 0x7FF0) throw new OverflowException();
                    if (packedState == Interlocked.CompareExchange(ref m_packedState, packedState + 0x10, packedState)) goto runWithWait;
                }
                spinWait.SpinOnce();
            }
            wait:
            object waitObject = m_waitObjects[index];
            lock (waitObject)
            {
                while ((m_packedState & 0xF) != index && !Monitor.Wait(waitObject, Timeout.Infinite, false)) ;
            }
            IncrementNoRunningThreads_Reliable();
            runWithWait:
            WaitForErrorModeToBeSet_Reliable();
            runWithoutWait:
            try
            {
                s_reentrancyFlag = true;
                action();
            }
            finally
            {
                s_reentrancyFlag = false;
                spinWait.Reset();
                while (true)
                {
                    int packedState = m_packedState;
                    if ((packedState & 0x7FF0) == 0x10 && (unchecked((uint)packedState) >> 16) != 0)
                    {
                        // There are no more threads running with this error mode and there are threads waiting.
                        if (packedState == Interlocked.CompareExchange(
                            ref m_packedState,
                            (packedState & unchecked((int)0xFFFF0000)) | (15 - packedState.Lzc()),
                            packedState))
                        {
                            UpdateErrorModeAndSignalWaitingThreads_Reliable();
                            break;
                        }
                    }
                    else
                    {
                        if (packedState == Interlocked.CompareExchange(ref m_packedState, packedState - 0x10, packedState))
                        {
                            break;
                        }
                    }
                    spinWait.SpinOnce();
                }
            }
        }
        private void WaitForErrorModeToBeSet_Reliable()
        {
            SpinWait spinWait = default(SpinWait);
            while ((m_packedState & 0x8000) == 0) spinWait.SpinOnce();
        }
    }
}
