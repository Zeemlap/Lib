(function () {
    var hasOwnPropertyFunction = Object.prototype.hasOwnProperty;
    var posInfDouble = 1 / 0;
    var http11_isTokenCharTable = http11_createIsTokenCharTable();
    function http11_createIsTokenCharTable() {
        var i, t;
        t = {};
        for (i = 0x21; i <= 0x7A; i++) {
            if (http11_isTokenChar_logic(i)) {
                t[i] = 1;
            }
        }
        return t;
    }
    function http11_isTokenChar(cp) {
        return hasOwnPropertyFunction.call(http11_isTokenCharTable, cp);
    }
    function http11_isTokenChar_logic(cp) {
        if (cp === 0x21) return true;
        if (0x23 <= cp && cp <= 0x27) return true;
        if (cp === 0x2A || cp === 0x2B) return true;
        if (cp === 0x2D || cp === 0x2E) return true;
        if (0x30 <= cp && cp <= 0x39) return true;
        if (0x41 <= cp && cp <= 0x5A) return true;
        if (0x5E <= cp && cp <= 0x7A) return true;
        return false;
    }
    function http11_parseToken(s, i) {
        var iBegin;
        iBegin = i;
        if (!http11_isTokenChar(s.charCodeAt(i))) throw Error();
        while (++i < s.length && http11_isTokenChar(s.charCodeAt(i)));
        return s.substring(iBegin, i);
    }
    function http11_parseQuotedString(s, i) {
        var cp, v;
        // We may assume s.charAt(i) === '"'.
        if (++i === s.length) throw Error();
        v = "";
        outer: while (true) {
            cp = s.charCodeAt(i);
            switch (cp) {
                case 0x09:
                case 0x20:
                case 0x21:
                    break;
                case 0x5C:
                    /// bla
                    if (++i === s.length) throw Error();
                    cp = s.charCodeAt(i);
                    if (cp < 0x21) {
                        if (cp !== 0x09 && cp !== 0x20) throw Error();
                    } else {
                        if (cp === 0x7F || 0xFF < cp) throw Error();
                    }
                    break;
                case 0x7F:
                    break outer;
                default:
                    if (0x23 <= cp && cp <= 0xFF) break;
                    break outer;
            }
            v += s.charAt(i);
            if (++i === s.length) break;
        }
        if (i === s.length || s.charCodeAt(i) !== 0x22) throw Error();
        return v;
    }
    function http11_trimLws(s) {
        return s.replace(/^(?:(?:\r\n)?[ \t]+)+|(?:(?:\r\n)?[ \t]+)+$/g, "");
    }
    function http11_countOws(s, i, iEnd) {
        var cp, iBegin;
        iBegin = i;
        while (i < iEnd) {
            cp = s.charCodeAt(i);
            if (cp !== 0x20 && cp !== 0x9) break;
            i += 1;
        }
        return i - iBegin;
    }
    function parseHeaders(headersConcat) {
        var i, j, headerName, headerName_lc;
        var headerValuesFromName;
        var headerValues;
        var headerValue;
        var k;
        i = 0;
        headerValuesFromName = {};
        while (true) {
            j = headersConcat.indexOf(":", i);
            if (j < 0) throw Error();
            headerName = headersConcat.substring(i, j);
            if (!/^(?:!|[#-']|\*|\+|-|\.|[0-9]|[A-Z]|[\^-z]|\||~)+$/.test(headerName)) throw Error();
            k = j + 1;
            while (true) {
                i = headersConcat.indexOf("\r\n", k);
                if (i < 0) throw Error();
                if (i + 2 === headersConcat.length) break;
                k = headersConcat.charCodeAt(i + 2);
                if (k !== 32 && k !== 9) break;
                k = i + 3;
            }
            headerName_lc = headerName.toLowerCase();
            headerValue = http11_trimLws(headersConcat.substring(j + 1, i));
            headerValues = getOwnProperty(headerValuesFromName, headerName_lc);
            if (headerValues === undefined) headerValuesFromName[headerName_lc] = headerValues = [];
            headerValues[headerValues.length] = headerValue;
            i += 2;
            if (i === headersConcat.length) break;
        }
        return headerValuesFromName;
    }
    function MediaType(s) {
        var m, i, j, paramName, paramVal;
        m = /^((?:!|[#-']|\*|\+|-|\.|[0-9]|[A-Z]|[\^-z]|\||~)+)\/((?:!|[#-']|\*|\+|-|\.|[0-9]|[A-Z]|[\^-z]|\||~)+)/.exec(s);
        if (m === null) throw Error();
        this.__type = m[1].toLowerCase();
        this.__subtype = m[2].toLowerCase();
        i = this.__type.length + 1 + this.__subtype.length;
        this.__params = [];
        while (true) {
            j = s.indexOf(";", i);
            if (j < 0) {
                if (i !== s.length) throw Error();
                break;
            }
            if (http11_countOws(s, i, j) < j - i) throw Error();
            j += 1;
            j += http11_countOws(s, j, s.length);
            i = s.indexOf("=", j);
            if (i < 0) throw Error();
            paramName = s.substring(j, i);
            if (!/^(?:!|[#-']|\*|\+|-|\.|[0-9]|[A-Z]|[\^-z]|\||~)+$/.test(paramName)) throw Error();
            i += 1;
            if (i === s.length) throw Error();
            m = s.charCodeAt(i);
            if (m === 0x22) { // Double quote...
                paramVal = http11_parseQuotedString(s, i + 1);
                i += 2;
            } else {
                paramVal = http11_parseToken(s, i);    
            }
            i += paramVal.length;
            paramName = paramName.toLowerCase();
            this.__params.push({ key: paramName, value: paramVal });
            if (i === s.length) break;
        }
    }
    MediaType.prototype = {
        constructor: MediaType,
        getSubtype: function() { return this.__subtype; },
        getType: function () { return this.__type; },  
        getParameters: function () {
            var a, i, n;
            a = this.__params.slice(0);
            for (i = 0, n = a.length; i < n; i++) {
                a[i] = setOwnSrcPropsOnDst(a[i], {});
            }
            return a;
        }
    };

    function HttpContent() { }
    HttpContent.prototype = {
        constructor: HttpContent,
        __sendWithHostHttpRequest: function (hostHttpRequest) {
            hostHttpRequest.send();
        }
    };
    function HttpContentUrlEncodedForm() {
        HttpContent.call(this);
        this.__urlEncodedForm = "";
    }
    HttpContentUrlEncodedForm.prototype = setOwnSrcPropsOnDst({
        constructor: HttpContentUrlEncodedForm,
        append: function (key, value) {
            var s1, s2;
            if (typeof key !== "string" || key.length === 0 || typeof value !== "string") throw Error();
            s1 = this.__urlEncodedForm;
            s2 = encodeURIComponent(key) + "=" + encodeURIComponent(value);
            this.__urlEncodedForm = (s1.length === 0
                ? s2
                : s1 + "&" + s2);
        },
        __sendWithHostHttpRequest: function (hostHttpRequest) {
            var i;
            i = this.__urlEncodedForm;
            hostHttpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            hostHttpRequest.send(i);                                   
        }
    }, Object.create(HttpContent.prototype));

    var httpMethod_shouldExpectContent_mask = 2;
    var httpMethod_get = 4;
    var httpMethod_post = 8 | httpMethod_shouldExpectContent_mask;
    var httpMethod_head = 12;
    var httpMethod_parse = { "GET": httpMethod_get, "POST": httpMethod_post, "HEAD": httpMethod_head };
    var httpMethod_toString = {};
    
    var httpRequest_packedData_httpMethod_mask = 0;
    (function () {
        var pn, i, n, j;
        pn = Object.getOwnPropertyNames(httpMethod_parse);
        for (n = pn.length, i = 0 ; i < n; i++) {
            j = httpMethod_parse[pn[i]];
            httpMethod_toString[j] = pn[i];
            httpRequest_packedData_httpMethod_mask |= j;
        }
    })();
    // packed data layout
    // mask         description
    // 3F 00 00 00  maximum retry count
    // 00 FC 00 00  current retry count
    // 00 03 80 00  HTTP completion status
    // 00 00 7F C0  unused
    // 00 00 00 3E  HTTP method
    // 00 00 00 01  abort requested flag

    var httpCompletionStatus_notSent = 0x00000;
    var httpCompletionStatus_inProgress = 0x08000;
    var httpCompletionStatus_aborted = 0x10000;
    var httpCompletionStatus_timedOut = 0x18000;
    var httpCompletionStatus_receivedResponse = 0x20000;
    var httpCompletionStatus_mask = 0x38000;

    function HttpRequest() {
        this.__timeout = posInfDouble;
        this.__timeout_task = null;
        this.__hostHttpRequest = null;
        this.__hostHttpRequest_onReadyStateChangeFunction = null;
        this.__uri = null;
        this.__content = null;
        this.__packedData = 0;

        this.__responseHeaderValuesFromName = null;

        this.__retry_task = null;
        this.__retry_delay = 300;
        this.setMaxRetryCount(2);
        ObjectWithEvents.call(this);
    }
    HttpRequest.prototype = Object.create(ObjectWithEvents.prototype);
    setOwnSrcPropsOnDst({
        constructor: HttpRequest,
        abort: function () {
            if (this.__getHttpCompletionStatus() !== httpCompletionStatus_inProgress) return;
            // The native HTTP request may be null if there is a positive retry delay configured.
            this.__abortCommon();
            this.__completeCommon(httpCompletionStatus_aborted);
        },
        __abortCommon: function () {
            if (this.__hostHttpRequest !== null) {
                this.__hostHttpRequest.onreadystatechange = null;
                this.__hostHttpRequest.abort();
                this.__hostHttpRequest = null;
            } else if (this.__retry_task !== null) {
                this.__retry_task.dispose();
                this.__retry_task = null;
            }
        },
        __completeCommon: function (httpCompletionStatus) {
            this.__setHttpCompletionStatus(httpCompletionStatus);
            if (this.__timeout_task !== null) {
                this.__timeout_task.dispose();
                this.__timeout_task = null;
            }
            this.raiseEvent("completed", EventArgs.getEmpty());
        },
        __createAndSendHostHttpRequest: function () {
            this.__hostHttpRequest = HostUtilities.fromHostContext(window).createHttpRequest();
            this.__hostHttpRequest.open(
                this.getHttpMethod(),
                this.__uri,
                true);
            this.__hostHttpRequest.onreadystatechange = this.__hostHttpRequest_onReadyStateChangeFunction;
            if (this.__content !== null) {
                this.__content.__sendWithHostHttpRequest(this.__hostHttpRequest);
            } else {
                this.__hostHttpRequest.send();
            }
        },
        getContent: function () {
            return this.__content;
        },
        __getCurRetryCount: function () {
            return (this.__packedData & 0x00FC0000) >> 18;
        },
        __getHttpCompletionStatus: function () {
            return this.__packedData & httpCompletionStatus_mask;
        },
        getHttpMethod: function() {
            return httpMethod_toString[this.__getHttpMethod()];
        },
        __getHttpMethod: function() {
            return this.__packedData & httpRequest_packedData_httpMethod_mask;
        },
        getIsSuccessStatusCode: function () {
            var statusCode = this.getStatusCode();
            return 200 <= statusCode && statusCode < 300;
        },
        __getMaxRetryCount: function () {
            return (this.__packedData & 0x3F000000) >> 24;
        },
        getResponse: function () {
            var contentTypeRaw;
            var contentType;
            if (this.__getHttpCompletionStatus() !== httpCompletionStatus_receivedResponse) return null;
            contentTypeRaw = this.__getResponseHeaderValueRaw("content-type");
            contentType = null;
            if (contentTypeRaw !== null) {
                if (contentTypeRaw.length !== 1) throw Error();
                contentType = new MediaType(contentTypeRaw[0]);
            }
            if (contentType !== null) {
                switch (contentType.getType() + "/" + contentType.getSubtype()) {
                    case "application/json":
                        return JSON.parse(this.__hostHttpRequest.responseText);
                }
            }
            return null;
        },
        __getResponseHeaderValueRaw: function (name) {
            var valuesFromName;
            valuesFromName = this.__responseHeaderValuesFromName;
            if (valuesFromName === null) {
                valuesFromName = parseHeaders(this.__hostHttpRequest.getAllResponseHeaders());
                this.__responseHeaderValuesFromName = valuesFromName;
            }
            if (hasOwnPropertyFunction.call(valuesFromName, name)) {
                return valuesFromName[name];
            }
            return null;
        },
        getRetryDelay: function() {
            return this.__retry_delay;
        },
        getStatusCode: function () {
            if (this.__getHttpCompletionStatus() === httpCompletionStatus_receivedResponse) {
                return this.__hostHttpRequest.status;
            }
            return null;
        },
        getUri: function () {
            return this.__uri;
        },
        __hostHttpRequest_onReadyStateChange: function () {
            var n, curRetryCount;
                n = this.__hostHttpRequest;
                switch (n.readyState) {
                    case 4:
                        break;
                    default:
                        return;
                }
            try {
                if (n.status === 500) {
                    // Try again if there is an internal server error. 
                    // We assume that if the programmer did a good job, an error will only occur sporadically.
                    // This may seem like a weird assumption, but it is actually not a bad one.
                    curRetryCount = this.__getCurRetryCount();
                    if (curRetryCount < this.__getMaxRetryCount() && this.__retry_delay !== posInfDouble) {
                        if (0 < this.__retry_delay) {
                            this.__retry_task = HostUtilities.fromHostContext(window).runTaskAfterElapsedTime(this.__retry_delay, this.__onDelayedRetry, this);
                            this.__setCurRetryCount(curRetryCount + 1);
                        } else {
                            this.__createAndSendHostHttpRequest();
                        }
                        return;
                    }
                }
                this.__completeCommon(httpCompletionStatus_receivedResponse);
            } catch (e) {
                throw e;
            } finally {
                ObjectWithEvents.__resetDataInExtensionsForEvents();
            }
        },
        __onDelayedRetry: function () {
            this.__retry_task = null;
            this.__createAndSendHostHttpRequest();
        },
        __onTimeout: function () {
            // The native HTTP request may be null if there is a positive retry delay is configured.
            this.__abortCommon();
            this.__completeCommon(httpCompletionStatus_timedOut);
        },
        send: function () {
            var httpMethod;
            if (this.__getHttpCompletionStatus() !== httpCompletionStatus_notSent) return;
            if (this.__uri === null) {
                throw Error();
            }
            httpMethod = this.__getHttpMethod();
            if (httpMethod === 0) {
                this.__packedData |= (this.__content !== null ? httpMethod_post : httpMethod_get);
            } else if ((httpMethod & httpMethod_shouldExpectContent_mask) !== (this.__content !== null)) {
                throw Error();
            }
            if (this.__timeout === 0) {
                this.__setHttpCompletionStatus(httpCompletionStatus_timedOut);
                return;
            }
            this.__setHttpCompletionStatus(httpCompletionStatus_inProgress);
            this.raiseEvent("sending", EventArgs.getEmpty());
            if (this.__timeout < 1 / 0) {
                this.__timeout_task = HostUtilities.fromHostContext(window).runTaskAfterElapsedTime(this.__timeout, this.__onTimeout, this);
            }
            this.__hostHttpRequest_onReadyStateChangeFunction = this.__hostHttpRequest_onReadyStateChange.bind(this);
            this.__createAndSendHostHttpRequest();
        },
        setContent: function (value) {
            if (this.__getHttpCompletionStatus() !== httpCompletionStatus_notSent) throw Error();
            if (!(value instanceof HttpContent)) throw Error();
            this.__content = value;
        },
        __setCurRetryCount: function (value) {
            if (!(isIntegralDouble_nonNegative(value) && value < 0x40)) {
                throw Error();
            }
            this.__packedData = (this.__packedData & ~0x00FC0000) | (value << 18);
        },
        __setHttpCompletionStatus: function (value) {
            switch (value) {
                case httpCompletionStatus_aborted:
                case httpCompletionStatus_receivedResponse:
                case httpCompletionStatus_inProgress:
                case httpCompletionStatus_notSent:
                case httpCompletionStatus_timedOut:
                    break;
                default:
                    throw Error();
            }
            this.__packedData = (this.__packedData & ~httpCompletionStatus_mask) | value;
        },
        setHttpMethod: function (value) {
            if (this.__getHttpCompletionStatus() !== httpCompletionStatus_notSent) throw Error();
            if (typeof value !== "string") throw Error();
            value = value.toUpperCase();
            if (!hasOwnProperty(httpMethod_parse, value)) throw Error();
            this.__packedData = (this.__packedData & ~httpRequest_packedData_httpMethod_mask) | httpMethod_parse[value];
        },
        setMaxRetryCount: function (value) {
            if (this.__getHttpCompletionStatus() !== httpCompletionStatus_notSent) throw Error();
            if (!(isIntegralDouble_nonNegative(value) && value < 0x40)) throw Error();
            this.__packedData = (this.__packedData & ~0x3F000000) | (value << 24);
        },
        setRetryDelay: function (value) {
            if (this.__getHttpCompletionStatus() !== httpCompletionStatus_notSent) throw Error();
            if (!isIntegralDouble_nonNegative(value)) throw Error();
            this.__retry_delay = value;
        },
        setTimeout: function (value) {
            if (this.__getHttpCompletionStatus() !== httpCompletionStatus_notSent) throw Error();
            if (typeof value !== "number" || !(0 <= value)) throw Error();
            this.__timeout = value;
        },
        setUri: function (value) {
            if (this.__getHttpCompletionStatus() !== httpCompletionStatus_notSent) throw Error();
            if (typeof value !== "string") throw Error();
            this.__uri = value;
        }
    }, HttpRequest.prototype);
    EventClass.register(HttpRequest, "sending");
    EventClass.register(HttpRequest, "completed");


    var getOptionOnce = JsonMarkup.getOptionOnce;
    var INTERNAL_SENTINEL = http11_isTokenCharTable;
    JsonMarkup.__addType("HttpRequest", HttpRequest, "ObjectWithEvents", function (instance, options) {
        var i;
        if ((i = getOptionOnce(options, "timeout", INTERNAL_SENTINEL)) !== INTERNAL_SENTINEL) instance.setTimeout(i);
        if ((i = getOptionOnce(options, "httpMethod", INTERNAL_SENTINEL)) !== INTERNAL_SENTINEL) instance.setHttpMethod(i);
        if ((i = getOptionOnce(options, "uri", INTERNAL_SENTINEL)) !== INTERNAL_SENTINEL) instance.setUri(i);
        if ((i = getOptionOnce(options, "content", INTERNAL_SENTINEL)) !== INTERNAL_SENTINEL) {
            instance.setContent(isObject(i) && !(i instanceof HttpContent)
                ? JsonMarkup.convertToObject(i, "HttpContent")
                : i);
        }
        if ((i = getOptionOnce(options, "maxRetryCount", INTERNAL_SENTINEL)) !== INTERNAL_SENTINEL) instance.setMaxRetryCount(i);
        if ((i = getOptionOnce(options, "retryDelay", INTERNAL_SENTINEL)) !== INTERNAL_SENTINEL) instance.setRetryDelay(i);
    }, function (instance, options) {
        var i, autoSend;
        autoSend = true;
        if ((i = getOptionOnce(options, "autoSend", INTERNAL_SENTINEL)) !== INTERNAL_SENTINEL) {
            if (typeof i !== "boolean") throw Error();
            autoSend = i;
        }
        for (i in options) if (hasOwnPropertyFunction.call(options, i)) {
            throw Error();
        }
        if (autoSend) {
            instance.send();
        }
    });

    function httpContent_parameterValue_canFormUrlEncode(value) {
        return typeof value === "string";
    }
    JsonMarkup.__addType("HttpContent", null, null, function (options) {
        var key, value;
        var option;
        var i, n;
        var httpContent;
        httpContent = new HttpContentUrlEncodedForm();
        if (!isArray(options)) {
            for (key in options) if (hasOwnPropertyFunction.call(options, key)) {
                value = options[key];
                if (!httpContent_parameterValue_canFormUrlEncode(value)) throw Error();
                httpContent.append(key, value);
            }
            for (key in options) if (hasOwnPropertyFunction.call(options, key)) {
                delete options[key];
            }                                                   1
        } else {
            for (i = 0, n = options.length; i < n; i++) {
                option = options[i];
                if (!isObject(option)) throw Error();
                for (key in option) if (hasOwnPropertyFunction.call(option, key)) {
                    switch (key) {
                        case "key":
                        case "value":
                            break;
                        default:
                            throw Error();
                    }
                    if (!httpContent_parameterValue_canFormUrlEncode(option[key])) throw Error();
                }
                httpContent.append(option.key, option.value);
            }
            options.length = 0;
        }
        return httpContent;
    });


    setOwnSrcPropsOnDst({
        HttpRequest: HttpRequest,
        HttpContent: HttpContent,
        HttpContentUrlEncodedForm: HttpContentUrlEncodedForm,
        MediaType: MediaType
    }, window);
})();