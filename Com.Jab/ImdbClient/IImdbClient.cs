using System.Collections.Generic;
using System.Threading.Tasks;
using Com.Jab.Enterprise;
using Com.Jab.Ex.System;
using Com.Jab.MediaImaging;

namespace Com.Jab.ImdbClient
{
    public interface IImdbClient
    {
        Task<ImdbTitleCache> FindMostLikelyTitleAsync(int releasedYear, string q);
        Task<List<ImdbAka>> GetAkasAsync(ImdbTitleCache imdbTitle);
        Task<MediaImage> GetPrimaryImageAsync(ImdbTitleCache imdbTitle);
        Task<string> GetPrimaryNameAsync(ImdbTitleCache imdbTitle);
        Task<IntervalInt32> GetReleasedYearIntervalAsync(ImdbTitleCache imdbTitle, IntervalInt32 defaultValue);
    }
}