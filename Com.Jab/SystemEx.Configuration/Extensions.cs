using System.Collections.Specialized;
using System.Configuration;
using System.Linq;

namespace Com.Jab.SystemEx.Configuration
{
    public static class Extensions
    {

        public static bool? GetBooleanOptional(this NameValueCollection nvc, string key)
        {
            var va1 = nvc.GetValues(key);
            if (va1 != null)
            {
                var va2 = va1.Select(v_str =>
                {
                    bool v_parsed;
                    if (bool.TryParse(v_str, out v_parsed))
                    {
                        return v_parsed ? 1 : 0;
                    }
                    return -1;
                });
                if (va2.Any(i => i < 0)) throw new ConfigurationErrorsException();
                var va3 = va2.Select(v_i => v_i != 0).Distinct();
                int va3_count = va3.Count();
                if (0 < va3_count)
                {
                    if (va3_count != 1) throw new ConfigurationErrorsException();
                    return va3.First();
                }
            }
            return null;
        }

        public static bool GetBooleanRequired(this NameValueCollection nvc, string key, bool defaultValue)
        {
            var v = nvc.GetBooleanOptional(key);
            if (v != null) return (bool)v;
            return defaultValue;
        }


    }
}
