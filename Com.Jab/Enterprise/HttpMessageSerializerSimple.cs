using Com.Jab.Ex.System;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace Com.Jab.Enterprise
{
    public class HttpMessageSerializerSimple : IHttpMessageSerializer
    {
        private static void DeserializeHeaders(HttpHeaders r, BinaryReader br)
        {
            int n = br.ReadInt32();
            for (int i = 0; i < n; i++)
            {
                string headerName = br.ReadString();
                br.BaseStream.AlignRead(4);
                int headerValueCount = br.ReadInt32();
                for (int j = 0; j < headerValueCount; j++)
                {
                    string headerValue = br.ReadString();
                    br.BaseStream.AlignRead(4);
                    r.Add(headerName, headerValue);
                }
            }
        }

        private static void SerializeHeaders(HttpHeaders r1, BinaryWriter bw)
        {
            var r2 = r1.ToList();
            int n = r2.Count;
            bw.Write(n);
            for (int i = 0; i < n; i++)
            {
                bw.Write(r2[i].Key);
                bw.BaseStream.AlignWrite(4);
                var headerValues = r2[i].Value.ToList();
                int headerValueCount = headerValues.Count;
                bw.Write(headerValueCount);
                for (int j = 0; j < headerValueCount; j++)
                {
                    bw.Write(headerValues[j]);
                    bw.BaseStream.AlignWrite(4);
                }
            }
        }

        private static KeyValuePair<string, string[]>[] DeserializeHeaders(BinaryReader br)
        {
            int headerCount = br.ReadInt32();
            KeyValuePair<string, string[]>[] headers = new KeyValuePair<string, string[]>[headerCount];
            for (int i = 0; i < headerCount; i++)
            {
                string headerName = br.ReadString();
                br.BaseStream.AlignRead(4);
                int headerValueCount = br.ReadInt32();
                string[] headerValues = new string[headerValueCount];
                for (int j = 0; j < headerValueCount; j++)
                {
                    headerValues[j] = br.ReadString();
                    br.BaseStream.AlignRead(4);
                }
                headers[i] = new KeyValuePair<string, string[]>(headerName, headerValues);
            }
            return headers;
        }

        private static async Task<DeserializationInfo<HttpContent>> DeserializeContentAsync(BinaryReader br, bool brBaseStream_maySteal)
        {
            HttpContent rContent;
            bool rContentOwnsStream = false;
            switch (br.ReadInt32())
            {
                case 0:
                    rContent = null;
                    break;
                case 1:
                    {
                        var rContentHeaders = DeserializeHeaders(br);
                        if (brBaseStream_maySteal)
                        {
                            rContent = new StreamContent(br.BaseStream);
                            rContentOwnsStream = true;
                        }
                        else
                        {
                            long bufferLenL = br.BaseStream.Length - br.BaseStream.Position;
                            int bufferLenI = checked((int)bufferLenL);
                            byte[] buffer = new byte[bufferLenI];
                            await br.BaseStream.ReadWhileAsync(buffer, 0, bufferLenI);
                            rContent = new ByteArrayContent(buffer);
                        }
                        for (int i = 0; i < rContentHeaders.Length; i++)
                        {
                            rContent.Headers.Add(rContentHeaders[i].Key, rContentHeaders[i].Value);
                        }
                    }
                    break;
                default:
                    throw new IOException();
            }
            return new DeserializationInfo<HttpContent>(rContent, rContentOwnsStream);
        }

        private static async Task SerializeContentAsync(HttpContent r, BinaryWriter bw)
        {
            if (r == null)
            {
                bw.Write(0);
                return;
            }
            var rType = r.GetType();
            if (rType == typeof(ByteArrayContent) || rType == typeof(StringContent) || rType == typeof(StreamContent))
            {
                bw.Write(1);
                SerializeHeaders(r.Headers, bw);
                await r.CopyToAsync(bw.BaseStream);
            }
            else
            {
                throw new ArgumentException();
            }
        }

        public async Task<DeserializationInfo<HttpResponseMessage>> DeserializeToResponseAsync(Stream s, bool s_maySteal)
        {
            BinaryReader br = null;
            HttpResponseMessage r = null;
            try
            {
                br = new BinaryReader(s, Encoding.UTF8, true);
                r = new HttpResponseMessage();

                int rVerMaj = br.ReadInt32();
                int rVerMin = br.ReadInt32();
                int rVerBuild = br.ReadInt32();
                int rVerRev = br.ReadInt32();
                if (0 <= rVerRev && rVerBuild < 0) throw new IOException();
                if (rVerBuild < 0) r.Version = new Version(rVerMaj, rVerMin);
                else if (0 <= rVerRev) r.Version = new Version(rVerMaj, rVerMin, rVerBuild, rVerRev);
                else r.Version = new Version(rVerMaj, rVerMin, rVerBuild);
                r.StatusCode = (HttpStatusCode)br.ReadInt32();
                if (br.ReadBoolean())
                {
                    r.ReasonPhrase = br.ReadString();
                }
                s.AlignRead(4);
                DeserializeHeaders(r.Headers, br);
                var rContentInfo = await DeserializeContentAsync(br, s_maySteal);
                r.Content = rContentInfo.Value;
                return new DeserializationInfo<HttpResponseMessage>(r, rContentInfo.ValueOwnsStream);
            }
            catch
            {
                r?.Dispose();
                throw;
            }
            finally
            {
                br?.Close();
            }
        }

        public async Task SerializeAsync(HttpResponseMessage r, Stream s)
        {
            if (r == null) throw new ArgumentNullException();
            using (var bw = new BinaryWriter(s, Encoding.UTF8, true))
            {
                bw.Write(r.Version.Major);
                bw.Write(r.Version.Minor);
                bw.Write(r.Version.Build);
                bw.Write(r.Version.Revision);
                bw.Write((int)r.StatusCode);
                var rp = r.ReasonPhrase;
                bw.Write(rp != null);
                if (rp != null) bw.Write(rp);
                s.AlignWrite(4);
                SerializeHeaders(r.Headers, bw);
                await SerializeContentAsync(r.Content, bw);
            }
        }
    }
}
