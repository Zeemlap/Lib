(function () {
    var hasOwnPropertyFunction = Object.prototype.hasOwnProperty;
    var undefined;
    var minDouble = Math.min;
    var _oneOver100 = 1 / 100;
    var roundDouble = Math.round;
    var cssLengthUnits = { px: 1, em: 1 };
    var Guid_sizeOf_base16 = Guid.__sizeOf_base16;
    var __Matrix2D_IDENTITY = new Matrix2D();
    var regExpPattern_number = "(?:\\d+(?:\\.\\d*)?|\\d*\\.\\d+)(?:[eE][\\+-]?\d+)?";
    var regExp_cssPixelLength = new RegExp("^" + regExpPattern_number + "px?$");
    var regExp_cssMatrix2D = new RegExp("^matrix\(" + regExpPattern_number + "(?:," + regExpPattern_number + "){5}" + "\)$");
    var regExp_number = new RegExp("^" + regExpPattern_number + "$");
    function formatCssNumber(value) {
        var s;
        if (typeof value !== "number") throw Error();
        if (value < 0) {
            s = "-";
            value = -value;
        } else {
            s = "";
        }
        if (value < 1E-6) return "0";
        return s + (value < 1E21 ? value : "999999999999999900000");
    }
    function formatCssLength(value, unit) {
        if (typeof unit !== "string" || !hasOwnPropertyFunction.call(cssLengthUnits, unit)) throw Error();
        return formatCssNumber(value) + unit;
    }
    function parseMatrix2DFromCssString(s) {
        var i1, i2, a;
        if ((i1 = s.indexOf("(")) !== 6 || s.substring(0, 6) !== "matrix") return null;
        i2 = s.indexOf(")", i1 + 1);
        if (i2 !== s.length - 1) return null;
        a = s.substring(i1 + 1, i2).split(",");
        if (a.length !== 6) return null;
        return new Matrix2D(
            Number(a[0]),
            Number(a[1]),
            Number(a[2]),
            Number(a[3]),
            Number(a[4]),
            Number(a[5]));
    }
    function formatCssMatrix2D(value) {
        if (!(value instanceof Matrix2D)) throw Error();
        return "matrix("
            + value.getM11() + ","
            + value.getM12() + ","
            + value.getM21() + ","
            + value.getM22() + ","
            + value.getOffsetX() + ","
            + value.getOffsetY() + ")";
    }

    

    // The property transformOrigin is not supported and is assumed to be set to "0 0". Note that setTransform sets the hostElem's 
    // inlineStyle transformOrigin to "0 0".
    function HostComputedStyle() { }
    HostComputedStyle.prototype = {
        constructor: HostComputedStyle,
        get_parsed: function (propName) {
            if (typeof propName !== "string") throw Error();
            return this.__get_core(propName, true);
        },
        get_string: function (propName) {
            if (typeof propName !== "string") throw Error();
            return this.__get_core(propName, false);
        },
        __get_core: function(propName, shouldParse) { throw Error(); },
        __tryGet_raw: function (propName) { throw Error(); },
        __tryGetOpacity_core: function(shouldParse) {
            var v;
            if ((v = this.__tryGet_raw("opacity")) !== null) {
                if (regExp_number.test(v)) return shouldParse ? Number(v) : v;
                if (v.length !== 0) throw Error();
            }
            return null;
        },
        __tryGetTransform_core: function (shouldParse) {
            var v, m;
            if (!transformIsInitialized) transformInitialize();
            if (transformPropertyName !== null) {
                v = this.__tryGet_raw(transformPropertyName);
                assert(typeof v === "string");
                if (shouldParse) {
                    m = parseMatrix2DFromCssString(v);
                    if (m !== null) return m;
                } else {
                    if (regExp_cssMatrix2D.test(v)) return v;
                }
                if (v.length !== 0) throw Error();
            }
            return null;
        }
    };

    function HostComputedStyle_HostWrapperImpl(cs) {
        this.__cs = cs;
    }
    HostComputedStyle_HostWrapperImpl.prototype = setOwnSrcPropsOnDst({
        constructor: HostComputedStyle_HostWrapperImpl,
        __get_core: function (propName, shouldParse) {
            var v, m;
            switch (propName) {
                case "borderBottomWidth":
                case "borderLeftWidth":
                case "borderRightWidth":
                case "borderTopWidth":
                    v = this.__cs[propName];
                    if (typeof v !== "string") throw Error();
                    m = regExp_cssPixelLength.exec(v);
                    if (m !== null) return shouldParse ? Number(m[0]) : v;
                    if (v.length === 0) return shouldParse ? 0 : "0px";
                    throw Error();
                case "opacity":
                    v = this.__tryGetOpacity_core(shouldParse);
                    if (v !== null) return v;
                    return shouldParse ? 1 : "1";
                case "transform":
                    v = this.__tryGetTransform_core(shouldParse);
                    if (v !== null) return v;
                    return shouldParse ? __Matrix2D_IDENTITY.clone() : "matrix(1,0,0,1,0,0)";
                case "transformOrigin":
                    throw Error();
            }
            v = this.__tryGet_raw(propName);
            if (v === null) throw Error();
            return v;
        },
        __tryGet_raw: function (propName) {
            var v;
            v = this.__cs[propName];
            if (typeof v !== "string") return null;
            return v;
        }
    }, Object.create(HostComputedStyle.prototype));

    function HostComputedStyle_ComputedImpl(he) {
        this.__he = he;
    }
    HostComputedStyle_ComputedImpl.prototype = setOwnSrcPropsOnDst({
        constructor: HostComputedStyle_ComputedImpl,
        __getBorderWidth_parsed: function (side) {
            var he, he_cs;
            var obj1, obj2;
            var prop1Val_old, prop2Val_old;
            var prop1Name, prop2Name;
            var v;
            he = this.__he;
            he_cs = he.currentStyle;
            if (he_cs === null) return 0;
            prop1Name = "borderLeftWidth";
            prop2Name = "borderLeftStyle";
            obj1 = obj2 = he.runtimeStyle;
            v = !isObject(obj1);
            if (v || typeof (prop1Val_old = obj1[prop1Name]) !== "string") {
                obj1 = he.style;
                prop1Val_old = obj1[prop1Name];
            }
            if (v || typeof (prop2Val_old = obj2[prop2Name]) !== "string") {
                obj2 = he.style;
                prop2Val_old = obj2[prop2Name];
            }
            obj1[prop1Name] = he_cs["border" + side + "Width"];
            obj2[prop2Name] = he_cs["border" + side + "Style"];
            v = he.clientLeft;
            obj1[prop1Name] = prop1Val_old;
            obj2[prop2Name] = prop2Val_old;
            return v;
        },
        __get_core: function (propName, shouldParse) {
            var v;
            switch (propName) {
                case "borderBottomWidth":
                    v = this.__getBorderWidth_parsed("Bottom");
                    return shouldParse ? v : v + "px";
                case "borderLeftWidth":
                    v = this.__he.clientLeft;
                    return shouldParse ? v : v + "px";
                case "borderRightWidth":
                    v = this.__getBorderWidth_parsed("Right");
                    return shouldParse ? v : v + "px";
                case "borderTopWidth":
                    v = this.__he.clientTop;
                    return shouldParse ? v : v + "px";
                case "opacity":
                    v = this.__tryGetOpacity_core(shouldParse);
                    if (v !== null) return v;
                    v = this.__tryGetOpacity_filter_parsed();
                    if (v === null) v = 1;
                    return shouldParse ? v : v + "";
                case "transform":
                    v = this.__tryGetTransform_core(shouldParse);
                    if (v !== null) return v;
                    v = this.__tryGetTransform_filter_parsed();
                    if (v !== null) return shouldParse ? v : formatCssMatrix2D(v);
                    return shouldParse ? __Matrix2D_IDENTITY.clone() : "matrix(1,0,0,1,0,0)";
                case "transformOrigin":
                    throw Error();
            }
            v = this.__tryGet_raw(propName);
            if (v === null) throw Error();
            return v;
        },
        __tryGetOpacity_filter_parsed: function () {                                         
            var hostApiFilter;
            assert((this.__tryGet_raw("filter") !== null) === isObject(this.__he.filters));
            hostApiFilter = FilterUtilities_getHostApiFilters_firstOrDefault(this.__he, function (hostApiFilter, hostCssFilterName) {
                return hostCssFilterName === HostCssFilterName_alpha && hostApiFilter.enabled;
            }, null);
            if (hostApiFilter !== null) return hostApiFilter.Opacity * _oneOver100;
            return null;
        },
        __tryGetTransform_filter_parsed: function () {
            var hostCssFilterString, filterData;
            hostCssFilterString = this.__tryGet_raw("filter");
            if (hostCssFilterString !== null) {
                filterData = FilterUtilities_getFilterData(this.__he);
                if (filterData !== null && FilterUtilities_isHostFiltersApiTrustable2(hostCssFilterString, filterData.getStamp())) {
                    return filterData.getFilter(FilterTypeId_matrix).__getMatrix();
                }
                if (hostCssFilterString.length === 0) return __Matrix2D_IDENTITY;
                throw Error();
            }
            return null;
        },
        __tryGet_raw: function (propName) {
            var he, he_s;
            he = this.__he;
            he_s = he.currentStyle;
            if (he_s !== null) {
                v = he_s[propName];
                return typeof v !== "string"
                    ? null
                    : v;
            }
            he_s = he.style;
            return typeof he_s[propName] !== "string"
                ? null
                : "";
        }
    }, Object.create(HostComputedStyle_ComputedImpl.prototype));

    function HostElement_getComputedStyle(hostElement) {                                     
        var hostDocNode, hostContext, hostUtilities;
        if (!isHostElement(hostElement)) throw Error();
        hostDocNode = hostElement.ownerDocument;
        hostContext = hostDocNode.defaultView;
        HostUtilities.fromHostContext(hostContext);
        if (isObject(hostContext.getComputedStyle)) {
            return new HostComputedStyle_HostWrapperImpl(hostContext.getComputedStyle(hostElement, null));
        }
        return new HostComputedStyle_ComputedImpl(hostElement);
    }
    

    var hostSpecificPropertyPrefixes = HostUtilities.__hostSpecificPropertyPrefixes;
    var transformPropertyName;
    var transformOriginPropertyName;
    var transformIsInitialized = false;

    function transformInitialize() {
        var inlineStyle;
        var hostComputedStyle;
        var i;
        inlineStyle = hostElem.style;
        transformPropertyName = "transform";
        i = hostSpecificPropertyPrefixes.length;
        while (true) {
            if (typeof inlineStyle[transformPropertyName] === "string") {
                break;
            }
            if (--i < 0) {
                transformPropertyName = null;
                break;
            }
            transformPropertyName = hostSpecificPropertyPrefixes[i] + "Transform";
        }
        if (transformPropertyName !== null) {
            transformOriginPropertyName = transformPropertyName + "Origin";
            if (typeof inlineStyle[transformOriginPropertyName] !== "string") {
                transformOriginPropertyName = null;
            }
            inlineStyle[transformPropertyName] = "matrix(1,0,0,1,0,1)";
            if (transformOriginPropertyName !== null) {
                inlineStyle[transformOriginPropertyName] = "0 0";
            }
            hostComputedStyle = HostElement_getComputedStyle(testHostElem);
            if (transformOriginPropertyName !== null) {
                i = hostComputedStyle.__tryGet_raw(transformOriginPropertyName);
                if (i !== "0px 0px") {
                    inlineStyle[transformOriginPropertyName] = "";
                    transformOriginPropertyName = null;
                }
            }
            if (hostComputedStyle.__tryGet_raw(transformPropertyName) !== "matrix(1,0,0,1,0,1)") {
                transformPropertyName = null;
                transformOriginPropertyName = null;
            }
        }
        transformIsInitialized = true;
    }

    // Sets a transform on hostElem's inline style. To unset the inline style set value to null.
    // If value is not null and it's non-translation component cannot be set due to lack of a supporting property in the host (or limitations of this implementation) 
    // then value's non-translation component is interpreted as the identity matrix. This can be detected by getTransform returning a JavaScript value unequal (
    // by ValueType equality) to value. This is the only scenario in which getTransform is inconsistent with setTransform.
    // Returns a Vector2 representing the offset (in untransformed coordinate space) that must be applied to hostElem for it to be in its correct position. 
    // Null indicates a zero offset.
    // If value is null and hostElem's computed style transform becomes a non-identity matrix within this method call then offset will 
    // not be accurate.
    function HostElement_setTransform(hostElem, value) {
        var d;
        if (!isHostElement(hostElem)) throw Error();
        if (value !== null && !(value instanceof Matrix2D)) throw Error();
        if (!transformIsInitialized) transformInitialize(hostElem);
        if (transformPropertyName !== null) {
            if (value !== null) {
                if (transformOriginPropertyName !== null) {
                    inlineStyle[transformPropertyName] = formatCssMatrix2D(value);
                    inlineStyle[transformOriginPropertyName] = "0 0";
                } else {
                    throw Error();
                }
            } else {
                inlineStyle[transformPropertyName] = "";
                if (transformOriginPropertyName !== null) {
                    inlineStyle[transformOriginPropertyName] = "";
                }
            }
            return null;
        }
        if (typeof inlineStyle.filter === "string") {
            return HostElement_setTransform_filter(hostElem, value);
        }
        if (value !== null) {
            __HostObject_ensureData(hostElem).inlineStyleTransform = new Matrix2D(1, 0, 0, 1, value.getOffsetX(), value.getOffsetY());
            return new Vector2(value.getOffsetX(), value.getOffsetY());
        }
        d = __HostObject_getData(hostElem);
        if (d !== null) delete d.inlineStyleTransform;
        return null;
    }

    // Gets the transform on hostElem's inline style. See HostElement_setTransform.
    function HostElement_getTransform(hostElem) {
        var inlineStyle, value, s;
        if (!transformIsInitialized) return null;
        inlineStyle = hostElem.style;
        if (transformPropertyName !== null) {
            if (transformOriginPropertyName !== null && inlineStyle[transformOriginPropertyName] !== "0 0") {
                throw Error();                                                                      
            }
            s = inlineStyle[transformPropertyName];
            if (s.length === 0) return null;
            value = parseMatrix2DFromCssString(s);
            if (value === null) throw Error();
            return value;
        }
        if (typeof inlineStyle.filter === "string") {
            s = FilterUtilities_getFilterFromInlineStyle(hostElem, FilterTypeId_matrix);
            if (s === null) return null;
            return s.__getMatrix().clone();
        }
        s = __HostObject_getData(hostElem);
        if (s === null
            || !hasOwnPropertyFunction.call(s, "inlineStyleTransform")) return null;
        return s.inlineStyleTransform.clone();
    }

    function HostElement_setTransform_filter(hostElem, value) {
        var filterData, hostApiMatrixFilter;
        var renderWOver2, renderHOver2;
        var layoutSlotW, layoutSlotH;
        if (value !== null) {
            filterData = FilterUtilities_addOrUpdateFilterToInlineStyle(hostElem, new FilterUtilities_AddOrUpdateMatrixParameters(value));
            hostApiMatrixFilter = FilterUtilities_getHostApiFilters_first(hostElem, HostCssFilterName_matrix);
            try {
                hostApiMatrixFilter.enabled = false;
                renderWOver2 = 0.5 * hostElem.offsetWidth;
                renderHOver2 = 0.5 * hostElem.offsetHeight;
            } catch (e) {
                throw e;
            } finally {
                hostApiMatrixFilter.enabled = true;
            }
            layoutSlotW = hostElem.offsetWidth;
            layoutSlotH = hostElem.offsetHeight;
            return new Vector2(
                value.getM11() * renderWOver2 -
                0.5 * layoutSlotW +
                value.getM21() * renderHOver2 +
                2 * value.getOffsetX(),
                value.getM12() * renderWOver2 -
                0.5 * layoutSlotH +
                value.getM22() * renderHOver2 +
                2 * value.getOffsetY());
        }
        FilterUtilities_removeFilterFromInlineStyle(hostElem, FilterTypeId_matrix);
        return null;
    }

    function HostElement_setOpacity(hostElem, value) {
        var inlineStyle;
        if (!isHostElement(hostElem)) throw Error();
        if (value !== null && !is01Double(value)) throw Error();
        if (typeof (inlineStyle = hostElem.style).opacity === "string") {
            inlineStyle.opacity = value === null ? "" : value;
            return;
        }
        if (typeof inlineStyle.filter === "string") {
            if (value !== null) {
                FilterUtilities_addOrUpdateFilterToInlineStyle(hostElem, new FilterUtilities_AddOrUpdateAlphaParameters(roundDouble(value * 100)));
            } else {
                FilterUtilities_removeFilterFromInlineStyle(hostElem, FilterTypeId_alpha);
            }
            return;
        }
    }

    function HostElement_getOpacity(hostElem) {
        var inlineStyle, s;
        if (!isHostElement(hostElem)) throw Error();
        inlineStyle = hostElem.style;
        if (typeof (s = inlineStyle.opacity) === "string") {
            if (s.length === 0) return null;
            return Number(s);
        }
        if (typeof inlineStyle.filter === "string") {
            s = FilterUtilities_getFilterFromInlineStyle(hostElem, FilterTypeId_alpha);
            if (s === null) return null;
            return s.getOpacity() * _oneOver100;
        }
        return 1;
    }

    var FilterTypeId_matrix = 0;
    var FilterTypeId_alpha = 1;
    function FilterTypeId_isValid(value) {
        return value === FilterTypeId_matrix || value === FilterTypeId_alpha;
    }
    var HostCssFilterName_matrix = "DXImageTransform.Microsoft.Matrix";
    var HostCssFilterName_alpha = "DXImageTransform.Microsoft.Alpha";

    function Filter() {
        this.__toHostCssString_cache = null;
    }
    Filter.prototype = {
        getHostCssFilterName: function () {
            throw Error();
        },
        getTypeId: function() {
            throw Error();
        },
        _invalidateHostCssStringCache: function () {
            this.__toHostCssString_cache = null;
        },
        _parametersToHostCssString: function() {
            throw Error();
        },
        toHostCssString: function () {
            var i;
            if ((i = this.__toHostCssString_cache) !== null) return i;
            return this.__toHostCssString_cache = this.__toHostCssString_common("");
        },
        __toHostCssString_common: function(s) {
            return "progid:" + this.getHostCssFilterName() + "(" + s + this._parametersToHostCssString() + ")";
        },
        toHostCssString_stamped: function (stamp) {
            if (!(stamp instanceof Guid)) throw Error();
            return this.__toHostCssString_common(stamp.toString("N"));
        }
    };

    var MatrixFilter_baseTypeCtor = Filter;
    var MatrixFilter_baseTypeProto = MatrixFilter_baseTypeCtor.prototype;
    function MatrixFilter(matrix) {
        if (matrix !== null && !(matrix instanceof Matrix2D)) throw Error();
        MatrixFilter_baseTypeCtor.call(this);
        this.__matrix = matrix;
    }
    MatrixFilter.prototype = setOwnSrcPropsOnDst({
        getHostCssFilterName: function () {
            return HostCssFilterName_matrix;
        },
        __getMatrix: function() {
            return this.__matrix;
        },
        getTypeId: function() {
            return FilterTypeId_matrix;
        },
        _parametersToHostCssString: function () {
            var m;
            m = this.__matrix;
            if (m !== null) {
                return "M11=" + m.getM11() +
                    ",M12=" + m.getM21() +
                    ",M21=" + m.getM12() +
                    ",M22=" + m.getM22() +
                    ",SizingMethod='auto expand'";
            }
            return "M11=1,M12=0,M21=0,M22=1,SizingMethod='auto expand'";
        },
        __setMatrix: function (value) {
            if (value !== null && !(value instanceof Matrix2D)) throw Error();
            this.__matrix = value;
            this._invalidateHostCssStringCache();
        }
    }, Object.create(MatrixFilter_baseTypeProto));

    var AlphaFilter_baseTypeCtor = Filter;
    var AlphaFilter_baseTypeProto = AlphaFilter_baseTypeCtor.prototype;
    function AlphaFilter(opacity) {
        if (typeof value !== "number" || !(0 <= value) || 100 < value) throw Error();
        AlphaFilter_baseTypeCtor.call(this);
        this.__opacity = opacity;
    }
    AlphaFilter.prototype = setOwnSrcPropsOnDst({
        getHostCssFilterName: function () { return HostCssFilterName_alpha; },
        getOpacity: function () { return this.__opacity; },
        getTypeId: function () { return FilterTypeId_alpha; },
        _parametersToHostCssString: function () {
            return "Opacity=" + this.__opacity;
        },
        setOpacity: function (value) {
            if (typeof value !== "number" || !(0 <= value) || 100 < value) throw Error();
            this.__opacity = value;
            this._invalidateHostCssStringCache();
        }
    }, Object.create(AlphaFilter_baseTypeProto));

    function FilterData() {
        this.__toHostCssStringMostRecentCache = null;
        this.__isInlineStyleStringValid = true;
        this.__stamp = Guid.newPseudoRandom();
        this.__filterTable = {};
        this.__filterCount = 0;
    }
    FilterData.prototype = {
        addFilter: function (filter) {
            var fTab, fTypeId;
            if (!(filter instanceof Filter)) throw Error();
            fTab = this.__filterTable;
            if (hasOwnPropertyFunction.call(fTab, fTypeId = filter.getTypeId())) throw Error();
            fTab[fTypeId] = filter;
            this.__filterCount += 1;
        },
        getFilter: function(filterTypeId) {
            var fTab;
            if (!FilterTypeId_isValid(filterTypeId)) throw Error();
            fTab = this.__filterTable;
            if (!hasOwnPropertyFunction.call(fTab, filterTypeId)) return null;
            return fTab[filterTypeId];
        },
        getFilterCount: function() {
            return this.__filterCount;
        },
        getIsInlineStyleStringValid: function() {
            return this.__isInlineStyleStringValid;
        },
        getStamp: function() {
            return this.__stamp;
        },
        getToHostCssStringMostRecentCache: function () {
            return this.__toHostCssStringMostRecentCache;
        },
        setIsInlineStyleStringValid: function (value) {
            if (typeof value !== "boolean") throw Error();
            this.__isInlineStyleStringValid = value;
        },
        removeFilter: function (filterTypeId) {
            var fTab;
            if (!FilterTypeId_isValid(filterTypeId)) throw Error();
            fTab = this.__filterTable;
            if (!hasOwnPropertyFunction.call(fTab, filterTypeId)) return false;
            if (this.__filterCount === 1) return true;
            delete fTab[filterTypeId];
            this.__filterCount -= 1;
            return false;
        },
        toHostCssString: function () {
            var i, filter, s, f;
            var filterTable = this.__filterTable;
            f = true;
            s = "";
            for (i in filterTable) {
                if (!hasOwnPropertyFunction.call(filterTable, i)) break;
                filter = filterTable[i];
                if (f) {
                    s = filter.toHostCssString_stamped(this.__stamp);
                    f = false;
                } else {
                    s += " " + filter.toHostCssString();
                }
            }
            this.__toHostCssStringMostRecentCache = s;
            return s;
        }
    };

    function FilterUtilities_getFilterData(hostElem) {
        var d, fd;
        d = __HostObject_getData(hostElem);
        if (d !== null
            && hasOwnPropertyFunction.call(d, "filters")) {
            return d.filters;
        }
        return null;
    }

    function FilterUtilities_getHostApiFilters_firstOrDefault(hostElem, predicate, defaultValue) {
        var hostApiFilterTable;
        var hostApiFilter;
        var i, b;
        var hostCssFilterName;
        hostApiFilterTable = hostElem.filters;
        i = -1;
        for (hostCssFilterName in hostApiFilterTable) {
            if (!hasOwnPropertyFunction.call(hostApiFilterTable, hostCssFilterName)) break;
            if (-1 < i) {
                hostApiFilter = hostApiFilterTable.item(i);
                b = predicate(hostApiFilter);
                if (typeof b !== "boolean") throw Error();
                if (b) {
                    return hostApiFilter;
                }
            }
            i += 1;
        }
        if (-1 === i) {
            if (!isFunction(predicate)) throw Error();
        }
        if (arguments.length < 3) throw Error();
        return defaultValue;
    }

    function FilterUtilities_isHostFiltersApiTrustable1(hostElem, stamp) {
        var hostCssFilterString;
        hostCssFilterString = HostElement_getComputedStyle(hostElem).__tryGet_raw("filter");
        return FilterUtilities_isHostFiltersApiTrustable2(hostCssFilterString, stamp);
    }

    function FilterUtilities_isHostFiltersApiTrustable2(hostCssFilterString, stamp) {
        var i1, i2, i3;
        if ((i1 = hostCssFilterString.indexOf("(")) < 0
            || (i2 = hostCssFilterString.indexOf("=", i1 + 1)) < 0
            || hostCssFilterString.substring(i1 + 1, i2) !== "Stamp"
            || hostCssFilterString.charCodeAt(i2 + 1) !== 39
            || (i3 = hostCssFilterString.indexOf("'", i2 + 2)) !== i2 + 1 + Guid_sizeOf_base16
            || hostCssFilterString.substring(i2 + 1, i3) !== stamp.toString("N")) {
            return false;
        }
        return true;
    }

    function FilterUtilities_AddOrUpdateParameters() {
        throw Error();
    }
    FilterUtilities_AddOrUpdateParameters.prototype = {
        create: function() {
            throw Error();
        },
        getFilterTypeId: function() { throw Error(); },
        update_hostApiFilter: function (hostApiFilter) {
            throw Error();
        },
        update_filter: function (filter) {
            throw Error();
        }                         
    };

    function FilterUtilities_AddOrUpdateMatrixParameters(matrix) {
        this.__matrix = matrix;
    }
    FilterUtilities_AddOrUpdateMatrixParameters.prototype = setOwnSrcPropsOnDst({
        create: function () {
            return new MatrixFilter(this.__matrix);
        },
        getFilterTypeId: function() { return FilterTypeId_matrix; },
        update_hostApiFilter: function (hostApiFilter) {
            var m;
            m = this.__matrix;
            hostApiFilter.M11 = m.getM11();
            hostApiFilter.M21 = m.getM12();
            hostApiFilter.M12 = m.getM21();
            hostApiFilter.M22 = m.getM22();
        },
        update_filter: function (filter) {
            filter.__setMatrix(this.__matrix);
        }
    }, Object.create(FilterUtilities_AddOrUpdateParameters.prototype));

    function FilterUtilities_AddOrUpdateAlphaParameters(opacity) {
        this.__opacity = opacity;
    }
    FilterUtilities_AddOrUpdateAlphaParameters.prototype = setOwnSrcPropsOnDst({
        create: function () {
            return new AlphaFilter(this.__opacity);
        },
        getFilterTypeId: function() { return FilterTypeId_alpha; },
        update_hostApiFilter: function (hostApiFilter) {
            hostApiFilter.Opacity = this.__opacity;
        },
        update_filter: function (filter) {
            filter.setOpacity(this.__opacity);
        }
    }, Object.create(FilterUtilities_AddOrUpdateParameters.prototype));

    function FilterUtilities_getFilterFromInlineStyle(hostElem, filterTypeId) {
        var hostElem_data, filterData;
        hostElem_data = __HostObject_getData(hostElem);
        if (hostElem_data === null
            || !hasOwnPropertyFunction.call(hostElem_data, "filters")) return null;
        filterData = hostElem_data.filters;
        return filterData.getFilter(filterTypeId);

    }

    function FilterUtilities_addOrUpdateFilterToInlineStyle(hostElem, addOrUpdateArgs) {
        var hostElem_data;
        var hostElem_inlineStyle;
        var filterData;
        var filter;
        var shouldUseHostFiltersApi;
        hostElem_data = __HostObject_getData(hostElem);
        if (hostElem_data === null) {
            hostElem_data = __HostObject_initializeData(hostElem);
        } else if (hasOwnPropertyFunction.call(hostElem_data, "filters")
            && (filter = (filterData = hostElem_data.filters).getFilter(addOrUpdateArgs.getFilterTypeId())) !== null) {
            shouldUseHostFiltersApi = FilterUtilities_isHostFiltersApiTrustable1(hostElem, filterData.getStamp());
            if (shouldUseHostFiltersApi) {
                addOrUpdateArgs.update_hostApiFilter(FilterUtilities_getHostApiFilters_firstOrDefault(hostElem, function (hostApiFilter, hostCssFilterName) {
                    return hostCssFilterName === filter.getHostCssFilterName();
                }));
                filterData.setIsInlineStyleStringValid(false);
            }
            addOrUpdateArgs.update_filter(filter);
            if (!shouldUseHostFiltersApi) {
                hostElem.style.filter = filterData.toHostCssString();
            }
        }
        if (filterData === undefined) {
            hostElem_data.filters = filterData = new FilterData();
        }
        if (filter === null) {
            filter = addOrUpdateArgs.create();
            if (!(filter instanceof Filter) || filter.getTypeId() !== addOrUpdateArgs.getFilterTypeId()) throw Error();
            filterData.addFilter(filter);
            hostElem_inlineStyle = hostElem.style;
            if (filterData.getFilterCount() === 1) {
                hostElem_inlineStyle.filter = filter.toHostCssString_stamped(filterData.getStamp());
            } else if (filterData.getIsInlineStyleStringValid()) {
                hostElem_inlineStyle.filter += " " + filter.toHostCssString();
            } else {
                hostElem_inlineStyle.filter = filterData.toHostCssString();
            }
        }
        return filterData;
    }

    function FilterUtilities_removeFilterFromInlineStyle(hostElem, filterTypeId) {
        var hostElem_data;
        var filterData;
        hostElem_data = __HostObject_getData(hostElem);
        if (hostElem_data === null) return false;
        if (!hasOwnPropertyFunction.call(hostElem_data, "filters")) return false;
        filterData = hostElem_data.filters;
        if (filterData.removeFilter(filterTypeId)) {
            delete hostElem_data.filters;
            hostElem.style.filter = "";
        } else {
            hostElem.style.filter = filterData.toHostCssString();
        }
        return true;
    }

    setOwnSrcPropsOnDst({
        formatCssLength: formatCssLength,
        formatCssMatrix2D: formatCssMatrix2D,
        formatCssNumber: formatCssNumber,
        HostElement_getComputedStyle: HostElement_getComputedStyle,
        HostElement_getOpacity: HostElement_getOpacity,
        HostElement_getTransform: HostElement_getTransform,
        HostElement_setOpacity: HostElement_setOpacity,
        HostElement_setTransform: HostElement_setTransform
    }, window);

})();