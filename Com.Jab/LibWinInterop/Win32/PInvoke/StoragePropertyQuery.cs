using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Com.Jab.LibWinInterop.Win32.PInvoke
{
    public enum StoragePropertyId
    {
        DeviceDescriptor = 0,
        AdapterDescriptor = 1,
        DeviceIdentifiers = 2,
        UniqueDeviceIdentifier = 3,
        WriteCache = 4,
        MiniportDriverDescriptor = 5,
        AccessAlignmentDescriptor = 6,
        SeekPenaltyDescriptor = 7,
        TrimDescriptor = 8,
        WriteAggregationDescriptor = 9,
        // DeviceTelemetry = 10, // reserved
        LogicalBlockProvisioningDescriptor = 11,
        PowerDiskDriveDescriptor = 12,
        WriteOffloadDescriptor = 13,
        ResiliencyDescriptor = 14,
    }
    public enum QueryType
    {
        Standard,
        Exists,
    }
    public struct StoragePropertyQuery
    {
        public StoragePropertyId PropertyId;
        public QueryType QueryType;
        public uint AdditionalParameters;
    }
}
