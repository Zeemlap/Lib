this.z.Module.define("system/types", [], function (g, undefined) {



    var z;
    var hasOwnPropFunc;
    var Type;

    z = g.z;
    Type = g.system.Type;
    hasOwnPropFunc = g.Object.prototype.hasOwnProperty;

    if (hasOwnPropFunc.call(z, "verifyArguments")) {
        throw Error();
    }

    g.Object.defineProperty(z, "verifyArguments", {
        value: verifyArguments
    });

    function verifyIsSmallArrayIshAndGetLength(value) {
        var len;
        if (!hasOwnPropFunc.call(value, "length")) {
            throw Error();
        }
        len = value.length;
        if (typeof len !== "number" || len < 0 || len > 9007199254740992 || len % 1 !== 0) {
            throw Error();
        }
        return len;
    }

    function verifyArguments(argValues, expArgTypes, isVarArg) {
        var i, argValueCount, expArgTypeCount;
        var expArgType;
        if (arguments.length !== 3 || typeof isVarArg !== "boolean") {
            throw Error();
        }
        argValueCount = verifyIsSmallArrayIshAndGetLength(argValues);
        expArgTypeCount = verifyIsSmallArrayIshAndGetLength(expArgTypes);
        if (expArgTypeCount > argValueCount) {
            throw Error();
        }
        for (i = 0; i < expArgTypeCount - 1; ++i) {
            if (!hasOwnPropFunc.call(argValues, i) ||
                !hasOwnPropFunc.call(expArgTypes, i)) {
                throw Error();
            }
            if (!((expArgType = expArgTypes[i]) instanceof Type) ||
                !expArgType.isInstanceOfType(argValues[i])) {
                throw Error();
            }
        }
        ;
        if (!hasOwnPropFunc.call(expArgTypes, i) || !((expArgType = expArgTypes[i]) instanceof Type)) {
            throw Error();
        }
        do {
            if (!expArgType.isInstanceOfType(argValues[i])) {
                throw Error();
            }
        } while (++i < argValueCount);
    }



});