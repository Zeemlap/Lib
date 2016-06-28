using Com.Jab.Enterprise;
using Com.Jab.Enterprise.HtmlAgilityPack;
using Com.Jab.Ex.HtmlAgilityPack;
using Com.Jab.MediaImaging;
using Com.Jab.Ex.System;
using Com.Jab.Ex.System.Unicode;
using HtmlAgilityPack;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;

namespace Com.Jab.ImdbClient
{
    public class ImdbScraperClient : IImdbClient
    {
        private class ImdbTitleSearchResultCollection_JsonConverter : JsonConverter
        {
            public override bool CanConvert(Type objectType)
            {
                return typeof(ImdbTitleSearchResultCollection_Json) == objectType;
            }

            public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
            {
                if (objectType != typeof(ImdbTitleSearchResultCollection_Json)) throw new ArgumentException();
                if (existingValue != null) throw new NotImplementedException();
                if (reader == null) throw new ArgumentException();
                if (reader.TokenType != JsonToken.StartObject) throw new JsonReaderException();
                var r = new ImdbTitleSearchResultCollection_Json();
                while (true)
                {
                    if (!reader.Read()) throw new JsonReaderException();
                    if (reader.TokenType == JsonToken.EndObject) break;
                    if (reader.TokenType != JsonToken.PropertyName) throw new JsonReaderException();
                    r.Keys.Add(reader.Value.ToString());
                    reader.Read();
                    r.Values.Add(serializer.Deserialize<List<ImdbTitleSearchResult_Json>>(reader));
                }
                reader.Read();
                return r;
            }

            public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
            {
                throw new NotImplementedException();
            }
        }

        private class ImdbTitleSearchResultCollection_Json
        {
            public List<string> Keys = new List<string>();
            public List<List<ImdbTitleSearchResult_Json>> Values = new List<List<ImdbTitleSearchResult_Json>>();
        }

        private class ImdbTitleSearchResult_Json
        {
#pragma warning disable CS0649 
            public string id;
            public string title;
            public string name;
            public string title_description;
            public string episode_title;
            public string description;
#pragma warning restore CS0649 
        }

        private ILogger m_logger;

        public ImdbScraperClient(string hostname, IHttpClient httpClient, ILogger logger, bool useHttps = false)
        {
            if (hostname == null) throw new ArgumentNullException();
            if (Uri.CheckHostName(hostname) == UriHostNameType.Unknown) throw new ArgumentException();
            if (httpClient == null) throw new ArgumentNullException();
            HttpClient = httpClient;
            Hostname = hostname;
            UseHttps = useHttps;
            m_logger = logger;
        }

        public IHttpClient HttpClient { get; }
        public string Hostname { get; }
        public bool UseHttps { get; }

        private string UrlBase
        {
            get
            {
                return $"{(UseHttps ? "https" : "http")}://{Hostname}";
            }
        }

        private static void ResetStreamDecompressed(
            ref Stream streamDecompressed, 
            ref bool streamLeaveOpen, 
            Stream stream, 
            string compression,
            long stream_start)
        {
            if (streamDecompressed != null)
            {
                if (streamDecompressed != stream)
                {
                    if (!streamLeaveOpen) throw new NotSupportedException();
                    streamDecompressed.Dispose();
                }
                streamDecompressed = null;
            }
            stream.Seek(stream_start, SeekOrigin.Begin);
            if (compression != null)
            {
                switch (compression)
                {
                    case "gzip":
                        streamDecompressed = new GZipStream(stream, CompressionMode.Decompress, true);
                        break;
                    case "deflate":
                        streamDecompressed = new GZipStream(stream, CompressionMode.Decompress, true);
                        break;
                    default:
                        throw new NotSupportedException();
                }
                streamLeaveOpen = true;
            }
            else
            {
                streamDecompressed = stream;
                streamLeaveOpen = false;
            }
        }

