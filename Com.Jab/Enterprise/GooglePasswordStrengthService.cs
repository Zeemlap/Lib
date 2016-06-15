using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace Com.Jab.Enterprise
{
    public class GooglePasswordStrengthService : IPasswordStrengthService
    {
        public IHttpClient HttpClient { get; set; }

        public async Task<PasswordStrength> GetPasswordStrengthAsync(string password, TimeSpan timeout, CancellationToken cancellationToken = default(CancellationToken))
        {
            var uri = new Uri("https://accounts.google.com/RatePassword");
            var msg = new HttpRequestMessage(HttpMethod.Post, uri);
            msg.Content = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string,string>("Passwd", password),
            });
            var httpResponse = await HttpClient.SendAsync(msg, timeout, HttpCompletionOption.ResponseContentRead, cancellationToken);
            httpResponse.EnsureSuccessStatusCode();
            var passwordStrengthAsString = await httpResponse.Content.ReadAsStringAsync();
            int passwordStrengthAsInt32;
            if (!int.TryParse(passwordStrengthAsString, out passwordStrengthAsInt32) || passwordStrengthAsInt32 < 1 || 4 < passwordStrengthAsInt32)
            {
                throw new FormatException("Expected a response body containing an integer at least 1 and at most 4.");
            }
            return (PasswordStrength)passwordStrengthAsInt32;
        }
    }
}
