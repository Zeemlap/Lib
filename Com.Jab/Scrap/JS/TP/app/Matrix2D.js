(function () {
    var undefined;
    var __areDoublesClose = window.__areDoublesClose;
    var INTERNAL_SENTINEL = ___Matrix2D;
    var maxDouble = Math.max;
    var sinDouble = Math.sin;
    var cosDouble = Math.cos;
    var tanDouble = Math.tan;

    var MatrixTypes_isIdentity = 0;
    var MatrixTypes_isScaling = 1;
    var MatrixTypes_isTranslating = 2;
    var MatrixTypes_isUnknown = 7;

    var MatrixTypes_max = maxDouble(MatrixTypes_isUnknown, MatrixTypes_isTranslating, MatrixTypes_isScaling, MatrixTypes_isIdentity);
    var MatrixTypes_sizeOf_base2 = MatrixTypes_max === 0 ? 0 : log2FloorDouble(MatrixTypes_max) + 1;

    assert(MatrixTypes_sizeOf_base2 <= 14);
    function MatrixTypePair(t1, t2) {
        return (t1 << MatrixTypes_sizeOf_base2) + t2;
    }
    var MatrixTypePair_S_S = MatrixTypePair(MatrixTypes_isScaling, MatrixTypes_isScaling);
    var MatrixTypePair_S_T = MatrixTypePair(MatrixTypes_isScaling, MatrixTypes_isTranslating);
    var MatrixTypePair_S_ST = MatrixTypePair(MatrixTypes_isScaling, MatrixTypes_isScaling | MatrixTypes_isTranslating);
    var MatrixTypePair_S_U = MatrixTypePair(MatrixTypes_isScaling, MatrixTypes_isUnknown);

    var MatrixTypePair_T_S = MatrixTypePair(MatrixTypes_isTranslating, MatrixTypes_isScaling);
    var MatrixTypePair_T_T = MatrixTypePair(MatrixTypes_isTranslating, MatrixTypes_isTranslating);
    var MatrixTypePair_T_ST = MatrixTypePair(MatrixTypes_isTranslating, MatrixTypes_isScaling | MatrixTypes_isTranslating);
    var MatrixTypePair_T_U = MatrixTypePair(MatrixTypes_isTranslating, MatrixTypes_isUnknown);

    var MatrixTypePair_ST_S = MatrixTypePair(MatrixTypes_isScaling | MatrixTypes_isTranslating, MatrixTypes_isScaling);
    var MatrixTypePair_ST_T = MatrixTypePair(MatrixTypes_isScaling | MatrixTypes_isTranslating, MatrixTypes_isTranslating);
    var MatrixTypePair_ST_ST = MatrixTypePair(MatrixTypes_isScaling | MatrixTypes_isTranslating, MatrixTypes_isScaling | MatrixTypes_isTranslating);
    var MatrixTypePair_ST_U = MatrixTypePair(MatrixTypes_isScaling | MatrixTypes_isTranslating, MatrixTypes_isUnknown);

    var MatrixTypePair_U_S = MatrixTypePair(MatrixTypes_isUnknown, MatrixTypes_isScaling);
    var MatrixTypePair_U_T = MatrixTypePair(MatrixTypes_isUnknown, MatrixTypes_isTranslating);
    var MatrixTypePair_U_ST = MatrixTypePair(MatrixTypes_isUnknown, MatrixTypes_isScaling | MatrixTypes_isTranslating);
    var MatrixTypePair_U_U = MatrixTypePair(MatrixTypes_isUnknown, MatrixTypes_isUnknown);


    function Matrix2D(m11, m12, m21, m22, offsetX, offsetY) {
        var argN;
        argN = arguments.length;
        if (argN === 0) {
            this.assignIdentityMatrix();
            return;
        }
        if (argN === 1) {
            if (!(m11 instanceof Matrix2D)) {
                throw Error();
            }
            this.__assign_matrix2D(m11);
            return;
        }
        if (typeof m11 !== "number"
            || typeof m12 !== "number"
            || typeof m21 !== "number"
            || typeof m22 !== "number"
            || typeof offsetX !== "number"
            || typeof offsetY !== "number") {
            throw Error();
        }
        this.__m11 = m11;
        this.__m12 = m12;
        this.__m21 = m21;
        this.__m22 = m22;
        this.__offsetX = offsetX;
        this.__offsetY = offsetY;
        this.__type = this.__getType_computed();
    }
    function __Matrix2D(m11, m12, m21, m22, offsetX, offsetY, type) {
        this.__m11 = m11;
        this.__m12 = m12;
        this.__m21 = m21;
        this.__m22 = m22;
        this.__offsetX = offsetX;
        this.__offsetY = offsetY;
        this.__type = type;
    }
    function ___Matrix2D() { }
    Matrix2D.prototype = ___Matrix2D.prototype = __Matrix2D.prototype = setOwnSrcPropsOnDst({
        constructor: Matrix2D,

        append: function (m) {
            this.multiplyAssign(m);
            return this;
        },

        assign: function (m11, m12, m21, m22, offsetX, offsetY) {
            if (arguments.length < 2) {
                if (!(m11 instanceof Matrix2D)) throw Error();
                this.__assign_matrix2D(m11);
                return this;
            }
            if (typeof m11 !== "number"
                || typeof m12 !== "number"
                || typeof m21 !== "number"
                || typeof m22 !== "number"
                || typeof offsetX !== "number"
                || typeof offsetY !== "number") {
                throw Error();
            }
            this.__m11 = m11;
            this.__m12 = m12;
            this.__m21 = m21;
            this.__m22 = m22;
            this.__offsetX = offsetX;
            this.__offsetY = offsetY;
            this.__type = this.__getType_computed();
            return this;
        },
        __assign_matrix2D: function (m) {
            this.__m11 = m.__m11;
            this.__m12 = m.__m12;
            this.__m21 = m.__m21;
            this.__m22 = m.__m22;
            this.__offsetX = m.__offsetX;
            this.__offsetY = m.__offsetY;
            this.__type = this.__getType_computed();
        },
        assignIdentityMatrix: function () {
            this.__m11 = 1;
            this.__m12 = 0;
            this.__m21 = 0;
            this.__m22 = 1;
            this.__offsetX = 0;
            this.__offsetY = 0;
            this.__type = MatrixTypes_isIdentity;
            return this;
        },
        assignRotationMatrix: function (angleInRadians, cx, cy) {
            var cos, sin, fCenter;
            if (typeof angleInRadians !== "number") {
                throw Error();
            }
            fCenter = 1 < arguments.length;
            if (fCenter) {
                if (typeof cx !== "number"
                    || typeof cy !== "number") {
                    throw Error();
                }
            }
            cos = cosDouble(angleInRadians);
            sin = sinDouble(angleInRadians);
            this.__m11 = cos;
            this.__m12 = sin;
            this.__m21 = -sin;
            this.__m22 = cos;
            if (fCenter) {
                this.__offsetX = cx * (1 - cos) + cy * sin;
                this.__offsetY = cy * (1 - cos) - cx * sin;
            } else {
                this.__offsetX = 0;
                this.__offsetY = 0;
            }
            this.__type = MatrixTypes_isUnknown;
            return this;
        },
        assignScalingMatrix: function (sx, sy, cx, cy) {
            var fCenter;
            if (typeof sx !== "number"
                || typeof sy !== "number") {
                throw Error();
            }
            fCenter = 2 < arguments.length;
            if (fCenter) {
                if (typeof cx !== "number"
                    || typeof cy !== "number") {
                    throw Error();
                }
                if (cx === 0 && cy === 0) {
                    fCenter = false;
                }
            }
            this.__m11 = sx;
            this.__m12 = 0;
            this.__m21 = 0;
            this.__m22 = sy;
            this.__type = MatrixTypes_isScaling;
            if (fCenter) {
                this.__offsetX = cx * (1 - sx);
                this.__offsetY = cy * (1 - sy);
                this.__type |= MatrixTypes_isTranslating;
            } else {
                this.__offsetX = 0;
                this.__offsetY = 0;
            }
            return this;
        },
        assignSkewMatrix: function (angleXInRadians, angleYInRadians) {
            if (typeof angleXInRadians !== "number"
                || typeof angleYInRadians !== "number") {
                throw Error();
            }
            this.__m11 = 1;
            this.__m12 = tanDouble(angleYInRadians);
            this.__m21 = tanDouble(angleXInRadians);
            this.__m22 = 1;
            this.__offsetX = 0;
            this.__offsetY = 0;
            this.__type = MatrixTypes_isUnknown;
            return this;
        },
        assignTranslationMatrix: function (offsetX, offsetY) {
            if (typeof offsetX !== "number"
                || typeof offsetY !== "number") {
                throw Error();
            }
            this.__m11 = 1;
            this.__m12 = 0;
            this.__m21 = 0;
            this.__m22 = 1;
            this.__offsetX = offsetX;
            this.__offsetY = offsetY;
            this.__type = MatrixTypes_isTranslating;
            return this;
        },
        clone: function () {
            return new __Matrix2D(
                this.__m11,
                this.__m12,
                this.__m21,
                this.__m22,
                this.__offsetX,
                this.__offsetY,
                this.__type);
        },

        equals: function (o) {
            if (o == null || o.constructor !== Matrix2D) return false;
            return __areDoublesEqual(this.__m11, o.__m11)
                && __areDoublesEqual(this.__m12, o.__m12)
                && __areDoublesEqual(this.__m21, o.__m21)
                && __areDoublesEqual(this.__m22, o.__m22)
                && __areDoublesEqual(this.__offsetX, o.__offsetX)
                && __areDoublesEqual(this.__offsetY, o.__offsetY);
        },

        getDeterminant: function () {
            switch (this.__type) {
                case MatrixTypes_isIdentity:
                case MatrixTypes_isTranslating:
                    return 1;
                case MatrixTypes_isScaling:
                case MatrixTypes_isScaling | MatrixTypes_isTranslating:
                    return this.__m11 * this.__m22;
            }
            return this.__m11 * this.__m22 - this.__m12 * this.__m21;
        },

        getIsIdentity: function () {
            return this.__type === MatrixTypes_isIdentity
                || (this.__m11 === 1
                && this.__m12 === 0
                && this.__m21 === 0
                && this.__m22 === 1
                && this.__offsetX === 0
                && this.__offsetY === 0);
        },

        getIsNotCloseToHavingNoInverse: function () {
            return !__areDoublesClose(this.getDeterminant(), 0);
        },

        getM11: function () { return this.__m11; },
        getM12: function () { return this.__m12; },
        getM21: function () { return this.__m21; },
        getM22: function () { return this.__m22; },
        getOffsetX: function () { return this.__offsetX; },
        getOffsetY: function () { return this.__offsetY; },

        __getType_computed: function () {
            var t;
            if (this.__m12 !== 0 || this.__m21 !== 0) {
                return MatrixTypes_isUnknown;
            }
            t = MatrixTypes_isIdentity;
            if (this.__m11 !== 1 || this.__m22 !== 1) {
                t |= MatrixTypes_isScaling;
            }
            if (this.__offsetX !== 0 || this.__offsetY !== 0) {
                t |= MatrixTypes_isTranslating;
            }
            return t;
        },

        multiplyAssign: function (m) {
            var thist, mt;
            if (m == null || m.constructor !== Matrix2D) {
                throw Error();
            }
            mt = m.__type;
            if (mt === MatrixTypes_isIdentity) {
                return this;
            }
            thist = this.__type;
            if (thist === MatrixTypes_isIdentity) {
                if (mt !== MatrixTypes_isUnknown) {
                    this.__type = mt;
                    if ((mt & MatrixTypes_isScaling) !== 0) {
                        this.__m11 = m.__m11;
                        this.__m22 = m.__m22;
                    }
                    if ((mt & MatrixTypes_isTranslating) !== 0) {
                        this.__offsetX = m.__offsetX;
                        this.__offsetY = m.__offsetY;
                    }
                } else {
                    this.__assign_matrix2D(m);
                }
                return this;
            }
            switch ((thist << MatrixTypes_sizeOf_base2) + mt) {
                case MatrixTypePair_S_S:
                case MatrixTypePair_ST_S:
                case MatrixTypePair_T_S:
                    this.__m11 *= m.__m11;
                    this.__m22 *= m.__m22;
                    this.__type |= MatrixTypes_isScaling;
                    break;
                case MatrixTypePair_S_ST:
                case MatrixTypePair_ST_ST:
                    this.__offsetX += this.__m11 * m.__offsetX;
                    this.__m11 *= m.__m11;
                    this.__offsetY += this.__m22 * m.__offsetY;
                    this.__m22 *= m.__m22;
                    this.__type |= MatrixTypes_isTranslating;
                    break;
                case MatrixTypePair_S_T:
                case MatrixTypePair_ST_T:
                    this.__offsetX += this.__m11 * m.__offsetX;
                    this.__offsetY += this.__m22 * m.__offsetY;
                    this.__type |= MatrixTypes_isTranslating;
                    break;
                case MatrixTypePair_S_U:
                case MatrixTypePair_ST_U:
                    this.__m21 = this.__m11 * m.__m21;
                    this.__offsetX += this.__m11 * m.__offsetX;
                    this.__m11 *= m.__m11;
                    this.__m12 = this.__m22 * m.__m12;
                    this.__offsetY += this.__m22 * m.__offsetY;
                    this.__m22 *= m.__m22;
                    this.__type = MatrixTypes_isUnknown;
                    break;
                case MatrixTypePair_T_ST:
                    this.__m11 = m.__m11;
                    this.__m22 = m.__m22;
                    this.__offsetX += m.__offsetX;
                    this.__offsetY += m.__offsetY;
                    this.__type |= MatrixTypes_isScaling;
                    break;
                case MatrixTypePair_T_T:
                    this.__offsetX += m.__offsetX;
                    this.__offsetY += m.__offsetY;
                    break;
                case MatrixTypePair_T_U:
                    this.__m11 = m.__m11;
                    this.__m12 = m.__m12;
                    this.__m21 = m.__m21;
                    this.__m22 = m.__m22;
                    this.__offsetX += m.__offsetX;
                    this.__offsetY += m.__offsetY;
                    this.__type = MatrixTypes_isUnknown;
                    break;
                case MatrixTypePair_U_S:
                    this.__m11 *= m.__m11;
                    this.__m21 *= m.__m22;
                    this.__m12 *= m.__m11;
                    this.__m22 *= m.__m22;
                    break;
                case MatrixTypePair_U_ST:
                    this.__offsetX += this.__m11 * m.__offsetX + this.__m21 * m.__offsetY;
                    this.__m11 *= m.__m11;
                    this.__m21 *= m.__m22;
                    this.__offsetY += this.__m12 * m.__offsetX + this.__m22 * m.__offsetY;
                    this.__m12 *= m.__m11;
                    this.__m22 *= m.__m22;
                    break;
                case MatrixTypePair_U_T:
                    this.__offsetX += this.__m11 * m.__offsetX + this.__m21 * m.__offsetY;
                    this.__offsetY += this.__m12 * m.__offsetX + this.__m22 * m.__offsetY;
                    break;
                case MatrixTypePair_U_U:
                    __Matrix2D_multiply(this, m, this);
                    break;
                default:
                    throw Error();
            }
            return this;
        },

        prepend: function (m) {
            var thist, mt;
            if (m == null || m.constructor !== Matrix2D) {
                throw Error();
            }
            mt = m.__type;
            if (mt === MatrixTypes_isIdentity) {
                return this;
            }
            thist = this.__type;
            if (thist === MatrixTypes_isIdentity) {
                if (mt !== MatrixTypes_isUnknown) {
                    this.__type = mt;
                    if ((mt & MatrixTypes_isScaling) !== 0) {
                        this.__m11 = m.__m11;
                        this.__m22 = m.__m22;
                    }
                    if ((mt & MatrixTypes_isTranslating) !== 0) {
                        this.__offsetX = m.__offsetX;
                        this.__offsetY = m.__offsetY;
                    }
                } else {
                    this.__assign_matrix2D(m);
                }
                return this;
            }
            switch ((mt << MatrixTypes_sizeOf_base2) + thist) {
                case MatrixTypePair_S_S:
                case MatrixTypePair_T_ST:
                case MatrixTypePair_T_T:
                case MatrixTypePair_T_U:
                    this.__m11 *= m.__m11;
                    this.__m22 *= m.__m22;
                    this.__offsetX += m.__offsetX;
                    this.__offsetY += m.__offsetY;
                    break;
                case MatrixTypePair_ST_S:
                case MatrixTypePair_T_S:
                    this.__offsetX = m.__offsetX;
                    this.__offsetY = m.__offsetY;
                    this.__m11 *= m.__m11;
                    this.__m22 *= m.__m22;
                    this.__type |= MatrixTypes_isTranslating;
                    break;
                case MatrixTypePair_S_ST:
                case MatrixTypePair_S_T:
                    this.__offsetX *= m.__m11;
                    this.__offsetY *= m.__m22;
                    this.__m11 *= m.__m11;
                    this.__m22 *= m.__m22;
                    this.__type |= MatrixTypes_isScaling;
                    break;
                case MatrixTypePair_ST_ST:
                case MatrixTypePair_ST_T:
                    this.__offsetX = this.__offsetX * m.__m11 + m.__offsetX;
                    this.__offsetY = this.__offsetY * m.__m22 + m.__offsetY;
                    this.__m11 *= m.__m11;
                    this.__m22 *= m.__m22;
                    this.__type |= MatrixTypes_isScaling;
                    break;
                case MatrixTypePair_S_U:
                case MatrixTypePair_ST_U:
                    this.__m21 *= m.__m11;
                    this.__offsetX = this.__offsetX * m.__m11 + m.__offsetX;
                    this.__m11 *= m.__m11;
                    this.__m12 *= m.__m22;
                    this.__offsetY = this.__offsetY * m.__m22 + m.__offsetY;
                    this.__m22 *= m.__m22;
                    break;
                case MatrixTypePair_U_S:
                case MatrixTypePair_U_ST:
                case MatrixTypePair_U_T:
                    this.__m21 = m.__m21 * this.__m22;
                    this.__m12 = m.__m12 * this.__m11;
                    this.__m11 *= m.__m11;
                    this.__m22 *= m.__m22;
                    this.__offsetX = m.__m11 * this.__offsetX + m.__m21 * this.__offsetY + m.__offsetX;
                    this.__offsetY = m.__m12 * this.__offsetX + m.__m22 * this.__offsetY + m.__offsetY;
                    this.__type = MatrixTypes_isUnknown;
                    break;
                case MatrixTypePair_U_U:
                    __Matrix2D_multiply(m, this, this);
                    break;
                default:
                    throw Error();
            }
            return this;
        },

        rotate: function (angleInRadians) {
            return this.multiplyAssign(new ___Matrix2D().assignRotationMatrix(angleInRadians));
        },
        rotateAt: function (angleInRadians, cx, cy) {
            return this.multiplyAssign(new ___Matrix2D().assignRotationMatrix(angleInRadians, cx, cy));
        },
        rotateAtPrepend: function (angleInRadians, cx, cy) {
            this.prepend(new ___Matrix2D().assignRotationMatrix(angleInRadians, cx, cy));
        },
        rotatePrepend: function (angleInRadians) {
            this.prepend(new ___Matrix2D().assignRotationMatrix(angleInRadians));
        },

        scale: function (sx, sy) {
            if (typeof sx !== "number"
                || typeof sy !== "number") {
                throw Error();
            }
            this.__m11 *= sx;
            this.__m22 *= sy;
            return this;
        },
        scaleAt: function (sx, sy, cx, cy) {
            return this.multiplyAssign(new ___Matrix2D().assignScalingMatrix(sx, sy, cx, cy));
        },
        scaleAtPrepend: function (sx, sy, cx, cy) {
            return this.prepend(new ___Matrix2D().assignScalingMatrix(sx, sy, cx, cy));
        },

        skew: function (angleXInRadians, angleYInRadians) {
            return this.multiplyAssign(new ___Matrix2D().assignSkewMatrix(angleXInRadians, angleYInRadians));
        },
        skewPrepend: function (angleXInRadians, angleYInRadians) {
            return this.prepend(new ___Matrix2D().assignSkewMatrix(angleXInRadians, angleYInRadians));
        },

        transform: function (v) {
            var x, y;
            if (!(v instanceof Vector2)) {
                throw Error();
            }
            switch (this.__type) {
                case MatrixTypes_isIdentity: break;
                case MatrixTypes_isScaling:
                    v.__x *= this.__m11;
                    v.__y *= this.__m22;
                    break;
                case MatrixTypes_isTranslating:
                    v.__x += this.__offsetX;
                    v.__y += this.__offsetY;
                    break;
                case MatrixTypes_isScaling | MatrixTypes_isTranslating:
                    v.__x = v.__x * this.__m11 + this.__offsetX;
                    v.__y = v.__y * this.__m22 + this.__offsetY;
                    break;
                default:
                    x = v.__x * this.__m11 + v.__y * this.__m21 + this.__offsetX;
                    y = v.__x * this.__m12 + v.__y * this.__m22 + this.__offsetY;
                    v.__x = x;
                    v.__y = y;
                    break;
            }
            return v;
        },

        translate: function (offsetX, offsetY) {
            if (typeof offsetX !== "number" || typeof offsetY !== "number") {
                throw Error();
            }
            this.__offsetX += offsetX;
            this.__offsetY += offsetY;
            this.__type |= MatrixTypes_isTranslating;
        },
        translatePrepend: function (offsetX, offsetY) {
            if (typeof offsetX !== "number" || typeof offsetY !== "number") {
                throw Error();
            }
            this.__offsetX += this.__m11 * offsetX + this.__m21 * offsetY;
            this.__offsetY += this.__m12 * offsetX + this.__m22 * offsetY;
            this.__type |= MatrixTypes_isTranslating;
        },

        // returns null if this.getIsNotCloseToHavingNoInverse() === false
        // otherwise inverts this and returns this
        tryInvert: function () {
            var det, oneOverDet;
            var m11, m12, m21, m22, offsetX, offsetY;
            switch (this.__type) {
                case MatrixTypes_isIdentity:
                    return this;
                case MatrixTypes_isScaling:
                    this.__m11 = 1 / this.__m11;
                    this.__m22 = 1 / this.__m22;
                    return this;
                case MatrixTypes_isTranslating:
                    this.__offsetX = -this.__offsetX;
                    this.__offsetY = -this.__offsetY;
                    return this;
                case MatrixTypes_isScaling | MatrixTypes_isTranslating:
                    this.__m11 = 1 / this.__m11;
                    this.__m22 = 1 / this.__m22;
                    this.__offsetX = -this.__offsetX * this.__m11;
                    this.__offsetY = -this.__offsetY * this.__m22;
                    return this;
            }
            det = this.getDeterminant();
            if (__areDoublesClose(det, 0)) {
                return null;
            }
            oneOverDet = 1 / det;
            m11 = this.__m22 * oneOverDet;
            m12 = -this.__m12 * oneOverDet;
            m21 = -this.__m21 * oneOverDet;
            m22 = this.__m11 * oneOverDet;
            offsetX = (this.__m21 * this.__offsetY - this.__offsetX * this.__m22) * oneOverDet;
            offsetY = (this.__offsetX * this.__m12 - this.__m11 * this.__offsetY) * oneOverDet;
            this.__m11 = m11;
            this.__m12 = m12;
            this.__m21 = m21;
            this.__m22 = m22;
            this.__offsetX = offsetX;
            this.__offsetY = offsetY;
            this.__type = MatrixTypes_isUnknown;
            return this;
        }
    }, Object.create(ValueType.prototype));
    function __Matrix2D_multiply(a, b, c) {
        var m11, m12, m21, m22, offsetX, offsetY;
        m11 = a.__m11 * b.__m11 + a.__m21 * b.__m12;
        m12 = a.__m12 * b.__m11 + a.__m22 * b.__m12;
        m21 = a.__m11 * b.__m21 + a.__m21 * b.__m22;
        m22 = a.__m12 * b.__m21 + a.__m22 * b.__m22;
        offsetX = a.__m11 * b.__offsetX + a.__m21 * b.__offsetY + a.__offsetX;
        offsetY = a.__m12 * b.__offsetX + a.__m22 * b.__offsetY + a.__offsetY;
        c.__m11 = m11;
        c.__m12 = m12;
        c.__m21 = m21;
        c.__m22 = m22;
        c.__offsetX = offsetX;
        c.__offsetY = offsetY;
        c.__type = MatrixTypes_isUnknown;
    }
    if (hasOwnPropertyFunction.call(window, "JsonMarkup")) {
        var getOptionOnce = JsonMarkup.getOptionOnce;
        JsonMarkup.__addType("Matrix2D", null, null, function (options) {
            var m11, m12, m21, m22, offsetX, offsetY;
            m11 = getOptionOnce(options, "m11", INTERNAL_SENTINEL);
            m12 = getOptionOnce(options, "m12", INTERNAL_SENTINEL);
            m21 = getOptionOnce(options, "m21", INTERNAL_SENTINEL);
            m22 = getOptionOnce(options, "m22", INTERNAL_SENTINEL);
            offsetX = getOptionOnce(options, "offsetX", INTERNAL_SENTINEL);
            offsetY = getOptionOnce(options, "offsetY", INTERNAL_SENTINEL);
            return new Matrix2D(m11, m12, m21, m22, offsetX, offsetY);
        });
    }

    setOwnSrcPropsOnDst({
        Matrix2D: Matrix2D
    }, window);

})();