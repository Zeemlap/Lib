(function () {

    var undefined;
    var largestDecrementableIntegralDouble = window.largestDecrementableIntegralDouble;
    var hasOwnPropertyFunction = Object.prototype.hasOwnProperty;
    var UNSET_VALUE = {};
    
    var DepObj_baseTypeName = "ObjectWithEvents";
    var DepObj_baseTypeCtor = window[DepObj_baseTypeName];
    var DepObj_baseTypeProto = DepObj_baseTypeCtor.prototype;
    function DependencyObject() {
        DepObj_baseTypeCtor.call(this);
        this.__depObj_entries = {};
    }
    DependencyObject.prototype = setOwnSrcPropsOnDst({
        __clearValue: function (dp) {
            this.__setValue(dp, UNSET_VALUE);
        },
        _disposeCore: function () {
            DepObj_baseTypeProto._disposeCore.call(this);
        },
        __getValue: function (dp) {
            var entries, dp_gid, v;
            if (!(dp instanceof DependencyProperty)) throw Error();
            entries = this.__depObj_entries;
            dp_gid = dp.getGlobalId();
            if (hasOwnPropertyFunction.call(entries, dp_gid)) {
                v = entries[dp_gid];
                if (v instanceof ValueType) return v.clone();
                return v;
            }
            return dp.getDefaultValue();
        },
        __setValue: function (dp, value) {
            var oldValue;
            var entries, dp_gid;
            if (!(dp instanceof DependencyProperty)) throw Error();
            entries = this.__depObj_entries;
            dp_gid = dp.getGlobalId();
            if (value !== UNSET_VALUE) {
                if (!dp.isValidValue(value)) throw Error();
            } else {
                value = dp.__getDefaultValue();
            }
            if (hasOwnPropertyFunction.call(entries, dp_gid)) {
                oldValue = entries[dp_gid];
            } else {
                oldValue = dp.__getDefaultValue();
            }
            if (!function_equalityValueTypes(oldValue, value)) {
                entries[dp_gid] = value;
                dp.__invokeOnPropertyChangedFunction(this, oldValue, value);
            }
        }
    }, Object.create(DepObj_baseTypeProto));
    DependencyObject.UNSET_VALUE = UNSET_VALUE;


    var DepProp_globalMaxId = -1;
    var DepProp_fromNameQualifiedByOwnerTypeName = {};
    var DepProp_fromGlobalId = {};
    var DepProp_nameFromOwnerTypeDict = new Dictionary();
    function DependencyProperty() { throw Error(); }
    function __DependencyProperty(ownerTypeConstructor, nameQualifiedByOwnerTypeName, ownerTypeName,
        name, isValidValueFunction, onPropertyChangedFunction, defaultValue) {
        if (DepProp_globalMaxId === largestDecrementableIntegralDouble) throw Error();
        this.__defaultValue = defaultValue;
        this.__globalId = ++DepProp_globalMaxId;
        this.__isValidValueFunction = isValidValueFunction;
        this.__name = name;
        this.__nameQualifiedByOwnerTypeName = nameQualifiedByOwnerTypeName;
        this.__onPropertyChangedFunction = onPropertyChangedFunction;
        this.__ownerTypeConstructor = ownerTypeConstructor;
        this.__ownerTypeName = ownerTypeName;
    }
    DependencyProperty.prototype = __DependencyProperty.prototype = {
        constructor: DependencyProperty,
        getDefaultValue: function () { return function_copyValueType(this.__getDefaultValue()); },
        __getDefaultValue: function() {
            return this.__defaultValue;
        },
        getGlobalId: function () {
            return this.__globalId;
        },
        getOwnerTypeConstructor: function() {
            return this.__ownerTypeConstructor;
        },
        getOwnerTypeName: function() {
            return this.__ownerTypeName;
        },
        getName: function () {
            return this.__name;
        },
        __getNameQualifiedByOwnerTypeName: function() {
            return this.__nameQualifiedByOwnerTypeName;
        },
        isValidValue: function (value) {
            var func, bool;
            func = this.__isValidValueFunction;
            bool = func(value);
            if (typeof bool !== "boolean") throw Error();
            return bool;
        },
        __invokeOnPropertyChangedFunction: function (depObj, oldValue, newValue) {
            var func;
            func = this.__onPropertyChangedFunction;
            if (func !== undefined) func(depObj, new PropertyChangedEventArgs(this.__name, oldValue, newValue));
        }
    };

    DependencyProperty.registerAttached = function (options) {
        var i, ownerTypeName1, ownerTypeName2;
        var name, nameQualifiedByOwnerTypeName;
        var nameQualifiedByOwnerTypeName_split;
        var ownerTypeConstructor, isValidValue;
        var onPropertyChanged, defaultValue;
        var defaultValue_isSet = false;
        for (i in options) {
            if (!hasOwnPropertyFunction.call(options, i)) break;
            switch (i) {
                case "defaultValue":
                    defaultValue = options[i];
                    defaultValue_isSet = true;
                    break;
                case "nameQualifiedByOwnerTypeName":
                    nameQualifiedByOwnerTypeName = options[i];
                    if (typeof nameQualifiedByOwnerTypeName !== "string") throw Error();
                    break;
                case "ownerTypeConstructor":
                    ownerTypeConstructor = options[i];
                    if (!isFunction(ownerTypeConstructor)) throw Error();
                    break;
                case "isValidValue":
                    isValidValue = options[i];
                    if (!isFunction(isValidValue)) throw Error();
                    break;
                case "onPropertyChanged":
                    onPropertyChanged = options[i];
                    if (!isFunction(onPropertyChanged)) throw Error();
                    break;
                default:
                    throw Error();
            }
        }
        if (isValidValue === undefined) throw Error();
        if (!defaultValue_isSet) throw Error();
        i = defaultValue !== UNSET_VALUE && isValidValue(defaultValue);
        if (typeof i !== "boolean") throw Error();
        if (!i) throw Error();
        if (nameQualifiedByOwnerTypeName === undefined || ownerTypeConstructor === undefined) throw Error();
        if (hasOwnPropertyFunction.call(DepProp_fromNameQualifiedByOwnerTypeName, nameQualifiedByOwnerTypeName)) {
            throw Error();
        }
        nameQualifiedByOwnerTypeName_split = nameQualifiedByOwnerTypeName.split(".");
        if (nameQualifiedByOwnerTypeName_split.length !== 2) {
            throw Error();
        }
        ownerTypeName1 = nameQualifiedByOwnerTypeName_split[0];
        ownerTypeName2 = DepProp_nameFromOwnerTypeDict.get(ownerTypeConstructor);
        if (ownerTypeName2 !== undefined) {
            if (ownerTypeName2 !== ownerTypeName1) {
                throw Error();
            }
        } else {
            DepProp_nameFromOwnerTypeDict.add(ownerTypeConstructor, ownerTypeName1);
        }
        name = nameQualifiedByOwnerTypeName_split[1];
        i = new __DependencyProperty(ownerTypeConstructor, nameQualifiedByOwnerTypeName,
            ownerTypeName1, name, isValidValue, onPropertyChanged, defaultValue);
        DepProp_fromNameQualifiedByOwnerTypeName[nameQualifiedByOwnerTypeName] = i;
        DepProp_fromGlobalId[i.getGlobalId()] = i;
        return i;
    };
    DependencyProperty.__fromNameQualifiedByOwnerTypeName = function (nameQualifiedByOwnerTypeName) {
        return getOwnProperty(DepProp_fromNameQualifiedByOwnerTypeName, nameQualifiedByOwnerTypeName, null);
    };

    setOwnSrcPropsOnDst({
        DependencyObject: DependencyObject,
        DependencyProperty: DependencyProperty
    }, window);
})();