        public async Task<ImdbTitleCache> FindMostLikelyTitleAsync(int releasedYear, string q)
        {
            var uri = UrlBase + $"/xml/find?json=1&tt=on&q={HttpUtility.HtmlEncode(q)}";
            var responseHttpMsg = await HttpClient.SendWithRetriesAsync(
                () => Task.FromResult(new HttpRequestMessage(HttpMethod.Get, uri)),
                r => Task.FromResult(r));
            responseHttpMsg.EnsureSuccessStatusCode();

            var responseTextEncoding = HttpUtil.EncodingFromCharSet(responseHttpMsg.Content.Headers.ContentType?.CharSet);
            var responseCompression = responseHttpMsg.Content.Headers.ContentEncoding.SingleOrDefault();
            Stream responseStream = null;
            Stream responseStreamDecompressed = null;
            bool responseStreamLeaveOpen = true;
            long responseStream_start = 0L;
            try
            {
                responseStream = await responseHttpMsg.Content.ReadAsStreamAsync();
                responseStream_start = responseStream.Position;
                ResetStreamDecompressed(
                    ref responseStreamDecompressed, 
                    ref responseStreamLeaveOpen, 
                    responseStream, 
                    responseCompression,
                    responseStream_start);

                StreamReader responseTextReader = null;
                JsonTextReader responseJsonReader = null;
                try
                {
                    responseTextReader = new StreamReader(responseStreamDecompressed, responseTextEncoding, false, 1024, true);
                    responseJsonReader = new JsonTextReader(responseTextReader);
                    var jsonSerializer = new JsonSerializer();
                    jsonSerializer.Converters.Add(new ImdbTitleSearchResultCollection_JsonConverter());
                    return FindMostLikelyTitle_Json(releasedYear, jsonSerializer.Deserialize<ImdbTitleSearchResultCollection_Json>(responseJsonReader));
                }
                catch (JsonReaderException ex)
                {
                    if (1 <= ex.LineNumber && 1 <= ex.LinePosition)
                    {
                        m_logger?.Log(
                            messageFormat: "GET {0} returned unparsable JSON",
                            messageArgs: new object[] { uri, },
                            exception: ex);
                    }
                }
                finally
                {
                    if (responseJsonReader != null) responseJsonReader.Close();
                    else if (responseTextReader != null) responseTextReader.Close();
                }
                ResetStreamDecompressed(
                    ref responseStreamDecompressed, 
                    ref responseStreamLeaveOpen, 
                    responseStream, 
                    responseCompression,
                    responseStream_start);
                return GetTitle_Html(responseStreamDecompressed, responseTextEncoding);
            }
            finally
            {
                if (responseStreamDecompressed != null)
                {
                    responseStreamDecompressed.Close();
                }
                if ((responseStreamLeaveOpen || responseStreamDecompressed == null) && responseStream != null)
                {
                    responseStream.Close();
                }
            }
        }

        public async Task<MediaImage> GetPrimaryImageAsync(ImdbTitleCache imdbTitle)
        {
            if (imdbTitle == null) throw new ArgumentNullException();
            await EnsurePrimaryHtmlDocAsync(imdbTitle);
            var domElem_posterImg = imdbTitle.PrimaryHtmlDoc.QuerySelectorAll(".poster img").Single();
            var url_posterImg = domElem_posterImg.GetAttributeValue("src", null);
            if ((url_posterImg.StartsWith("http://")
                || url_posterImg.StartsWith("https://")) == false)
            {
                throw new NotImplementedException();
            }
            using (var request = new HttpRequestMessage(HttpMethod.Get, url_posterImg))
            {
                using (var response = await HttpClient.SendAsync(request))
                {
                    response.EnsureSuccessStatusCode();
                    var data = await response.Content.ReadAsByteArrayAsync();
                    return new MediaImage(data, 0, data.Length);
                }
            }
        }

        private async Task EnsurePrimaryHtmlDocAsync(ImdbTitleCache imdbTitle)
        {
            if (imdbTitle.Id == null) throw new ArgumentException();
            if (imdbTitle.PrimaryHtmlDoc != null) return;
            imdbTitle.PrimaryHtmlDoc = await HttpClient.SendWithRetriesAsync(
                () => HttpUtil.CreateGetHtmlRequestAsync($"{UrlBase}/title/{imdbTitle.Id}"),
                async r => await r.ReadAsHtmlDocumentAsync());
        }

        private async Task EnsureReleaseInfoHtmlDocAsync(ImdbTitleCache imdbTitle)
        {
            if (imdbTitle.Id == null) throw new ArgumentException();
            if (imdbTitle.ReleaseInfoHtmlDoc != null) return;
            try
            {
                imdbTitle.ReleaseInfoHtmlDoc = await HttpClient.SendWithRetriesAsync(
                    () => HttpUtil.CreateGetHtmlRequestAsync(UrlBase + $"/title/{HttpUtility.UrlEncode(imdbTitle.Id)}/releaseinfo"),
                    async r => await r.ReadAsHtmlDocumentAsync());
            }
            catch (Exception ex1)
            {
                var ex2 = ex1 as AggregateException;
                if (ex2 != null) throw new NotImplementedException();
                int statusCode = HttpUtil.GetStatusCode(ex1);
                if (404 == statusCode)
                {
                    throw new ArgumentException();
                }
                throw;
            }
        }

