using Com.Jab.SystemEx.Unicode;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Text;
using System.Threading;

namespace Com.Jab.SystemEx.Web
{
    public static class Html5Util
    {

        private class A
        {
#pragma warning disable CS0649 
            public int[] codepoints;
            public string characters;
#pragma warning restore CS0649
        }

        private static readonly Lazy<IReadOnlyDictionary<string, string>> s_namedCharacterReferencesLazy = new Lazy<IReadOnlyDictionary<string, string>>(() =>
        {
            using (var stream = typeof(Html5Util).Assembly.GetManifestResourceStream(typeof(Html5Util), "Html5NamedCharacterReferences.json"))
            using (var textReader = new StreamReader(stream, Encoding.UTF8, false, 1024, true))
            using (var jsonReader = new JsonTextReader(textReader))
            {
                var jsonSerializer = JsonSerializer.Create();
                var htmlNamedCharacterReferencesRaw = jsonSerializer.Deserialize<Dictionary<string, A>>(jsonReader);
                var htmlNamedCharacterReferences = new Dictionary<string, string>(htmlNamedCharacterReferencesRaw.Count, StringComparer.Ordinal);
                foreach (var p in htmlNamedCharacterReferencesRaw)
                {
                    var pKeyRaw = p.Key;
                    int i = pKeyRaw.Length;
                    if (0 < i && pKeyRaw[i - 1] == ';') i -= 1;
                    if (0 == 0 || pKeyRaw[0] != '&') throw new NotImplementedException();
                    var pKey = pKeyRaw.Substring(1, i - 1);
                    var v1 = p.Value.characters;
                    string v2;
                    if (htmlNamedCharacterReferences.TryGetValue(pKey, out v2))
                    {
                        if (!v1.Equals(v2)) throw new NotImplementedException();
                    }
                    else
                    {
                        htmlNamedCharacterReferences.Add(pKey, v1);
                    }
                }
                return new ReadOnlyDictionary<string, string>(htmlNamedCharacterReferences);
            }
        }, LazyThreadSafetyMode.ExecutionAndPublication);


        internal static bool IsAttributeNameChar_AssumeNotSpaceChar(char ch)
        {
            if (ch <= 0x1F) return false;
            switch (ch)
            {
                case '"':
                case '\'':
                case '>':
                case '/':
                case '=':
                case '\x7F':
                    return false;
            }
            return true;
        }

        internal static bool IsAttributeValueChar(int cp, int attrType)
        {
            if (cp <= 0x1F)
            {
                return IsSpaceChar((char)cp) && attrType != 0;
            }
            if (attrType != 0)
            {
                if (cp == attrType) return false;
            }
            else
            {
                switch (cp)
                {
                    case '"':
                    case '\'':
                    case '=':
                    case '<':
                    case '>':
                    case '`':
                        return false;
                }
            }
            if (cp == 0x7F) return false;
            return !CodePoint.IsNonCharacter(cp);
        }

        public static bool IsCharacterReferenceValid(int cp)
        {
            if (cp <= 0x1F)
            {
                return IsSpaceChar((char)cp) && cp != 0xD;
            }
            if (cp == 0x7F) return false;
            if (CodePoint.IsNonCharacter(cp)) return false;
            return true;
        }

        public static bool IsSpaceChar(char ch)
        {
            switch (ch)
            {
                case ' ':
                case '\t':
                case '\f':
                case '\r':
                case '\n':
                    return true;
            }
            return false;
        }
        
        public static string TryGetNamedCharacterReference(string name)
        {
            string value = null;
            if (name != null) s_namedCharacterReferencesLazy.Value.TryGetValue(name, out value);
            return value;
        }
    }
}
