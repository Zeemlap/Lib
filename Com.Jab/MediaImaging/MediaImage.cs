using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Com.Jab.MediaImaging
{
    public class MediaImage : IDisposable
    {
        private MemoryStream m_dataStream;
        private Image m_image;
        private MediaImageFormat m_imageFormat;

        public MediaImage(byte[] data, int dataOffset, int dataSubarrayLength)
        {
            if (data == null)
            {
                throw new ArgumentNullException();
            }
            if (dataOffset < 0
                || dataSubarrayLength < 0)
            {
                throw new ArgumentOutOfRangeException();
            }
            if (data.Length - dataOffset < dataSubarrayLength)
            {
                throw new ArgumentException();
            }
            bool ex = true;
            try
            {
                m_dataStream = new MemoryStream(data, dataOffset, dataSubarrayLength, true, true);
                m_image = Image.FromStream(m_dataStream, false, true);
                ex = false;
            }
            finally
            {
                if (ex)
                {
                    if (m_image != null) m_image.Dispose();
                    else if (m_dataStream != null) m_dataStream.Dispose();
                }
            }
            m_imageFormat = (MediaImageFormat)(-1);
        }

        public MediaImageFormat ImageFormat
        {
            get
            {
                if (m_imageFormat != (MediaImageFormat)(-1)) return m_imageFormat;
                if (m_image.RawFormat == System.Drawing.Imaging.ImageFormat.Jpeg)
                {
                    return m_imageFormat = MediaImageFormat.Jpeg;
                }
                throw new NotImplementedException();
            }
        }

        public void Dispose()
        {
            m_image.Dispose();
        }
    }
}