        private static ImdbTitleCache FindMostLikelyTitle_Json(int releasedYear, ImdbTitleSearchResultCollection_Json rc1)
        {
            if (releasedYear < 1000 || 9999 < releasedYear) throw new NotImplementedException();
            var rc4 = rc1
                .Values
                .SelectMany(rc2 => rc2)
                .OrderBy(r =>
                {
                    int i = 0;
                    var rDescr = r.description;
                    i = rDescr.TrimStartWhile(i, rDescr.Length, cp => unchecked((uint)(cp - '0')) <= 9u);
                    if (i != 4) return 2;
                    i = rDescr[0] - '0';
                    i = i * 10 + rDescr[1] - '0';
                    i = i * 10 + rDescr[2] - '0';
                    i = i * 10 + rDescr[3] - '0';
                    if (i == releasedYear)
                    {
                        return 0;
                    }
                    if (Math.Abs(i - releasedYear) < 1)
                    {
                        return 1;
                    }
                    return 2;
                });
            return rc4.Select(r => new ImdbTitleCache(r.id)).FirstOrDefault();
        }

        public async Task<List<ImdbAka>> GetAkasAsync(ImdbTitleCache imdbTitle)
        {
            if (imdbTitle == null) throw new ArgumentNullException();
            await EnsureReleaseInfoHtmlDocAsync(imdbTitle);
            var trList = imdbTitle.ReleaseInfoHtmlDoc.QuerySelectorAll("table#akas > tbody > tr, table#akas > tr");
            var imdbAkaList = trList.Select(tr =>
            {
                var tdList = tr.ChildNodes.Where(n => n.NodeType == HtmlNodeType.Element).ToList();
                if (tdList.Count != 2 || !tdList.Any(n => "td".Equals(n.OriginalName, StringComparison.OrdinalIgnoreCase)))
                {
                    throw new NotImplementedException();
                }
                var imdbAkaStr = tdList[0].InnerText;
                int i1 = imdbAkaStr.IndexOf('(');
                if (i1 < 0) i1 = imdbAkaStr.Length;
                i1 = imdbAkaStr.TrimEndWhile(0, i1, cp => CodePoint.IsWhiteSpace(cp));
                var reWord = new Regex("\\p{L}+");
                var geoRegionWords = reWord.Matches(imdbAkaStr.Substring(0, i1)).Cast<Match>().Select(m1 => m1.Value).ToList();
                var geoRegion = string.Join(" ", geoRegionWords);
                if (geoRegion == "USA")
                {
                    geoRegionWords = new List<string>() { "United", "States", };
                    geoRegion = "United States";
                }
                string strConst_title = "title";
                var m2 = new Regex(@"(?:\s*\(([^\)]+)\))+").Match(imdbAkaStr, i1);
                var props1 = m2.Groups[1].Captures.Cast<Capture>().Select(c1 =>
                {
                    int i2 = c1.Index - strConst_title.Length + c1.Length;
                    bool cEndsWithTitle = strConst_title.Length <= imdbAkaStr.Length - i2
                        && string.Compare(imdbAkaStr, i2, strConst_title, 0, strConst_title.Length, StringComparison.OrdinalIgnoreCase) == 0;
                    if (!cEndsWithTitle) return c1.Value;
                    int i3 = imdbAkaStr.TrimEndWhile(c1.Index, i2, cp => CodePoint.IsWhiteSpace(cp));
                    return imdbAkaStr.Substring(c1.Index, i3 - c1.Index);
                }).ToList();

                var languages = props1.Where(s => char.IsUpper(char.ConvertFromUtf32(s.CodePoint(0)), 0)).ToList();
                var language = languages.FirstOrDefault();
                var props2 = props1.Except(new string[] { language, }, StringComparer.InvariantCultureIgnoreCase);
                var specCultureList = CultureInfo.GetCultures(CultureTypes.SpecificCultures).Where(c1 =>
                {
                    var cultureWords = new HashSet<string>(reWord
                        .Matches(c1.EnglishName)
                        .Cast<Match>()
                        .Select(m3 => m3.Value));
                    return cultureWords.IsSupersetOf(geoRegionWords)
                        && (language == null || cultureWords.Contains(language, StringComparer.InvariantCultureIgnoreCase));
                }).ToList();
                var imdbAka = new ImdbAka();
                imdbAka.Description = props2.SingleOrDefault();
                imdbAka.GeoRegionName = geoRegion != null && geoRegion.Length == 0 ? null : geoRegion;
                imdbAka.LanguageName = language;
                if (specCultureList.Count == 1)
                {
                    imdbAka.ComputedCulture = specCultureList[0];
                }
                imdbAka.Value = tdList[1].InnerText;
                return imdbAka;
            }).ToList();
            return imdbAkaList;
        }

