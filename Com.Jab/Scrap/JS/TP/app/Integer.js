(function () {



    var isIntegralDouble = window.isIntegralDouble;
    var pow = Math.pow;
    var floor = Math.floor;
    var max = Math.max;
    var abs = Math.abs;
    var log10 = Math.log10;
    var doubleUtil = DoubleUtilities.getInstance();
    var doubleUtil_mantissaSize_base2 = doubleUtil.getMantissaSize_base2();
    var doubleUtil_2PowMantNoBits = pow(2, doubleUtil_mantissaSize_base2);
    var doubleUtil_expMaxMinusMantNoBits = doubleUtil.getExponentMax() - doubleUtil_mantissaSize_base2;
    function doubleUtil_incMantAndCreate(exp, mant, isNegative) {
        mant += 1;
        if (doubleUtil_2PowMantNoBits <= mant) {
            mant = mant * 0.5;
            exp += 1;
            if (doubleUtil_expMaxMinusMantNoBits <= exp) {
                return isNegative ? -1 / 0 : 1 / 0;
            }
        }
        return doubleUtil.create(exp, mant, isNegative);
    }
    var digBase_log2 = 28;
    var digBase = pow(2, digBase_log2);
    var digBase_reciprocal = pow(2, -digBase_log2);
    var digMax = digBase - 1;
    var digMaxLog10 = floor(log10(digMax));
    function dig_noMostSignificantZeroBits(v) {
        assert(isIntegralDouble(v));
        assert(digBase_log2 <= 30);
        assert((digBase & (digBase - 1)) === 0);
        assert(v !== 0);
        var c = 0;
        if ((v & 0xFFF0000) === 0) {
            c += 12;
            v <<= 12;
        }
        if ((v & 0xFF00000) === 0) {
            c += 8;
            v <<= 8;
        }
        if ((v & 0xF000000) === 0) {
            c += 4;
            v <<= 4;
        }
        if ((v & 0xC000000) === 0) {
            c += 2;
            v <<= 2;
        }
        if ((v & 0x8000000) === 0) {
            c += 1;
        }
        return c;
    }
    var _10_pow_digMaxLog10 = pow(10, digMaxLog10);

    function num_intPartLeastSignificantDigit(n) {
        assert(digBase_log2 <= 30);
        assert((digBase & (digBase - 1)) === 0);
        return n & digMax;
    }

    function __Integer() {}
    function Integer(v) {
        if (arguments.length < 1) {
            this.__n = 0;
            this.__a = null;
            return;
        }
        this.assign(v);
    }
    function getV(v1) {
        if (isIntegralDouble(v1)) {
            if (-digBase < v1 && v1 < digBase) {
                return v1;
            }
            var v2 = new __Integer();
            v2.__assign_numBig(v1);
            return v2;
        }
        if (!(v1 instanceof Integer)) {
            throw Error();
        }
        return v1;
    }
    function array_areAllElementsZero(a, n) {
        for (var i = 0; i < n; ++i) {
            if (a[i] !== 0) {
                return false;
            }
        }
        return true;
    }
    function array_copy(srca, dsta, i, iLastExcl) {
        do {
            dsta[i] = srca[i];
        } while (++i < iLastExcl);
    }
    function getDiffLen(a1, a2) {
        var i = a1.length;
        assert(a2.length === i);
        while (a1[--i] === a2[i]) {
            if (i === 0) {
                return 0;
            }
        }
        return i + 1;
    }
    var string_fromCharCode = String.fromCharCode;


    Integer.prototype = __Integer.prototype = setOwnSrcPropsOnDst({
        constructor: Integer,
        add: function (v) {
            throw Error();
        },
        addAssign: function (v) {
            v = getV(v);
            if (typeof v === "number") {
                if (this.__a === null) {
                    this.__addAssign_ss(v);
                    return this;
                }
                this.__addAssign_bs(v);
                return this;
            }
            if (this.__a === null) {
                var t = this.__n;
                this.__assign_b(v);
                this.__addAssign_bs(t);
                return this;
            }
            if ((this.__n < 0) === (v.__n < 0)) {
                this.__addAssign_bbm(v);
            } else {
                this.__subtractAssign_bb(v);
            }
            return this;
        },
        __addAssign_bbm: function (v) {
            var a1 = this.__a;
            var a2 = v.__a;
            var a1_len_old = a1.length;
            var i, t;
            for (i = a1_len_old, t = a2.length; i < t; ++i) {
                a1[i] = a2[i];
            }
            for (i = 0, t = 0; i < a1_len_old; ++i) {
                t += a1[i] + a2[i];
                a1[i] = num_intPartLeastSignificantDigit(t);
                t *= digBase_reciprocal;
            }
            if (1 <= t) {
                this.__applyCarry(a1_len_old);
            }
        },
        __addAssign_bs: function (v) {
            if ((this.__n < 0) === (v < 0)) {
                v = abs(v) + this.__a[0];
                if (v <= digMax) {
                    this.__a[0] = v;
                    return;
                }
                this.__a[0] = num_intPartLeastSignificantDigit(v);
                this.__applyCarry(1);
                return;
            }
            v = this.__a[0] - abs(v);
            if (0 <= v) {
                this.__a[0] = v;
                return;
            }
            this.__a[0] = v + digBase;
            this.__applyBorrow(1);
            this.__trimMostSignificantZeroDigits();
        },

        __addAssign_ss: function (v1) {
            var v2 = this.__n + v1;
            if (-digBase < v2 && v2 < digBase) {
                this.__n = v2;
                return;
            }
            if (v2 < 0) {
                this.__n = -1;
                v2 = -v2;
            } else {
                this.__n = 1;
            }
            this.__a = [num_intPartLeastSignificantDigit(v2), 1];
        },

        __applyCarry: function (i) {
            while (i < this.__a.length) {
                if (++this.__a[i] < digBase) {
                    return;
                }
                this.__a[i] = 0;
                if (++i === i) {
                    throw Error();
                }
            }
            this.__a[i] = 1;
        },
        __applyBorrow: function (i) {
            assert(i < this.__a.length);
            // Assume we can borrow, otherwise this number would not have had more digits.
            while (--this.__a[i] < 0) {
                this.__a[i] = digMax;
                assert(++i < this.__a.length);
            }
        },

        assign: function (v) {
            if (isIntegralDouble(v)) {
                if (-digMax <= v && v <= digMax) {
                    this.__n = v;
                    this.__a = null;
                    return this;
                }
                this.__assign_numBig(v);
                return this;
            }
            if (!(v instanceof Integer)) {
                throw Error();
            }
            this.__assign_b(v);
            return this;
        },
        __assign_b: function (v) {
            this.__n = v.__n;
            this.__a = v.__a.slice(0);
        },
        __assign_numBig: function (v) {
            var v_ieee754Exp = doubleUtil.getExponent(v);
            var v_noBits = v_ieee754Exp + 1;
            var v_noDigits = floor((v_noBits + (digBase_log2 - 1)) / digBase_log2);
            if (v < 0) {
                this.__n = -1;
                v = -v;
            } else {
                this.__n = 1;
            }
            this.__a = new Array(v_noDigits);
            var v_minNoLeastSignificantZeroBits = max(0, v_noBits - (doubleUtil_mantissaSize_base2 + 1));
            var v_minNoLeastSignificantZeroDigits = floor(v_minNoLeastSignificantZeroBits / digBase_log2);
            var i = 0;
            for (; i < v_minNoLeastSignificantZeroDigits; ++i) {
                this.__a[i] = 0;
            }
            v = v * pow(2, -v_minNoLeastSignificantZeroDigits * digBase_log2);
            while (true) {
                this.__a[i] = num_intPartLeastSignificantDigit(v);
                v = v * digBase_reciprocal;
                if (v < 1) {
                    break;
                }
                assert(++i < v_noDigits);
            }
        },


        clone: function () {
            var v, thisa;
            v = new __Integer();
            v.__n = this.__n;
            thisa = this.__a;
            v.__a = thisa === null ? null : thisa.slice(0);
            return v;
        },

        compareTo: function (v) {
            v = getV(v);
            var thisa = this.__a;
            if (typeof v === "number") {
                if (thisa === null) {
                    return this.__n - v;
                }
                // -- > -1
                // -+ > -1
                // +- > 1
                // ++ > 1
                return this.__n;
            }
            var va;
            if (thisa === null || thisa.length < (va = v.__a).length) {
                // -- > 1
                // -+ > -1
                // +- > 1
                // ++ > -1
                return -v.__n;
            }
            if (va.length < thisa.length) {
                return this.__n;
            }
            var t = getDiffLen(thisa, va);
            if (t === 0) {
                return 0;
            }
            return thisa[--t] - va[t];
        },
        equals: function (v) {
            if (v == null || v.constructor !== Integer) return false;
            return this.compareTo(v) === 0;
        },
        subtract: function (v) {
            throw Error();
        },
        subtractAssign: function (v) {
            v = getV(v);
            if (typeof v === "number") {
                if (this.__a === null) {
                    this.__addAssign_ss(-v);
                    return this;
                }
                this.__addAssign_bs(-v);
                return this;
            }
            if (this.__a === null) {
                var t = this.__n;
                this.__assign_b(v);
                this.__addAssign_bs(-t);
                this.__n = -this.__n;
                return this;
            }
            if ((this.__n < 0) === (v.__n < 0)) {
                this.__subtractAssign_bb(v);
            } else {
                this.__addAssign_bbm(v);
            }
            return this;
        },
        __subtractAssign_bb: function (v) {
            var thisa = this.__a;
            var va = v.__a;
            var thisa_len_old = thisa.length;
            var va_len = va.length;
            var borrow;
            if (va_len < thisa_len_old) {
                borrow = this.__subtractAssign_bbm(va, va_len);
                if (borrow === 0) {
                    return;
                }
                this.__applyBorrow(va_len);
            } else if (thisa_len_old < va_len) {
                array_copy(va, thisa, thisa_len_old, va_len);
                borrow = this.__subtractAssign_bbm_rev(va, thisa_len_old);
                if (borrow === 0) {
                    return;
                }
                this.__applyBorrow(thisa_len_old);
            } else {
                thisa_len_old = getDiffLen(thisa, va);
                if (thisa_len_old <= 1) {
                    this.__n = thisa[0] - va[0];
                    this.__a = null;
                    return;
                }
                thisa.length = thisa_len_old;
                if (thisa[thisa_len_old - 1] < va[thisa_len_old - 1]) {
                    borrow = this.__subtractAssign_bbm_rev(va, thisa_len_old);
                } else {
                    borrow = this.__subtractAssign_bbm(va, thisa_len_old);
                }
                assert(borrow === 0);
                return;
            }
            this.__trimMostSignificantZeroDigits();
        },
        __subtractAssign_bbm: function (va, n) {
            var thisa = this.__a;
            var i = 0;
            var borrow = 0;
            for (; i < n; ++i) {
                var t = thisa[i] - va[i] - borrow;
                if (t < 0) {
                    t += digBase;
                    borrow = 1;
                } else {
                    borrow = 0;
                }
                thisa[i] = t;
            }
            return borrow;
        },
        __subtractAssign_bbm_rev: function (va, n) {
            var thisa = this.__a;
            var i = 0;
            var borrow = 0;
            for (; i < n; ++i) {
                var t = va[i] - thisa[i] - borrow;
                if (t < 0) {
                    t += digBase;
                    borrow = 1;
                } else {
                    borrow = 0;
                }
                thisa[i] = t;
            }
            this.__n = -this.__n;
            return borrow;
        },
        __trimMostSignificantZeroDigits: function () {
            // Assume 2 <= this.__a.length.
            var a = this.__a;
            var i = a.length - 1;
            if (a[i] !== 0) {
                return;
            }
            // Trim by at least one.
            while (a[i - 1] === 0) {
                if (--i === 0) {
                    this.__num = this.__a[0];
                    this.__a = null;
                    return;
                }
            }
            a.length = i;
        },

        toNumber: function (roundingMode) {
            if (arguments.length < 1) {
                roundingMode = "towardsZero";
            } else if (roundingMode !== null) {
                switch (roundingMode) {
                    case "towardsZero":
                    case "awayFromZero":
                    case "ceiling":
                    case "floor":
                    case "mpTowardsZero":
                    case "mpAwayFromZero":
                    case "mpCeiling":
                    case "mpFloor":
                    case "bankers":
                        break;
                    default:
                        throw Error();
                }
            }
            var thisa = this.__a;
            assert(26 < digBase_log2 && digBase_log2 < 29);
            if (thisa === null) {
                return this.__n;
            }
            var i = thisa.length;
            var msd_mszbc = dig_noMostSignificantZeroBits(thisa[i - 1]);
            var noBits = i * digBase_log2 - msd_mszbc;
            var exp = noBits - 1;
            assert(0 <= exp);
            if (doubleUtil_expMaxMinusMantNoBits <= exp) {
                return this.__n < 0 ? -1 / 0 : 1 / 0;
            }
            assert(this.__n !== 0);
            var mant, mantNoBitsRem;
            mant = thisa[--i] & ((1 << (digBase_log2 - msd_mszbc - 1)) - 1);
            mantNoBitsRem = doubleUtil_mantissaSize_base2 - (digBase_log2 - msd_mszbc - 1);

            mant = mant * digBase + thisa[--i];
            mantNoBitsRem -= digBase_log2;

            assert(mantNoBitsRem < digBase_log2);
            mant = mant * pow(2, mantNoBitsRem);
            if (i === 0) {
                return doubleUtil.create(exp, mant, this.__n < 0);
            }
            var firstNotFullyReprDig_noUnreprBits = (digBase_log2 - mantNoBitsRem);
            mant += thisa[--i] >>> firstNotFullyReprDig_noUnreprBits;
            mantNoBitsRem = 0;
            var shouldCeilMagWrtRM;
            switch (roundingMode) {
                case "towardsZero":
                    shouldCeilMagWrtRM = this.__n < 0;
                    break;
                case "awayFromZero":
                    shouldCeilMagWrtRM = 0 < this.__n;
                    break;
                case "ceiling":
                    shouldCeilMagWrtRM = true;
                    break;
                case "floor":
                    shouldCeilMagWrtRM = false;
                    break;
            }
            if (shouldCeilMagWrtRM !== undefined) {
                if (shouldCeilMagWrtRM === true) {
                    return doubleUtil_incMantAndCreate(exp, mant, this.__n < 0);
                }
                return doubleUtil.create(exp, mant, this.__n < 0);
            }
            var firstNotFullyReprDig_unreprPart = (thisa[i] & ((1 << firstNotFullyReprDig_noUnreprBits) - 1));
            var nonFirstNotFullyReprDigs_areAllZeroCache;
            var mustRound = firstNotFullyReprDig_unreprPart !== 0 || (nonFirstNotFullyReprDigs_areAllZeroCache = array_areAllElementsZero(thisa, i));
            if (roundingMode === null && mustRound) {
                throw Error();
            }
            if (!mustRound) {
                return doubleUtil.create(exp, mant, this.__n < 0);
            }
            var mpInfo = firstNotFullyReprDig_unreprPart - (1 << (firstNotFullyReprDig_noUnreprBits - 1));
            if (mpInfo === 0 && (nonFirstNotFullyReprDigs_areAllZeroCache === false || !(nonFirstNotFullyReprDigs_areAllZeroCache = array_areAllElementsZero(thisa, i)))) {
                mpInfo = 1;
            }
            if (mpInfo !== 0) {
                if (0 < mpInfo) {
                    // mag above midpoint, round mag awayFromZero
                    shouldCeilMagWrtRM = 0 < this.__n;
                } else {
                    // mag below midpoint, round mag towardsZero
                    shouldCeilMagWrtRM = this.__n < 0;
                }
            } else {
                switch (roundingMode) {
                    case "mpTowardsZero":
                        shouldCeilMagWrtRM = this.__n < 0;
                        break;
                    case "mpAwayFromZero":
                        shouldCeilMagWrtRM = 0 < this.__n;
                        break;
                    case "mpCeiling":
                        shouldCeilMagWrtRM = true;
                        break;
                    case "mpFloor":
                        shouldCeilMagWrtRM = false;
                        break;
                    case "bankers":
                        if ((mant & 1) !== 0) {
                            shouldCeilMagWrtRM = 0 < this.__n;
                        } else {
                            shouldCeilMagWrtRM = this.__n < 0;
                        }
                        break;
                }
            }
            assert(shouldCeilMagWrtRM === true || shouldCeilMagWrtRM === false);
            if (shouldCeilMagWrtRM) {
                return doubleUtil_incMantAndCreate(exp, mant, this.__n < 0);
            }
            return doubleUtil.create(exp, mant, this.__n < 0);
        },

        toString: function () {
            var thisa = this.__a;
            if (thisa === null) {
                return this.__n + "";
            }
            var va = [];
            var va_len = 0;
            var i = thisa.length;
            var t1, t2, j;
            while (0 <= --i) {
                t1 = thisa[i];
                for (j = 0; j < va_len; ++j) {
                    t2 = va[j] * digBase + t1;
                    va[j] = t2 % _10_pow_digMaxLog10;
                    t1 = floor(t2 / _10_pow_digMaxLog10);
                }
                if (0 < t1) {
                    va[va_len++] = t1 % _10_pow_digMaxLog10;
                    t1 = floor(t1 / _10_pow_digMaxLog10);
                    if (0 < t1) {
                        va[va_len++] = t1;
                    }
                }
            }
            var s = "";
            for (i = 0; i < va_len - 1; ++i) {
                t1 = va[i];
                for (j = 0; j < digMaxLog10; ++j) {
                    s = string_fromCharCode(48 + t1 % 10) + s;
                    t1 = floor(t1 / 10);
                }
            }
            for (t1 = va[va_len - 1]; 1 <= t1; t1 = floor(t1 / 10)) {
                s = string_fromCharCode(48 + t1 % 10) + s;
            }
            if (this.__n < 0) {
                s = "-" + s;
            }
            return s;
        },

        valueOf: function () {
            return this.toNumber("bankers");
        }
    }, Object.create(ValueType.prototype));

    setOwnSrcPropsOnDst({
        Integer: Integer
    }, window);
})();