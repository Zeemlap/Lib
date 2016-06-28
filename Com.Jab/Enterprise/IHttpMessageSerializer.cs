using System.IO;
using System.Net.Http;
using System.Threading.Tasks;

namespace Com.Jab.Enterprise
{
    public interface IHttpMessageSerializer
    {
        // Set f to true to allow HttpResponseMessage to take ownership of Stream.
        // If f is true then HttpResponseMessage now owns s.
        Task<DeserializationInfo<HttpResponseMessage>> DeserializeToResponseAsync(Stream s, bool s_maySteal);
        Task SerializeAsync(HttpResponseMessage response, Stream s);
    }
}
