namespace Com.Jab.Microsoft.Win32.PInvoke
{
    public enum ErrorMode
    {
        DisplayAllErrorBoxes = 0,
        Sem_FailCriticalErrors = 0x1,
        Sem_NoGPFaultErrorBox = 0x2,
        Sem_NoAlignmentFaultExceptions = 0x4,
        Sem_NoOpenFileErrorBox = 0x8000,
    }
}
