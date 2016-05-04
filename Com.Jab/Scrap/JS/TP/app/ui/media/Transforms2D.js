(function () {
    var hasOwnPropertyFunction = Object.prototype.hasOwnProperty;
    
    var Object_create = Object.create;
    var Matrix2D_prototype = Matrix2D.prototype;
    var __areDoublesEqual = window.__areDoublesEqual;
    var INTERNAL_SENTINEL = __MatrixTransform2D;

    function Transform2D() {
        ObjectWithEvents.call(this);
        this.__matrixCache_isValid = false;
        this.__matrixCache = Object_create(Matrix2D_prototype);
    }
    Transform2D.prototype = setOwnSrcPropsOnDst({
        constructor: Transform2D,
        getInverse: function () {
            var m;
            m = this.toMatrix();
            if (null === m.tryInvert()) {
                return null;
            }
            return new __MatrixTransform2D(m);
        },
        getIsIdentity: function () {
            throw Error();
        },
        __getMatrixCache: function () {
            return this.__matrixCache;
        },
        __invalidateMatrixCache: function () {
            this.__matrixCache_isValid = false;
        },
        toMatrix: function () {
            var m;
            if (this.__matrixCache_isValid) {
                return this.__getMatrixCache().clone();
            }
            m = Object_create(Matrix2D_prototype);
            this.__toMatrixCore(m);
            return m;
        },
        __toMatrixCore: function (m) {
            throw Error();
        },
        __raiseChangedEvent: function() {
            this.raiseEvent("changed", EventArgs.getEmpty());
        },
        transform: function (v) {
            this.__validateMatrixCacheAndGet().transform(v);
        },
        __validateMatrixCacheAndGet: function () {
            var m;
            m = this.__getMatrixCache();
            if (!this.__matrixCache_isValid) {
                this.__toMatrixCore(m);
                this.__matrixCache_isValid = true;
            }
            return m;
        }
    }, Object_create(ObjectWithEvents.prototype));
    EventClass.register(Transform2D, "changed",
        null,
        EventQueueBehavior.AT_MOST_ONE_EVENT_PER_OBJECT);

    function RotateTransform2D() {
        Transform2D.call(this);
        this.__centerX = 0;
        this.__centerY = 0;
        this.__angleInRadians = 0;
    }
    RotateTransform2D.prototype = setOwnSrcPropsOnDst({
        constructor: RotateTransform2D,
        getAngleInRadians: function () {
            return this.__angleInRadians;
        },
        getCenterX: function () {
            return this.__centerX;
        },
        getCenterY: function() {
            return this.__centerY;
        },
        getIsIdentity: function () {
            return this.__angleInRadians === 0;
        },
        __onChanged: function (e) {
            Transform2D.prototype.__onChanged.call(this, e);
            this.__invalidateMatrixCache();
        },
        __onPropertyChanged: function (e) {
            Transform2D.prototype.__onPropertyChanged.call(this, e);
            switch (e.getPropertyName()) {
                case "angleInRadians":
                case "centerX":
                case "centerY":
                    this.__raiseChangedEvent();
                    break;
            }
        },
        setAngleInRadians: function (v) {
            var ov;
            if (!isFiniteDouble(v)) throw Error();
            ov = this.__angleInRadians;
            if (ov === v) return;
            this.__angleInRadians = v;
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("angleInRadians", ov, v));
        },
        setCenterX: function (v) {
            var ov;
            if (!isFiniteDouble(v)) throw Error();
            ov = this.__centerX;
            if (__areDoublesEqual(ov, v)) return;
            this.__centerX = v;
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("centerX", ov, v));
        },
        setCenterY: function (v) {
            var ov;
            if (!isFiniteDouble(v)) throw Error();
            ov = this.__centerY;
            if (__areDoublesEqual(ov, v)) return;
            this.__centerY = v;
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("centerY", ov, v));
        },
        __toMatrixCore: function (m) {
            m.assignRotationMatrix(
                this.getAngleInRadians(),
                this.getCenterX(),
                this.getCenterY());
        }
    }, Object_create(Transform2D.prototype));

    function MatrixTransform2D() {
        Transform2D.call(this);
        this.__matrixCache.assignIdentityMatrix();
        this.__matrixCache_isValid = true;
    }
    function __MatrixTransform2D(m) {
        Transform2D.call(this);
        this.__matrixCache.assign(m);
        this.__matrixCache_isValid = true;
    }
    MatrixTransform2D.prototype = __MatrixTransform2D.prototype = setOwnSrcPropsOnDst({
        constructor: MatrixTransform2D,
        getIsIdentity: function () {
            return this.__getMatrixCache().getIsIdentity();
        },
        getMatrix: function () {
            return this.__getMatrixCache().clone();
        },
        __onPropertyChanged: function (e) {
            Transform2D.prototype.__onPropertyChanged.call(this, e);
            switch (e.getPropertyName()) {
                case "matrix":
                    this.__raiseChangedEvent();
                    break;
            }
        },
        setMatrix: function (value) {
            var thisv, oldv;
            thisv = this.__getMatrixCache();
            if (thisv.equals(value)) return;
            if (!(value instanceof Matrix2D)) throw Error();
            oldv = thisv.clone();
            thisv.assign(value);
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("matrix", oldv, thisv.clone()));
        },
        __toMatrixCore: function (m) {
            throw Error();
        }
    }, Object_create(Transform2D.prototype));

    function ScaleTransform2D() {
        Transform2D.call(this);
        this.__centerX = 0;
        this.__centerY = 0;
        this.__scaleX = 1;
        this.__scaleY = 1;
    }
    ScaleTransform2D.prototype = setOwnSrcPropsOnDst({
        constructor: ScaleTransform2D,
        getCenterX: function () {
            return this.__centerX;
        },
        getCenterY: function () {
            return this.__centerY;
        },
        getScaleX: function () { return this.__scaleX; },
        getScaleY: function () { return this.__scaleY; },

        getIsIdentity: function () {
            return this.__scaleX === 1 && this.__scaleY === 1;
        },

        __onChanged: function (e) {
            Transform2D.prototype.__onChanged.call(this, e);
            this.__invalidateMatrixCache();
        },
        __onPropertyChanged: function (e) {
            Transform2D.prototype.__onPropertyChanged.call(this, e);
            switch (e.getPropertyName()) {
                case "centerX":
                case "centerY":
                case "scaleX":
                case "scaleY":
                    this.__raiseChangedEvent();
                    break;
            }
        },

        setCenterX: function (v) {
            var ov;
            if (!isFiniteDouble(v)) throw Error();
            ov = this.__centerX;
            if (__areDoublesEqual(ov, v)) return;
            this.__centerX = v;
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("centerX", ov, v));
        },
        setCenterY: function (v) {
            var ov;
            if (!isFiniteDouble(v)) throw Error();
            ov = this.__centerY;
            if (__areDoublesEqual(ov, v)) return;
            this.__centerY = v;
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("centerY", ov, v));
        },
        setScaleX: function (v) {
            var ov;
            if (isFiniteDouble(v)) throw Error();
            ov = this.__scaleX;
            if (__areDoublesEqual(ov, v)) return;
            this.__scaleX = v;
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("scaleX", ov, v));
        },
        setScaleY: function (v) {
            var ov;
            if (isFiniteDouble(v)) throw Error();
            ov = this.__scaleY;
            if (__areDoublesEqual(ov, v)) return;
            this.__scaleY = v;
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("scaleY", ov, v));
        },
        __toMatrixCore: function (m) {
            m.assignScalingMatrix(
                this.__scaleX, this.__scaleY,
                this.__centerX, this.__centerY);
        }
    }, Object_create(Transform2D.prototype));

    function TranslateTransform2D() {
        Transform2D.call(this);
        this.__x = 0;
        this.__y = 0;
    }
    TranslateTransform2D.prototype = setOwnSrcPropsOnDst({
        constructor: TranslateTransform2D,
        getIsIdentity: function() {
            return this.__x === 0
                && this.__y === 0;
        },
        getX: function () {
            return this.__x;
        },
        getY: function () {
            return this.__y;
        },
        __onChanged: function(e) {
            Transform2D.prototype.__onChanged.call(this, e);
            this.__invalidateMatrixCache();
        },
        __onPropertyChanged: function (e) {
            Transform2D.prototype.__onPropertyChanged.call(this, e);
            switch (e.getPropertyName()) {
                case "x":
                case "y":
                    this.__raiseChangedEvent();
                    break;
            }
        },
        setX: function (value) {
            var ov;
            if (!isFiniteDouble(value)) throw Error();
            ov = this.__x;
            if (__areDoublesEqual(ov, value)) return;
            this.__x = value;
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("x", ov, v));
        },
        setY: function (value) {
            var ov;
            if (!isFiniteDouble(value)) throw Error();
            ov = this.__y;
            if (__areDoublesEqual(ov, value)) return;
            this.__y = value;
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("y", ov, v));
        },
        __toMatrixCore: function (m) {
            m.assignTranslationMatrix(this.__x, this.__y);
        }
    }, Object_create(Transform2D.prototype));

    function SkewTransform2D() {
        Transform2D.call(this);
        this.__centerX = 0;
        this.__centerY = 0;
        this.__angleXInRadians = 0;
        this.__angleYInRadians = 0;
    }
    SkewTransform2D.prototype = setOwnSrcPropsOnDst({
        constructor: SkewTransform2D,
        getAngleXInRadians: function () {
            return this.__angleXInRadians;
        },
        getAngleYInRadians: function () {
            return this.__angleYInRadians;
        },
        getCenterX: function () {
            return this.__centerX;
        },
        getCenterY: function () {
            return this.__centerY;
        },
        getIsIdentity: function() {
            return this.__angleXInRadians === 0 && this.__angleYInRadians === 0;
        }, 
        __onChanged: function (e) {
            Transform2D.prototype.__onChanged.call(this, e);
            this.__invalidateMatrixCache();
        },
        __onPropertyChanged: function (e) {
            Transform2D.prototype.__onPropertyChanged.call(this, e);
            switch (e.getPropertyName()) {
                case "angleXInRadians":
                case "angleYInRadians":
                case "scaleX":
                case "scaleY":
                    this.__raiseChangedEvent();
                    break;
            }
        },

        setAngleXInRadians: function (v) {
            var ov;
            if (isFiniteDouble(v)) throw Error();
            ov = this.__angleXInRadians;
            if (__areDoublesEqual(ov, v)) return;
            this.__angleXInRadians = v;
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("angleXInRadians", ov, v));
        },
        setAngleYInRadians: function (v) {
            var ov;
            if (isFiniteDouble(v)) throw Error();
            ov = this.__angleYInRadians;
            if (__areDoublesEqual(ov, v)) return;
            this.__angleYInRadians = v;
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("angleYInRadians", ov, v));
        },
        setCenterX: function (v) {
            var ov;
            if (!isFiniteDouble(v)) throw Error();
            ov = this.__centerX;
            if (__areDoublesEqual(ov, v)) return;
            this.__centerX = v;
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("centerX", ov, v));
        },
        setCenterY: function (v) {
            var ov;
            if (!isFiniteDouble(v)) throw Error();
            ov = this.__centerY;
            if (__areDoublesEqual(ov, v)) return;
            this.__centerY = v;
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("centerY", ov, v));
        },
        __toMatrixCore: function (m) {
            if (this.__centerX === 0 && this.__centerY === 0) {
                m.assignSkewMatrix(this.__angleXInRadians, this.__angleYInRadians);
            } else {
                m.assignTranslationMatrix(-this.__centerX, -this.__centerY);
                m.skew(this.__angleXInRadians, this.__angleYInRadians);
                m.translate(this.__centerX, this.__centerY);
            }
        }
    }, Object_create(Transform2D.prototype));

    function Transform2DGroup() {
        Transform2D.call(this);
        this.__children = null;
    }
    function Transform2DGroup_hasDescendant_addChildrenToQueue(transformQueue, transform1) {
        var transform1Children, n, j;
        var i;
        i = transformQueue.length;
        if ((transform1Children = transform1.__children) !== null) {
            n = transform1Children.getCount();
            for (j = 0; j < n; j++) {
                transformQueue[i++] = transform1Children.get(j);
            }
        }
    }
    Transform2DGroup.prototype = setOwnSrcPropsOnDst({
        constructor: Transform2DGroup,
        getChildren: function () {
            var c;
            c = this.__children;
            if (c === null) {
                c = new Transform2DList();
                c.__addEventHandler("listChanging", this.__onChildrenListChanging, this);
                c.__addEventHandler("changed", this.__onChildrenChanged, this);
                this.__children = c;
            }
            return c;
        },
        getIsIdentity: function () {
            var i, n, children;
            if ((children = this.__children) !== null && 0 < (n = children.getCount())) {
                if (this.__matrixCache_isValid) {
                    return this.__getMatrixCache().getIsIdentity();
                }
                i = 0;
                do {
                    if (!children.get(i).getIsIdentity()) {
                        return false;
                    }
                } while (++i < n);
            }
            return true;
        },
        __hasDescendant: function(transform2) {
            var transformQueue;
            var transform1;
            if (!(transform2 instanceof Transform2D)) {
                throw Error();
            }
            if (this === transform2) {
                return false;
            }
            transformQueue = [];
            Transform2DGroup_hasDescendant_addChildrenToQueue(transformQueue, this);
            while ((transform1 = transformQueue.pop()) !== undefined) {
                if (transform1 === transform2) {
                    return true;
                }
                if (transform1 instanceof Transform2DGroup) {
                    Transform2DGroup_hasDescendant_addChildrenToQueue(transformQueue, transform1);
                }
            }
            return false;
        },
        __onChanged: function (e) {
            Transform2D.prototype.__onChanged.call(this, e);
            this.__invalidateMatrixCache();
        },
        __onChildrenChanged: function (sender, e) {
            this.__raiseChangedEvent();
        },
        __onChildrenListChanging: function (sender, e) {
            var i, items, n;
            if (0 <= e.getNewIndex()) {
                items = e.__newItems;
                for (i = 0, n = items.length; i < n; i++) {
                    if (!(items[i] instanceof Transform2DGroup)) {
                        continue;
                    }
                    if (items[i] === this || items[i].__hasDescendant(this)) {
                        throw Error();
                    }
                }
            }
        },
        __onDisposed: function (e) {
            Transform2D.prototype.__onDisposed.call(this, e);
            this.__removeChildrenEventHandlers();
        },
        __removeChildrenEventHandlers: function() {
            if (this.__children !== null) {
                this.__children.__removeEventHandler("listChanging", this.__onChildrenListChanging, this);
                this.__children.__removeEventHandler("changed", this.__onChildrenChanged, this);
            }
        },
        setChildren: function (value) {
            if (!(value instanceof Transform2DList) || value.getIsDisposed()) throw Error();
            this.__removeChildrenEventHandlers();
            this.__children = value;
            value.__addEventHandler("listChanging", this.__onChildrenListChanging, this);
            value.__addEventHandler("changed", this.__onChildrenChanged, this);
            this.__raiseChangedEvent();
        },
        __toMatrixCore: function (m) {
            var c, i, n;
            c = this.__children;
            if (c === null || (n = c.getCount()) === 0) {
                m.assignIdentityMatrix();
            } else {
                m.assign(c.get(0).__validateMatrixCacheAndGet());
                for (i = 1; i < n; i++) {
                    m.multiplyAssign(c.get(i).__validateMatrixCacheAndGet());
                }
            }
        }
    }, Object_create(Transform2D.prototype));

    function Transform2DList_isItemValid(v) {
        return v instanceof Transform2D && !v.getIsDisposed();
    }
    function Transform2DList() {
        List.call(this, {
            isItemValid: Transform2DList_isItemValid,
            canUseResetListChangeType: false
        });
    }
    Transform2DList.prototype = setOwnSrcPropsOnDst({
        constructor: Transform2DList,
        __onDisposed: function (e) {
            var i, n;
            List.prototype.__onDisposed.call(this, e);
            for (i = 0, n = this.getCount() ; i < n; i++) {
                this.__removeItemEventHandlers(this.get(i));

            }
        },
        __onItemChanged: function (sender, e) {
            this.__raiseChangedEvent();
        },
        __onItemDisposed: function (sender, e) {
            var f;
            f = this.remove(sender);
            assert(f);
        },
        __onListChanged: function (e) {
            var i, items, n;
            List.prototype.__onListChanged.call(this, e);
            if (0 <= e.getOldIndex()) {
                items = e.__oldItems;
                for (i = 0, n = items.length; i < n; i++) {
                    this.__removeItemEventHandlers(items[i]);
                }
            }
            if (0 <= e.getNewIndex()) {
                items = e.__newItems;
                for (i = 0, n = items.length; i < n; i++) {
                    items[i].__addEventHandler("changed", this.__onItemChanged, this);
                    items[i].__addEventHandler("disposed", this.__onItemDisposed, this);
                }
            }
            this.__raiseChangedEvent();
        },
        __raiseChangedEvent: function () {
            this.raiseEvent("changed", EventArgs.getEmpty());
        },
        __removeItemEventHandlers: function(item) {
            item.__removeEventHandler("changed", this.__onItemChanged, this);
            item.__removeEventHandler("disposed", this.__onItemDisposed, this);
        }
    }, Object_create(List.prototype));
    EventClass.register(Transform2DList, "changed",
        null,
        EventQueueBehavior.AT_MOST_ONE_EVENT_PER_OBJECT);
    
    setOwnSrcPropsOnDst({
        MatrixTransform2D: MatrixTransform2D,
        RotateTransform2D: RotateTransform2D,
        Transform2D: Transform2D,        
        Transform2DList: Transform2DList,
        Transform2DGroup: Transform2DGroup,
        TranslateTransform2D: TranslateTransform2D,
        SkewTransform2D: SkewTransform2D,
    }, window);

    var getOptionOnce = JsonMarkup.getOptionOnce;
    var Transform2DType_matrix = 0;
    var Transform2DType_rotate = 1;              
    var Transform2DType_translate = 2;
    var Transform2DType_scale = 3;
    var Transform2DType_skew = 4;
    JsonMarkup.__addType("Transform2D", null, "ObjectWithEvents", function (options) {
        var i, n;
        var transform2D;
        var t1, t2;
        if (isArray(options)) {
            transform2D = new Transform2DGroup();
            t1 = transform2D.getChildren();
            for (i = 0, n = options.length; i < n; i++) {
                t2 = JsonMarkup.convertToObject(options[i], "Transform2D");
                if (!(t2 instanceof Transform2D)) throw Error();
                t1.add(t2);
            }
            return transform2D;
        }
        t2 = false;
        for (i in options) if (hasOwnPropertyFunction.call(options, i)) {
            switch (i) {
                case "centerX":
                case "centerY":
                    t2 = true;
                    break;
                case "matrix":
                    if (t1 !== undefined) throw Error();
                    t1 = Transform2DType_matrix;
                    // Matrix
                    break;
                case "angleInRadians":
                    if (t1 !== undefined) throw Error();
                    t1 = Transform2DType_rotate;
                    // Rotate
                    break;
                case "angleXInRadians":
                case "angleYInRadians":
                    if (t1 !== undefined && t1 !== Transform2DType_skew) throw Error();
                    t1 = Transform2DType_skew;
                    // Skew
                    break;
                case "scaleX":
                case "scaleY":
                    if (t1 !== undefined && t1 !== Transform2DType_skew) throw Error();
                    t1 = Transform2DType_scale;
                    // Scale
                    break;
                case "x":
                case "y":
                    if (t1 !== undefined && t1 !== Transform2DType_translate) throw Error();
                    t1 = Transform2DType_translate;
                    break;
                default:
                    break;
            }
        }
        if (t1 === undefined) {
            return new MatrixTransform2D();
        }
        switch (t1) {
            case Transform2DType_matrix:
                if (t2) throw Error();
                n = getOptionOnce(options, "matrix", INTERNAL_SENTINEL);
                if (n !== INTERNAL_SENTINEL) {
                    i = JsonMarkup.convertToObject(n, "Matrix2D");
                    if (!(i instanceof Matrix2D)) throw Error();
                    transform2D = new __MatrixTransform2D(i);
                } else {
                    transform2D = new MatrixTransform2D();
                }
                return transform2D;
            case Transform2DType_rotate:
                transform2D = new RotateTransform2D();
                transform2D.setAngleInRadians(getOptionOnce(options, "angleInRadians", 0));
                break;
            case Transform2DType_scale:
                transform2D = new ScaleTransform2D();
                transform2D.setScaleX(getOptionOnce(options, "scaleX", 1));
                transform2D.setScaleY(getOptionOnce(options, "scaleY", 1));
                break;
            case Transform2DType_skew:
                transform2D = new SkewTransform2D();
                transform2D.setAngleXInRadians(getOptionOnce(options, "angleXInRadians", 0));
                transform2D.setAngleYInRadians(getOptionOnce(options, "angleYInRadians", 0));
                break;
            case Transform2DType_translate:
                if (t2) throw Error();
                transform2D = new TranslateTransform2D();
                transform2D.setX(getOptionOnce(options, "x", 0));
                transform2D.setY(getOptionOnce(options, "y", 0));
                return transform2D;
            default:
                throw Error();
        }
        if (t2) {
            transform2D.setCenterX(getOptionOnce(options, "centerX", 0));
            transform2D.setCenterX(getOptionOnce(options, "centerY", 0));
        }
        return transform2D;
    });                                                                      
})();