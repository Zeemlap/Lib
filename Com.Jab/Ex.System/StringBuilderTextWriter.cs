using System;
using System.IO;
using System.Text;

namespace Com.Jab.Ex.System
{
    public class StringBuilderTextWriter : TextWriter
    {
        private StringBuilder m_sb;

        public StringBuilderTextWriter(StringBuilder sb, IFormatProvider formatProvider = null)
            : base(formatProvider)
        {
            if (sb == null) throw new ArgumentNullException();
            m_sb = sb;
        }

        public StringBuilder StringBuilder
        {
            get
            {
                return m_sb;
            }
        }

        public override Encoding Encoding
        {
            get
            {
                return Encoding.Unicode;
            }
        }

        public override void Write(char value)
        {
            m_sb.Append(value);
        }

        public override void Write(char[] buffer, int index, int count)
        {
            if (buffer == null) throw new ArgumentNullException();
            m_sb.Append(buffer, index, count);
        }

        public override void Write(string value)
        {
            m_sb.Append(value);
        }

        public override void Write(string format, object arg0)
        {
            m_sb.AppendFormat(FormatProvider, format, arg0);
        }

        public override void Write(string format, object arg0, object arg1)
        {
            m_sb.AppendFormat(FormatProvider, format, arg0, arg1);
        }

        public override void Write(string format, object arg0, object arg1, object arg2)
        {
            m_sb.AppendFormat(FormatProvider, format, arg0, arg1, arg2);
        }

        public override void Write(string format, params object[] args)
        {
            m_sb.AppendFormat(FormatProvider, format, args);
        }
    }
}
