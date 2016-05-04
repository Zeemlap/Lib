using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Com.Jab.LibEnterprise.GoogleServices
{
    public class GooglePasswordStrengthService : IPasswordStrengthService
    {
        public HttpClient HttpClient { get; set; }

        public async Task<PasswordStrength> GetPasswordStrengthAsync(string password, CancellationToken cancellationToken)
        {
            var uri = new Uri("https://accounts.google.com/RatePassword");
            var httpResponse = await HttpClient.PostAsync(uri, new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string,string>("Passwd", password),
            }), cancellationToken);
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
