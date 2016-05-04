(function () {

    setOwnSrcPropsOnDst({
        setLocation_pathAndQuery: function (value) {
            var cp_uriOld, cp_uriNew;
            var cp_uri_scheme;
            var cp_uri_fragment;
            var cp_uri_authority;
            var hostLoc;
            var i;
            if (typeof value !== "string") throw Error();
            hostLoc = this.getHostContext().location;
            cp_uri_scheme = hostLoc.protocol;
            i = cp_uri_scheme.length;
            if (0 < i && cp_uri_scheme.charAt(i - 1) === ":") {
                cp_uri_scheme = cp_uri_scheme.substring(0, i - 1);
            }
            cp_uriOld = hostLoc.href;
            cp_uri_authority = uri_getAuthority(cp_uriOld);
            if (uri_getAuthority !== null) {
                cp_uriNew = cp_uri_scheme + "://" + cp_uri_authority;
                if (0 < value.length && value.charAt(0) !== "/") throw Error();
            } else {
                cp_uriNew = cp_uri_scheme + ":";
            }
            if (0 <= value.indexOf("#")) throw Error();
            cp_uri_fragment = hostLoc.hash;
            i = cp_uri_fragment.length;
            if (0 < i && cp_uri_fragment.charAt(0) === "#") {
                cp_uri_fragment = cp_uri_fragment.substring(1);
                i -= 1;
            }
            cp_uriNew += value;
            if (0 < i) {
                cp_uriNew += "#" + cp_uri_fragment;
            }
            hostLoc.href = cp_uriNew;
        }
    }, HostUtilities.prototype);


})();