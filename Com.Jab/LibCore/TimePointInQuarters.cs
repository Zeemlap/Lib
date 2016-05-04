using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Com.Jab.LibCore
{
    public struct TimePointInQuarters
    {
        private static readonly int s_dtYearMax = GetDtYearMax();
        private static readonly int s_dtYearMin = GetDtYearMin();
        private static readonly int s_thisTYearShift = 2;
        private static readonly int s_thisTYearBitSizeOf = sizeof(short) * 8 - s_thisTYearShift;
        private static readonly int s_thisTYearEpoch = (1 << (s_thisTYearBitSizeOf - 1)) - 1;
        private static readonly int s_thisTYearMin = Math.Max(s_dtYearMin, s_thisTYearEpoch - (1 << s_thisTYearBitSizeOf));
        private static readonly int s_thisTValueMin = (s_thisTYearMin - s_thisTYearEpoch) << s_thisTYearShift;

        private short m_value;

        public TimePointInQuarters(short value)
        {
            if (value < s_thisTValueMin) throw new ArgumentOutOfRangeException();
            m_value = value;
        }

        public TimePointInQuarters(DateTime dt)
        {
            int dtMonth = dt.Month;
            int dtQuarter = (dtMonth - 1) / 3;
            if (dtQuarter * 3 + 1 != dtMonth) throw new ArgumentOutOfRangeException();
            if (dt.Day != 1 || dt.TimeOfDay != TimeSpan.Zero) throw new ArgumentOutOfRangeException();
            m_value = unchecked((short)(((dt.Year - s_thisTYearEpoch) << s_thisTYearShift) | dtQuarter));
        }

        public short Value
        {
            get
            {
                return m_value;
            }
        }

        private static int GetDtYearMax()
        {
            var v = DateTime.MaxValue;
            return v.Year - (v.Month < 10 ? 1 : 0); 
        }

        private static int GetDtYearMin()
        {
            var v = DateTime.MinValue;
            return v.Year + (1 < v.Month ? 1 : 0);
        }

        public DateTime ToDateTime(DateTimeKind dtk = DateTimeKind.Unspecified)
        {
            return new DateTime((m_value >> s_thisTYearShift) + s_thisTYearEpoch, (m_value & 3) * 3 + 1, 1, 0, 0, 0, dtk);
        }

    }
}