        public async Task<string> GetPrimaryNameAsync(ImdbTitleCache imdbTitle)
        {
            if (imdbTitle == null) throw new ArgumentNullException();
            if (imdbTitle.PrimaryName != null) return imdbTitle.PrimaryName;
            await EnsureReleaseInfoHtmlDocAsync(imdbTitle);
            var bla1 = imdbTitle.ReleaseInfoHtmlDoc.QuerySelectorAll("#main a[href^='/title/tt']").FirstOrDefault();
            while ((bla1 = bla1.ParentNode) != null && !bla1.HasClass("subpage_title_block")) ;
            if (bla1 == null)
            {
                throw new NotImplementedException();
            }
            var bla2 = bla1.QuerySelectorAll("h3[itemprop='name'] a");
            var bla3 = bla2.Single().InnerText;
            if (bla3 == null)
            {
                throw new NotImplementedException();
            }
            imdbTitle.PrimaryName = bla3;
            return bla3;
        }

        public async Task<IntervalInt32> GetReleasedYearIntervalAsync(ImdbTitleCache imdbTitle, IntervalInt32 defaultValue)
        {
            if (imdbTitle == null) throw new ArgumentNullException();
            if (!imdbTitle.ReleasedYearInterval_IsInitialized) goto losing1;
            return imdbTitle.ReleasedYearInterval;
            losing1:
            await EnsureReleaseInfoHtmlDocAsync(imdbTitle);
            List<List<HtmlNode>> trList;
            {
                var doc = imdbTitle.ReleaseInfoHtmlDoc;
                var tab = doc.GetElementbyId("release_dates");
                trList = tab
                        .ChildNodes
                        .Where(n => n.NodeType == HtmlNodeType.Element
                            && "tbody".Equals(n.OriginalName, StringComparison.OrdinalIgnoreCase))
                        .Concat(new HtmlNode[] { tab, })
                        .SelectMany(tabOrTBody => tabOrTBody
                            .ChildNodes
                            .Where(n => n.NodeType == HtmlNodeType.Element
                                && "tr".Equals(n.OriginalName, StringComparison.OrdinalIgnoreCase)))
                        .Select(tr => tr
                            .ChildNodes
                            .Where(n => n.NodeType == HtmlNodeType.Element
                                && "td".Equals(n.OriginalName, StringComparison.OrdinalIgnoreCase)
                                && n.HasClass("release_date"))
                            .ToList())
                        .ToList();
            }
            short yearMin = short.MaxValue;
            short yearMax = short.MinValue;
            foreach (var tdList in trList)
            {
                if (tdList.Count != 1) goto losing2;
                var aList = tdList[0].QuerySelectorAll("a[href^=/year/]");
                if (aList.Count != 1) goto losing2;
                short year;
                if (!short.TryParse(aList[0].InnerText, NumberStyles.AllowLeadingWhite | NumberStyles.AllowTrailingWhite, NumberFormatInfo.InvariantInfo, out year))
                {
                    goto losing2;
                }
                if (year < yearMin) yearMin = year;
                if (yearMax < year) yearMax = year;
            }
            if (yearMax < yearMin) goto losing2;
            imdbTitle.ReleasedYearInterval = new IntervalInt32() { Min = yearMin, Max = yearMax, };
            imdbTitle.ReleasedYearInterval_IsInitialized = true;
            return imdbTitle.ReleasedYearInterval;
        losing2:
            imdbTitle.ReleasedYearInterval_IsInitialized = true;
            return defaultValue;
        }

        private static ImdbTitleCache GetTitle_Html(Stream stream, Encoding textEncoding)
        {

            var htmlDoc = new HtmlDocument();
            htmlDoc.Load(stream, textEncoding, true, 1024);
            var hostElem_meta = htmlDoc.QuerySelectorAll("meta[property=pageId]").SingleOrDefault();
            var imdbTitleId = hostElem_meta.GetAttributeValue("content", null);

            return new ImdbTitleCache(imdbTitleId)
            {
                PrimaryHtmlDoc = htmlDoc,
            };
        }
    }
}
