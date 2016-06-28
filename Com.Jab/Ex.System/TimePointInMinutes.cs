using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Com.Jab.Ex.System
{
    public struct TimePointInMinutes
    {
        private static readonly DateTime s_dtMax;
        private static readonly DateTime s_dtMin;
        private static readonly DateTime s_dtEpoch;
        private static readonly int s_thisTMinValue;

        private int m_value;

        static TimePointInMinutes()
        {
            var calendar = GetCalendar();
            var dtMax_noTrunc = calendar.MaxSupportedDateTime;
            s_dtMax = dtMax_noTrunc.AddTicks(checked(-(dtMax_noTrunc.TimeOfDay.Ticks % TimeSpan.TicksPerMinute)));
            s_dtEpoch = calendar.AddMinutes(s_dtMax, -int.MaxValue);
            try
            {
                s_dtMin = calendar.AddMinutes(s_dtEpoch, int.MinValue);
            }
            catch (ArgumentOutOfRangeException)
            {
                throw;
            }
            catch (ArgumentException)
            {
                var dtMin_noTrunc = calendar.MinSupportedDateTime;
                s_dtMin = dtMin_noTrunc.AddTicks(checked((int)(TimeSpan.TicksPerMinute - dtMin_noTrunc.TimeOfDay.Ticks % TimeSpan.TicksPerMinute)));
            }
            var ts = s_dtMin - s_dtEpoch;
            if ((ts.Ticks % TimeSpan.TicksPerMinute) != 0) throw new ArgumentException();
            s_thisTMinValue = checked((int)(ts.Ticks / TimeSpan.TicksPerMinute));
        }

        public TimePointInMinutes(int value)
        {
            if (value < s_thisTMinValue) throw new ArgumentOutOfRangeException();
            m_value = value;
        }

        public TimePointInMinutes(DateTime dt)
        {
            if (s_dtMax < dt || dt < s_dtMin)
            {
                throw new ArgumentOutOfRangeException();
            }
            var ts = dt - s_dtEpoch;
            if ((ts.Ticks % TimeSpan.TicksPerMinute) != 0)
            {
                throw new ArgumentException();
            }
            m_value = checked((int)(ts.Ticks / TimeSpan.TicksPerMinute));
        }

        public int Value
        {
            get
            {
                return m_value;
            }
        }
        
        public DateTime ToDateTime(DateTimeKind dtk = DateTimeKind.Unspecified)
        {
            var dt = GetCalendar().AddMinutes(s_dtEpoch, m_value);
            return new DateTime(dt.Ticks, dtk);
        }

        private static Calendar GetCalendar()
        {
            return CultureInfo.InvariantCulture.Calendar;
        }
    }
}
