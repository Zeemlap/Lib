(function () {
    var _2pow53;
    var _2pow32;
    var _2powMinus22;
    var _2powMinus30;
    var _2powMinus52;
    var absDouble = Math.abs;
    var array_prototype_slice = Array.prototype.slice;
    var floorDouble = Math.floor;
    var hasOwnPropertyFunction = Object.prototype.hasOwnProperty;
    var INTERNAL_SENTINEL = singleCommon;
    var largestDecrementableIntegralDouble;
    var minDouble = Math.min;
    var maxDouble = Math.max;
    var object_prototype_toString = Object.prototype.toString;
    var posInfDouble = 1 / 0;
    var powDouble = Math.pow;
    var randomDouble01 = Math.random;
    var undefined;
    largestDecrementableIntegralDouble = powDouble(2, 53);
    _2pow32 = powDouble(2, 32);
    _2powMinus22 = powDouble(2, -22);
    _2powMinus30 = powDouble(2, -30);
    _2powMinus52 = powDouble(2, -52);

    
    if (!hasOwnProperty(Function.prototype, "bind")) {
        Function.prototype.bind = function () {
            var func = this;
            if (!isFunction(func)) throw Error();
            var thisp = arguments[0];
            var argArray1 = array_prototype_slice.call(arguments, 1);
            return function () {
                return func.apply(thisp, argArray1.concat(argArray2, arguments));
            };
        };
    }
    if (!hasOwnPropertyFunction.call(Date, "now")) {
        Date.now = function () { return new Date().getTime(); };
    }
    function internalNoop() { }
    if (!hasOwnPropertyFunction.call(Object, "create")) {
        Object.create = function (proto) {
            var inst;
            if (1 < arguments.length) throw Error();
            internalNoop.prototype = proto;
            inst = new internalNoop;
            internalNoop.prototype = null;
            return inst;
        };
    }
    function assert(flag) {
        if (typeof flag !== "boolean") throw Error();
        if (flag === false) throw Error();
    }
    function hasOwnProperty(object, propertyName) {
        if (!isObject(object) || typeof propertyName !== "string") throw Error();
        return hasOwnPropertyFunction.call(object, propertyName);
    }
    function getOwnProperty(object, propertyName, defaultValue) {
        if (hasOwnProperty(object, propertyName)) return object[propertyName];
        return defaultValue;
    }
    function isArray(value) {
        return object_prototype_toString.call(value) === "[object Array]";
    }
    function isObject(value) {
        return (typeof value === "object" && value !== null) || typeof value === "function";
    }
    function isFunction(value) {
        return object_prototype_toString.call(value) === "[object Function]";
    }
    function isHostContext(value) {
        return isObject(value) && isFunction(value.setTimeout);
    }
    function isHostDocNode(value) {
        return isObject(value) && value.nodeType === 9;
    }
    function isHostElement(value) {
        return isObject(value) && value.nodeType === 1;
    }
    var HostNodeType_table = {1:1,2:1,3:1,4:1,5:1,6:1,7:1,8:1,9:1,10:1,11:1,12:1};
    function isHostNode(value) {
        var nt;
        if (isObject(value)) {
            nt = value.nodeType;
            return typeof nt === "number" && hasOwnPropertyFunction.call(HostNodeType_table, nt);
        }
        return false;
    }
    function getGlobalFunction(name) {
        var func = getOwnProperty(window, name);
        if (!isFunction(func)) throw Error();
        return func;
    }
    function getAndRemoveGlobalFunction(name) {
        var func = getGlobalFunction(name);
        delete window[name];
        return func;
    }

    function queryElements(selector, context) {
        if (arguments.length < 2) context = document;
        if (!(context instanceof Node) || typeof selector !== "string") throw Error();
        var nodeList = context.querySelectorAll(selector);
        var i, n;
        var nodeListContainsOnlyElements = true;
        for (i = 0, n = nodeList.length; i < n; i++) {
            if (nodeList[i].nodeType !== 1) {
                nodeListContainsOnlyElements = false;
                break;
            }
        }
        if (nodeListContainsOnlyElements) return nodeList;
        var elementList = Array.prototype.slice.call(nodeList, 0, i);
        var j = i;
        do {
            if (nodeList[i].nodeType === 1) {
                elementList[j++] = nodeList[i];
            }
        } while (++i < n);
        return elementList;    
    }
    function __padLeft(s, pc, len) {
        var i;
        i = len - s.length;
        while (1 < i) {
            s = pc + pc + s;
            i -= 2;
        }
        if (0 < i) {
            s = pc + s;
        }
        return s;
    }
    function uri_getAuthority(uri) {
        if (typeof uri !== "string") throw Error();
        var i = uri.indexOf(":");
        if (i < 0) throw Error();
        if (uri.length - i < 3 || uri.charAt(i + 1) !== "/" || uri.charAt(i + 2) !== "/") return null;
        i += 3;
        var j = uri.indexOf("/", i);
        if (j < 0) uri.substring(i);
        if (i + 1 === j) throw Error();
        return uri.substring(i, j);
    }
    function uri_queryString_toPojo(uri_queryString) {
        if (typeof uri_queryString !== "string") throw Error();
        if (0 === uri_queryString.length) return {};
        var i = 0;
        if (uri_queryString.charAt(0) === "?") i += 1;
        var j;
        var pojo = {};
        while (true) {
            j = uri_queryString.indexOf("&", i);
            if (j < 0) {
                uri_queryString_toPojo_part(pojo, uri_queryString, i, uri_queryString.length);
                break;
            }
            uri_queryString_toPojo_part(pojo, uri_queryString, i, j);
            i = j + 1;
        }
        return pojo;
    }
    function uri_queryString_toPojo_part(pojo, uri_queryString, from, toExclusive) {
        var i = uri_queryString.indexOf("=", from);
        var key, value;
        if (i < 0 || toExclusive <= i) {
            key = uri_queryString.substring(from, toExclusive);
            value = null;
        } else {
            key = uri_queryString.substring(from, i);
            value = uri_queryString.substring(i + 1, toExclusive);
            if (0 <= value.indexOf("=")) {
                throw Error();
            }
            value = decodeURIComponent(value);
        }
        key = decodeURIComponent(key);
        var valueList = getOwnProperty(pojo, key);
        if (valueList === undefined) {
            valueList = pojo[key] = [];
        }
        valueList[valueList.length] = value;
    }

    function singleCommon(object) {

        var n = object.length;
        if (!(isIntegralDouble_nonNegative(n) && n <= largestDecrementableIntegralDouble)) {
            throw Error();
        }
        var i;
        var didFindValue = false;
        var value;
        for (i = 0; i < n; i++) {
            if (hasOwnPropertyFunction.call(object, i)) {
                if (didFindValue) throw Error();
                value = object[i];
                didFindValue = true;
            }
        }
        if (didFindValue) {
            return value;
        }
        return INTERNAL_SENTINEL;
    }

    if (!hasOwnPropertyFunction.call(Array.prototype, "forEach")) {
        Array.prototype.forEach = function (callbackFn) {
            var n, thisArg, thisObj, k;
            if (this == null) throw TypeError();
            thisObj = Object(this);
            thisArg = arguments[1];
            n = Number(thisObj.length);
            if (!(0 < n)) n = 0;
            else n = minDouble(floorDouble(n), largestDecrementableIntegralDouble - 1);
            for (k = 0; k < n; k++) {
                if (!hasOwnPropertyFunction(thisObj, k)) continue;
                callbackFn.call(thisArg, thisObj[k], k, thisObj);
            }
        };
    }

    arrayLike_addMethods({
        single: function () {
            var i;
            i = singleCommon(this);
            if (i !== INTERNAL_SENTINEL) return i;
            throw Error();
        },
        singleOrDefault: function (defaultValue) {
            var i;
            i = singleCommon(this);
            if (i === INTERNAL_SENTINEL) return defaultValue;
            return i;
        },
        forEach: Array.prototype.forEach
    });

    function arrayLike_addMethods(methods) {
        var name;
        var method;
        var arrayLikeProtos = [NodeList.prototype, HTMLCollection.prototype, Array.prototype];
        var i, n = arrayLikeProtos.length;
        for (name in methods) if (hasOwnPropertyFunction.call(methods, name)) {
            method = methods[name];
            for (i = 0; i < n; i++) {
                arrayLikeProtos[i][name] = method;
            }
        }
    }

    function isArrayLike(value) {
        var length;
        if (value === null || value === undefined) return false;
        length = value.length;
        return isIntegralDouble_nonNegative(length) && length <= largestDecrementableIntegralDouble;
    }
    function isArrayLike_nonSparse(value) {
        if (!isArrayLike(value)) return false;
        var i, n = value.length;
        for (i = 0 ; i < n; i++) {
            if (!hasOwnPropertyFunction.call(value, i)) {
                return false;
            }
        }
        return true;
    }
    function hasOwnProperties(object) {
        if (!isObject(object)) throw Error();
        for (var propertyName in object) {
            if (!hasOwnPropertyFunction.call(object, propertyName)) break;
            return true;
        }
        return false;
    }
    function isIntegralDouble(value) {
        return typeof value === "number" && value % 1 === 0;
    }
    function isIntegralDouble_nonNegative(value) {
        return typeof value === "number" && value % 1 === 0 && 0 <= value;
    }
    function isIndexDouble(value) {
        return isIntegralDouble_nonNegative(value) && value < largestDecrementableIntegralDouble;
    }
    function setOwnSrcPropsOnDst(src, dst) {
        var i, n, pn;
        pn = Object.getOwnPropertyNames(src);
        for (i = 0, n = pn.length; i < n; i++) {
            dst[pn[i]] = src[pn[i]];
        }
        return dst;
    }

    var string_nameToPascalCase_exceptionTable = {
        "id": 1,
        "is": 1
    };
    function __string_nameToPascalCase(sn) {
        var m = /^[\x00-0x40\x5B-\x7F]+/.exec(sn);
        var m0, m0_len;
        var string_pascalCase;
        if (m !== null) {
            m0 = m[0];
            m0_len = m0.length;
            if (m0_len <= 2 && !hasOwnProperty(string_nameToPascalCase_exceptionTable, m0)) {
                string_pascalCase = m0.toUpperCase() + sn.substring(m0_len);
                return string_pascalCase;
            }
            return m0.charAt(0).toUpperCase() + sn.substring(1);
        }
        if (/^[A-Z]/.test(sn)) {
            return sn;
        }
        return INTERNAL_SENTINEL;
    }
    function string_nameToPascalCase(sn) {
        var sn_pascalCase;
        if (typeof sn !== "string") throw Error();
        sn_pascalCase = __string_nameToPascalCase(sn);
        if (sn_pascalCase === INTERNAL_SENTINEL) throw Error();
        return sn_pascalCase;
    }

    var string_propertyNameToGetterName_cache = {};
    function string_propertyNameToGetterName(propertyName) {
        var getterName, i;
        if (hasOwnPropertyFunction.call(string_propertyNameToGetterName_cache, propertyName)) {
            return string_propertyNameToGetterName_cache[propertyName];
        }
        if (typeof propertyName !== "string") throw Error();
        i = maxDouble(0, propertyName.search(/[^_]/));
        getterName = propertyName.substring(0, i)
            + "get"
            + string_nameToPascalCase(propertyName.substring(i));
        return string_propertyNameToGetterName_cache[propertyName] = getterName;
    }

    function __areDoublesEqual(x1, x2) {
        if (x1 !== x1) return x2 !== x2;
        return x1 === x2;
    }

    function __areDoublesClose(x1, x2) {
        return x1 === x2 || absDouble(x1 - x2) < (absDouble(x1) + absDouble(x2) + 1) * _2powMinus52;
    }

    function ValueType() { throw Error(); }
    ValueType.prototype = {
        constructor: ValueType,
        clone: function () { throw Error(); },
        equals: function (other) { throw Error(); }
    };
    function Vector2(x, y) {
        var argN;
        argN = arguments.length;
        if (argN === 0) {
            this.__x = 0;
            this.__y = 0;
            return;
        }
        if (argN === 1) {
            if (!(x instanceof Vector2)) throw Error();
            this.__x = x.__x;
            this.__y = x.__y;
            return;
        }
        if (typeof x !== "number" || typeof y !== "number") {
            throw Error();
        }
        this.__x = x;
        this.__y = y;
    }
    Vector2.prototype = setOwnSrcPropsOnDst({
        constructor: Vector2,
        assign: function (x, y) {
            if (arguments.length < 2) {
                if (!(x instanceof Vector2)) throw Error();
                this.__x = x.__x;
                this.__y = x.__y;
                return;
            }
            if (typeof x !== "number" || typeof y !== "number") throw Error();
            this.__x = x;
            this.__y = y;
        },
        clone: function () {
            return new Vector2(this);
        },
        equals: function (other) {
            if (other == null || other.constructor !== Vector2) return false;
            return __areDoublesEqual(this.__x, other.__x) && __areDoublesEqual(this.__y, other.__y);
        },
        getAreXAndYFinite: function () {
            return isFinite(this.__x) && isFinite(this.__y);
        },
        getAreXAndYNotPositiveInfinity: function() {
            return this.__x !== posInfDouble && this.__y !== posInfDouble;
        },
        getAreXAndYNotNan: function() {
            return (x = this.__x) === x && (x = this.__y) === x;
        },
        getX: function () { return this.__x; },
        getY: function () { return this.__y; },
        isCloseTo: function (x, y) {
            if (arguments.length < 2) {
                if (x == null || x.constructor !== Vector2) throw Error();
                y = x.__y;
                x = x.__x;
            }
            return __areDoublesClose(this.__x, x)
                && __areDoublesClose(this.__y, y);
        },
        setX: function (x) {
            if (typeof x !== "number") throw Error();
            this.__x = x;
        },
        setY: function (y) {
            if (typeof y !== "number") throw Error();
            this.__y = y;
        }
    }, Object.create(ValueType.prototype));

    function Rect2D(x, y, width, height) {
        var argN;
        argN = arguments.length;
        if (argN === 0) {
            this.__x = this.__y = this.__width = this.__height = 0;
            return;
        }
        if (argN === 1) {
            if (!(x instanceof Rect2D)) throw Error();
            this.__x = x.__x;
            this.__y = x.__y;
            this.__width = x.__width;
            this.__height = x.__height;
            return;
        }
        this.setX(x);
        this.setY(y);
        this.setWidth(width);
        this.setHeight(height);
    }
    Rect2D.prototype = setOwnSrcPropsOnDst({
        constructor: Rect2D,
        assign: function (x, y, width, height) {
            if (arguments.length === 1) {
                if (!(x instanceof Rect2D)) throw Error();
                this.__x = x.__x;
                this.__y = x.__y;
                this.__width = x.__width;
                this.__height = x.__height;
                return;
            }
            this.setX(x);
            this.setY(y);
            this.setWidth(width);
            this.setHeight(height);
        },
        clone: function() {
            return new Rect2D(this);
        },
        contains: function (x, y) {
            var argN;
            argN = arguments.length;
            if (argN < 2) {
                if (!(x instanceof Vector2)) throw Error();
                y = x.__y;
                x = x.__x;
            }
            if (x < this.__x || y < this.__y) return false;
            return x < this.__x + this.__width
                && y < this.__y + this.__height;
        },
        equals: function (other) {
            if (other == null || other.constructor !== Rect2D) return false;
            return this.__x === other.__x
                && this.__y === other.__y
                && this.__width === other.__width
                && this.__height === other.__height;
        },
        getBottom: function() { return this.__y + this.__height; },
        getBottomLeft: function () { return new Vector2(this.__x, this.getBottom()); },
        getBottomRight: function () { return new Vector2(this.getRight(), this.getBottom()); },
        getHeight: function () { return this.__height; },
        getRight: function () { return this.__x + this.__width; },
        getTopLeft: function () { return new Vector2(this.__x, this.__y); },
        getTopRight: function() { return new Vector2(this.getRight(), this.__y); },
        getWidth: function () { return this.__width; },
        getX: function () { return this.__x; },
        getY: function () { return this.__y; },

        isCloseTo: function (x, y, width, height) {
            if (arguments.length === 1) {
                if (x == null || x.constructor !== Rect2D) throw Error();
                y = x.__y;
                width = x.__width;
                height = x.__height;
                x = x.__x;
            }
            return __areDoublesClose(this.__x, x)
                && __areDoublesClose(this.__y, y)
                && __areDoublesClose(this.__width, width)
                && __areDoublesClose(this.__height, height);
        },

        setWidth: function (value) {
            if (!isFiniteDouble(value) || value <= 0) throw Error();
            this.__width = value;
        },
        setHeight: function (value) {
            if (!isFiniteDouble(value) || value <= 0) throw Error();
            this.__height = value;
        },
        setX: function (value) {
            if (!isFiniteDouble(value)) throw Error();
            this.__x = value;
        },
        setY: function (value) {
            if (!isFiniteDouble(value)) throw Error();
            this.__y = value;
        }
    }, Object.create(ValueType.prototype));

    function function_strictEquality(v1, v2) {
        return v1 === v2;
    }
    function function_equalityValueTypes(v1, v2) {
        if (v1 === v2) return true;
        if (v1 !== v1) return v2 !== v2;
        if (v1 !== null && v1 instanceof ValueType) return v1.equals(v2);
        return false;
    }
    function function_copyValueType(v) {
        if (v instanceof ValueType) return v.clone();
        return v;
    }
    function function_returnTrue() { return true; }
    function function_noop() { }

    function isFiniteDouble(x) {
        return typeof x === "number" && isFinite(x);
    }
    var roundDouble = Math.round;
    function bankersRoundingDouble(x) {
        if (!isFiniteDouble(x)) throw Error();
        return 2 * roundDouble(x * 0.5);
    };
    function Thickness(left, top, right, bottom) {
        var argN;
        argN = arguments.length;
        if (argN === 0) {
            this.__left = this.__top = this.__right = this.__bottom = 0;
            return;
        }
        if (argN === 1) {
            if (!(left instanceof Thickness)) throw Error();
            this.__left = left.__left;
            this.__top = left.__top;
            this.__right = left.__right;
            this.__bottom = left.__bottom;
            return;
        }
        this.setLeft(left);
        this.setTop(top);
        this.setRight(right);
        this.setBottom(bottom);
    }
    Thickness.prototype = {
        constructor: Thickness,
        assign: function (left, top, right, bottom) {
            if (arguments.length === 1) {
                if (!(left instanceof Thickness)) throw Error();
                this.__left = left.__left;
                this.__top = left.__top;
                this.__right = left.__right;
                this.__bottom = left.__bottom;
                return;
            }
            this.setLeft(left);
            this.setTop(top);
            this.setRight(right);
            this.setBottom(bottom);
        },
        clone: function () {
            return new Thickness(this);
        },
        equals: function (other) {
            if (other == null || other.constructor !== Thickness) return false;
            return __areDoublesEqual(this.__left, other.__left)
                && __areDoublesEqual(this.__top, other.__top)
                && __areDoublesEqual(this.__right, other.__right)
                && __areDoublesEqual(this.__bottom, other.__bottom);
        },
        getBottom: function () {
            return this.__bottom;
        },
        getLeft: function () {
            return this.__left;
        },
        getRight: function () { return this.__right; },
        getTop: function () {
            return this.__top;
        },
        isCloseTo: function (left, top, right, bottom) {
            if (arguments.length === 1) {
                if (other == null || other.constructor !== Thickness) throw Error();
                left = other.getLeft();
                top = other.getTop();
                right = other.getRight();
                bottom = other.getBottom();
            }
            return __areDoublesClose(this.__left, left)
                && __areDoublesClose(this.__top, top)
                && __areDoublesClose(this.__right, right)
                && __areDoublesClose(this.__bottom, bottom);
        },
        setBottom: function (value) {
            if (typeof value !== "number") throw Error();
            this.__bottom = value;
        },
        setLeft: function (value) {
            if (typeof value !== "number") throw Error();
            this.__left = value;
        },
        setRight: function (value) {
            if (typeof value !== "number") throw Error();
            this.__right = value;
        },
        setTop: function (value) {
            if (typeof value !== "number") throw Error();
            this.__top = value;
        }
    };

    function NullDisposable() { throw Error(); }
    function __NullDisposable() { }
    NullDisposable.prototype = __NullDisposable.prototype = {
        constructor: NullDisposable,
        dispose: function () { }
    };
    var nullDisposable_instance = new __NullDisposable();
    NullDisposable.getInstance = function () {
        return nullDisposable_instance;
    };

    function hasPropertyWithUndefinedValue(obj, propertyName) {
        if (!isObject(obj)) throw Error();
        if (typeof propertyName !== "string") throw Error();
        if (obj[propertyName] !== undefined) return false;
        do {
            if (hasOwnPropertyFunction.call(obj, propertyName)) {
                return true;
            }
        } while ((obj = Object.getPrototypeOf(obj)) !== null);
        return false;
    }
    function is01Double(value) {
        return typeof value === "number" && !(value < 0) && value <= 1;
    }

    function getPropertyValueThroughGetter(object, propertyName) {
        var getterName, getterFunc;
        getterName = string_propertyNameToGetterName(propertyName);
        getterFunc = object[getterName];
        if (!isFunction(getterFunc)) throw Error();
        return getterFunc.call(object);
    }

    function isFunction_native(value) {
        return isFunction(value) && /^[^\{]+\{\s*\[native [^ ]/.test(value);
    }
    setOwnSrcPropsOnDst({
        __areDoublesClose: __areDoublesClose, 
        __areDoublesEqual: __areDoublesEqual,
        assert: assert,
        bankersRoundingDouble: bankersRoundingDouble,

        function_copyValueType: function_copyValueType,
        function_equalityValueTypes: function_equalityValueTypes,     
        function_noop: function_noop,
        function_returnTrue: function_returnTrue,
        function_strictEquality: function_strictEquality,

        getAndRemoveGlobalFunction: getAndRemoveGlobalFunction,
        getGlobalFunction: getGlobalFunction,
        getOwnProperty: getOwnProperty,
        getPropertyValueThroughGetter: getPropertyValueThroughGetter,

        hasOwnProperty: hasOwnProperty,
        hasOwnProperties: hasOwnProperties,
        hasPropertyWithUndefinedValue: hasPropertyWithUndefinedValue,

        is01Double: is01Double,
        isArray: isArray,
        isArrayLike: isArrayLike,
        isArrayLike_nonSparse: isArrayLike_nonSparse,
        isFiniteDouble: isFiniteDouble,
        isFunction: isFunction,
        isFunction_native: isFunction_native,
        isHostContext: isHostContext,
        isHostDocNode: isHostDocNode,
        isHostElement: isHostElement,
        isIndexDouble: isIndexDouble,
        isIntegralDouble: isIntegralDouble,
        isIntegralDouble_nonNegative: isIntegralDouble_nonNegative,
        isObject: isObject,

        largestDecrementableIntegralDouble: largestDecrementableIntegralDouble,

        queryElements: queryElements,

        NullDisposable: NullDisposable,

        Rect2D: Rect2D,

        setOwnSrcPropsOnDst: setOwnSrcPropsOnDst,
        string_nameToPascalCase: string_nameToPascalCase,
        string_propertyNameToGetterName: string_propertyNameToGetterName,

        Thickness: Thickness,

        uri_getAuthority: uri_getAuthority,
        uri_queryString_toPojo: uri_queryString_toPojo,

        ValueType: ValueType,
        Vector2: Vector2
    }, window);

    function StringGenerator(minCP) {
        if (arguments.length < 1) {
            minCP = 1;
        } else if (!isIntegralDouble_nonNegative(minCP) || 127 < minCP) {
            throw Error();
        }
        this.__minCP = minCP;
        this.__maxCP = 127;
        this.__state = [this.__minCP - 1];
        this.__recyclingBin = {};
    }
    StringGenerator.prototype = {
        constructor: StringGenerator,
        next: function () {
            var string1;
            var s = this.__recyclingBin;
            for (string1 in s) if (hasOwnProperty(s, string1)) {
                delete s[string1];
                return string1;
            }
            s = this.__state;
            for (i = 0; this.__maxCP < ++s[i];) {
                s[i] = this.__minCP;
                if (++i === s.length) {
                    s[i] = this.__minCP;
                    break;
                }
            }
            string1 = String.fromCharCode.apply(String, s);
            return string1;
        },
        __canRecycle: function (string1) {
            var c = string1.length - this.__state.length;
            if (c < 0) {
                return false;
            }
            if (0 < c) {
                return true;
            }
            return string1 <= string_fromCharCode.apply(String, this.__state);
        },
        recycle: function (string1) {
            if (!this.__canRecycle(string1)) {
                throw Error();
            }
            this.__recyclingBin[string1] = 1;
        }
    };
    function Version(s) {
        var m, i, j;
        if (typeof s !== "string") throw Error();
        m = /^(\d+(?:\.\d+){1,3})$/.exec(s);
        if (m === null) throw Error();
        i = s.indexOf(".");
        this.__build = -1;
        this.__revision = -1;
        this.__major = Number(s.substring(0, i));
        j = s.indexOf(".", i + 1);
        if (j < 0) {
            this.__minor = Number(s.substring(i + 1));
            return;
        }
        this.__minor = Number(s.substring(i + 1, j));
        i = s.indexOf(".", j + 1);
        if (i < 0) {
            this.__build = Number(s.substring(j + 1));
            return;
        }
        this.__build = Number(s.substring(j + 1, i));
        this.__revision = Number(s.substring(i + 1));
    }
    Version.prototype = {
        constructor: Version,
        compareTo: function (other) {
            var i;
            if (!(other instanceof Version)) throw Error();
            if (this.__major < other.__major) return -1;
            if (other.__major < this.__major) return 1;
            if (this.__minor < other.__minor) return -1;
            if (other.__minor < this.__minor) return 1;
            if (this.__build < other.__build) return -1;
            if (other.__build < this.__build) return 1;
            if (this.__revision < other.__revision) return -1;
            if (other.__revision < this.__revision) return 1;
            return 0;
        }
    };

    function Dictionary() {
        this.__keys = [];
        this.__values = [];
    }
    Dictionary.prototype = {
        constructor: Dictionary,
        add: function (key, value) {
            this.__addOrSet(key, value, true);
        },
        __addOrSet: function(key, value, isAdd) {
            var i;
            i = this.__indexOfKey(key);
            if (i < 0) i = this.__keys.length;
            else if (isAdd) throw Error();
            this.__keys[i] = key;
            this.__values[i] = value;
        },
        get: function (key, defaultValue) {
            var i;
            i = this.__indexOfKey(key);
            if (i < 0) return defaultValue;
            return this.__values[i];
        },
        getCount: function () {
            return this.__keys.length;
        },
        __indexOfKey: function (key) {
            var keys;
            var i, n;
            keys = this.__keys;
            for (i = 0, n = keys.length; i < n ; i++) {
                if (function_equalityValueTypes(keys[i], key)) {
                    return i;
                }
            }
            return -1;
        },
        remove: function (key) {
            var i;
            i = this.__indexOfKey(key);
            if (i < 0) return false;
            this.__keys.splice(i, 1);
            this.__values.splice(i, 1);
            return true;
        },
        set: function (key, value) {
            this.__addOrSet(key, value, false);
        }
    };

    setOwnSrcPropsOnDst({
        Dictionary: Dictionary,
        StringGenerator: StringGenerator,
        Version: Version
    }, window);


    function Guid() {
        this.__a = [];
        this.__toStringN_cache = null;
        this.__toStringD_cache = null;
    }
    function __Guid(a, toStringN_cache, toStringD_cache) {
        this.__a = a;
        this.__toStringN_cache = toStringN_cache;
        this.__toStringD_cache = toStringD_cache;
    }
    Guid.prototype = __Guid.prototype = setOwnSrcPropsOnDst({
        constructor: Guid,
        clone: function () {
            return new __Guid(
                this.__a,
                this.__toStringN_cache,
                this.__toStringD_cache);
        },
        equals: function (o) {
            var thisa, oa;
            if (o == null || o.constructor !== Guid) return false;
            thisa = this.__a;
            oa = o.__a;
            return thisa[0] === oa[0]
                && thisa[1] === oa[1]
                && thisa[2] === oa[2]
                && thisa[3] === oa[3]
                && thisa[4] === oa[4];
        },
        toString: function (format) {
            var s, a;
            if (arguments.length < 1) {
                format = "D";
            } else if (format !== "N" && format !== "D") {
                throw Error();
            }
            if (format === "N") {
                s = this.__toStringN_cache;
            } else {
                s = this.__toStringD_cache;
            }
            if (s !== null) {
                return s;
            }
            a = this.__a;
            s = __padLeft((a[0] >>> 2).toString(16), "0", 7);
            s += (((a[0] & 3) << 2) | (a[1] >> 28)).toString(16);
            if (format === "N") {
                s += __padLeft((a[1] & 0xFFFFFFF).toString(16), "0", 7);
                s += __padLeft((a[2] >>> 2).toString(16), "0", 7);
            } else {
                s += "-" + __padLeft(((a[1] >>> 12) & 0xFFFF).toString(16), "0", 4);
                s += "-" + __padLeft((a[1] & 0xFFF).toString(16), "0", 3) + (a[2] >>> 26).toString(16);
                s += "-" + __padLeft(((a[2] >>> 10) & 0xFFFF).toString(16), "0", 4);
                s += "-" + __padLeft(((a[2] >>> 2) & 0xFF).toString(16), "0", 2);
            }
            s += (((a[2] & 3) << 2) | (a[3] >> 28)).toString(16);
            s += __padLeft((a[3] & 0xFFFFFFF).toString(16), "0", 7);
            s += __padLeft(a[4].toString(16), "0", 2);
            if (format === "N") {
                this.__toStringN_cache = s;
            } else {
                this.__toStringD_cache = s;
            }
            return s;
        },
        valueOf: function () {
            return this.toString();
        }
    }, Object.create(ValueType.prototype));
    Guid.newPseudoRandom = function () {
        var a, a1, a2, a3, r;
        a = new Array(5);
        r = randomDouble01() * 0x100000000;
        a[0] = r & 0x3FFFFFFF;
        r >>>= 30;
        a1 = (r & 3) << 28;
        r = randomDouble01() * 0x100000000;
        a1 |= (r & 0xFFFF) << 12;
        r >>>= 16;
        a[1] = a1 | 0x400 | (r & 0xFF);
        r >>>= 8;
        a2 = (r & 0xF) << 26;
        r >>>= 4;
        a2 |= ((r & 3) + 8) << 22;
        r >>>= 2;
        a2 |= r << 20;
        r = randomDouble01() * 0x100000000;
        a[2] = a2 | (r & 0xFFFFF);
        r >>>= 20;
        a3 = r << 18;
        r = randomDouble01() * 0x100000000;
        a[3] = a3 | (r & 0x3FFFF);
        r >>>= 18;
        a[4] = r & 0xFF;
        return new __Guid(a, null, null);
    };
    Guid.__sizeOf_base16 = 32;

    setOwnSrcPropsOnDst({
        Guid: Guid
    }, window);

})();