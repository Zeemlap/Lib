(function () {
    var undefined;
    var posInfDouble = 1 / 0;
    var hasOwnPropertyFunction = Object.prototype.hasOwnProperty;
    var maxDouble = Math.max;

    var Visibility_visible = 0;
    var Visibility_invisible = 1;
    var Visibility_collapsed = 2;

    var Visibility_toString = ["visible", "invisible", "collapsed"];
    var Visibility_parse = Visibility_createParseTable();
    function Visibility_createParseTable() {
        var i, t;
        t = {};
        i = Visibility_toString.length;
        while (0 <= --i) {
            t[Visibility_toString[i]] = i;
        }
        return t;
    }
    var Visibility_max = Visibility_toString.length - 1;
    var Visibility_sizeOf_base2 = Visibility_max === 0 ? 0 : log2FloorDouble(Visibility_max) + 1;
    assert(Visibility_sizeOf_base2 <= 32);
    var Visibility_mask = (1 << Visibility_sizeOf_base2) - 1;
    var Visibility_isValid = function (value) {
        return value === Visibility_visible
            || value === Visibility_invisible
            || value === Visibility_collapsed;
    };



    var UIElement_packedData_maxMouseDeviceId = 2;
    var UIElement_packedData1_isMouseDirectlyOverPerDevice_offset = 21;
    var UIElement_packedData1_isMouseOverPerDevice_offset = 24;
    var UIElement_packedData1_isMouseOverPerDevice_mask = 0x7000000;
    var UIElement_packedData1_isMouseDirectlyOverPerDevice_mask = 0x0E00000;
    var UIElement_packedData1_isMouseDirectlyOver_cache_mask = 0x0100000;
    var UIElement_packedData1_isMouseOver_cache_mask = 0x0080000;
    var UIElement_packedData1_isFrozenInUIElementTree_mask = 0x0040000;
    var UIElement_packedData1_hasMouseCapturePerDevice_offset = 16;
    var UIElement_packedData1_hasMouseCapturePerDevice_mask = 0x0030000;
    var UIElement_packedData1_hasMouseCapture_cache_mask = 0x0008000;
    var UIElement_packedData1_isMeasureInProgress_mask = 0x0002000;
    var UIElement_packedData1_isArrangeInProgress_mask = 0x0001000;
    var UIElement_packedData1_depth_mask = 0x0000FFF;
    var UIElement_packedData2_isMouseCaptureWithinPerDevice_mask = 0x7000000;
    var UIElement_packedData2_isMouseCaptureWithinPerDevice_offset = 24;
    var UIElement_packedData2_isMouseCaptureWithin_cache_mask = 0x0800000;
    var UIElement_packedData2_isMeasureValid_mask = 0x0400000;
    var UIElement_packedData2_isArrangeValid_mask = 0x0200000;
    var UIElement_packedData2_hasEverReachedMeasureCore_mask = 0x0100000;
    
    assert(Visibility_mask === 3);
    var UIElement_packedData2_visibility_offset = 18;
    var UIElement_packedData2_visibility_mask = Visibility_mask << UIElement_packedData2_visibility_offset;
    var UIElement_packedData2_visibility_effective_offset = 16;
    var UIElement_packedData2_visibility_effective_mask = Visibility_mask << UIElement_packedData2_visibility_effective_offset;
    var UIElement_packedData2_isRootUIElementOfAPresentationSource_mask = 0x0008000;
    var UIElement_packedData2_isVisualTransformValid = 0x0004000;
    var UIElement_packedData2_isUpdatingVisualTransform = 0x0002000;

    var UIElement_baseTypeName = "DependencyObject";
    var UIElement_baseTypeCtor = window[UIElement_baseTypeName];
    var UIElement_baseTypeProto = UIElement_baseTypeCtor.prototype;

    function UIElement() {
        UIElement_baseTypeCtor.call(this);
        this.__uiElement_desiredSize = new Vector2();
        this.__uiElement_hasMouseCapturePerDevice = null;
        this.__uiElement_isMouseCaptureWithinPerDevice = null;
        this.__uiElement_isMouseDirectlyOverPerDevice = null;
        this.__uiElement_isMouseOverPerDevice = null;
        this.__uiElement_lastMeasureAvailableSize = new Vector2();
        this.__uiElement_lastSuccessfullArrangeFinalRect = new Rect2D();
        this.__uiElement_packedData1 = 0;
        this.__uiElement_packedData2 = Visibility_collapsed << UIElement_packedData2_visibility_effective_offset;
        this.__uiElement_renderSize = new Vector2();
        this.__uiElement_renderTransform = null;
        this.__uiElement_renderTransformOrigin = new Vector2();
        this.__uiElementTree_layoutIsland_root = null;
        this.__uiElementTree_parent = null;
        this.__uiElementTree_root = this;
        this.__visual_offset = new Vector2();
        this.__visual_transform = null;
    }
    UIElement.prototype = setOwnSrcPropsOnDst({
        constructor: UIElement,
        arrange: function (finalRect) {
            var flag;
            if (!(finalRect instanceof Rect2D)
                || !((w = finalRect.getWidth()) < posInfDouble)
                || !((h = finalRect.getHeight()) < posInfDouble)) {
                throw Error();
            }
            flag = this.__uiElement_lastSuccessfullArrangeFinalRect.isCloseTo(finalRect);
            if (this.__getVisibility_effective() === Visibility_collapsed) {
                this.__arrange_removeFromQueue();
                if (!flag) {
                    this.__setIsArrangeValid(false);
                    this.__uiElement_lastSuccessfullArrangeFinalRect.assign(finalRect);
                }
                return;
            }
            if (!this.__getIsMeasureValid()) {
                this.measure(this.__getHasEverReachedMeasureCore()
                    ? this.__uiElement_lastMeasureAvailableSize
                    : new Vector2(w, h));
            }
            if (!this.__getIsArrangeValid() || !flag) {
                try {
                    this.__setIsArrangeInProgress(true);
                    this._arrangeCore1(finalRect.clone());
                } catch (e) {
                    throw e;
                } finally {
                    this.__setIsArrangeInProgress(false);
                }
                this.__uiElement_lastSuccessfullArrangeFinalRect.assign(finalRect);
                this.__arrange_removeFromQueue();
                this.__setIsArrangeValid(true);
            }
        },
        _arrangeCore1: function (finalRect) {
            this.__setLayout(finalRect);
        },
        __arrange_enqueueIfNeeded: function () {
            __ContextLayoutManager.getInstance().getArrangeQueue().enqueueIfNeeded(this);
        },
        __arrange_getFinalRect: function() {
            return this.__uiElement_lastSuccessfullArrangeFinalRect;
        },
        __arrange_removeFromQueue: function () {
            __ContextLayoutManager.getInstance().getArrangeQueue().remove(this);
        },
        captureMouse: function (mouseDevice, captureMode) {
            var i = arguments.length;
            if (i < 1) mouseDevice = MouseDevice.getPrimary();
            else if (!(mouseDevice instanceof MouseDevice)) throw Error();
            if (i < 2) mouseDevice.setCaptureUIElement(this);
            else mouseDevice.setCaptureUIElement(this, captureMode);
            return mouseDevice.getCaptureUIElement() === this;
        },
        __computeVisualTransform: function (arrangeRect) {
            var rt, rto, rto_isZero;
            var vt, vt_children, t;
            rt = this.getRenderTransform();
            vt = null;
            if (rt !== null) {
                rto = this.__getRenderTransformOrigin();
                rto_isZero = rto.getX() === 0 && rto.getY() === 0;
                if (rto_isZero) {
                    vt = rt;
                } else {
                    vt = new Transform2DGroup();
                    vt_children = vt.getChildren();
                    t = new TranslateTransform2D();
                    t.setX(-rto.getX() * arrangeRect.getWidth());
                    t.setY(-rto.getY() * arrangeRect.getHeight());
                    vt_children.add(t);
                    vt_children.add(rt);
                    t = new TranslateTransform2D();
                    t.setX(rto.getX() * arrangeRect.getWidth());
                    t.setY(rto.getY() * arrangeRect.getHeight());
                    vt_children.add(t);
                }
            }
            return vt;
        },
        _disposeCore: function () {
            UIElement_baseTypeProto._disposeCore.call(this);
            this.__arrange_removeFromQueue();
            this.__measure_removeFromQueue();
            this.__removeRenderTransformEventHandlers();
        },
        getDesiredSize: function() {
            return this.__uiElement_desiredSize.clone();
        },
        __getDesiredSize: function() {
            return this.__uiElement_desiredSize;
        },
        __getHasEverReachedMeasureCore: function () {
            return (this.__uiElement_packedData2 & UIElement_packedData2_hasEverReachedMeasureCore_mask) !== 0;
        },
        getHasMouseCapture: function (mouseDevice) {
            var mouseDeviceId, hasMouseCapturePerDevice;
            if (arguments.length < 1) {
                return this.__getHasMouseCapture_cache();
            }
            if (!(mouseDevice instanceof MouseDevice)) throw Error();
            mouseDeviceId = mouseDevice.getId();
            assert(0 <= mouseDeviceId);
            if (mouseDeviceId <= UIElement_packedData_maxMouseDeviceId) {
                return (this.__uiElement_packedData1 & (1 << (mouseDeviceId + UIElement_packedData1_hasMouseCapturePerDevice_offset))) !== 0;
            }
            hasMouseCapturePerDevice = this.__uiElement_hasMouseCapturePerDevice;
            return hasMouseCapturePerDevice !== null
                && hasOwnPropertyFunction.call(hasMouseCapturePerDevice, mouseDeviceId);
        },
        __getHasMouseCapture_cache: function () {
            return (this.__uiElement_packedData1 & UIElement_packedData1_hasMouseCapture_cache_mask) !== 0;
        },
        __getHasMouseCapture_computed: function () {
            var hasMouseCapturePerDevice;
            if ((this.__uiElement_packedData1 & UIElement_packedData1_hasMouseCapturePerDevice_mask) !== 0) {
                return true;
            }
            hasMouseCapturePerDevice = this.__uiElement_hasMouseCapturePerDevice;
            return hasMouseCapturePerDevice !== null && hasOwnProperties(hasMouseCapturePerDevice);
        },
        __getIsArrangeInProgress: function () {
            return (this.__uiElement_packedData1 & UIElement_packedData1_isArrangeInProgress_mask) !== 0;
        },
        __getIsArrangeValid: function() {
            return (this.__uiElement_packedData2 & UIElement_packedData2_isArrangeValid_mask) !== 0;
        },
        getIsFrozenInUIElementTree: function () {
            return (this.__uiElement_packedData1 & UIElement_packedData1_isFrozenInUIElementTree_mask) !== 0;
        },
        __getIsLayoutIslandRoot: function () {
            return this.__uiElementTree_layoutIsland_root === this;
        },
        __getIsMeasureInProgress: function () {
            return (this.__uiElement_packedData1 & UIElement_packedData1_isMeasureInProgress_mask) !== 0;
        },
        __getIsMeasureValid: function() {
            return (this.__uiElement_packedData2 & UIElement_packedData2_isMeasureValid_mask) !== 0;
        },
        getIsMouseCaptureWithin: function (mouseDevice) {
            var mouseDeviceId, isMouseCaptureWithinPerDevice;
            if (arguments.length < 1) {
                return this.__getIsMouseCaptureWithin_cache();
            }
            if (!(mouseDevice instanceof MouseDevice)) throw Error();
            mouseDeviceId = mouseDevice.getId();
            assert(0 <= mouseDeviceId);
            if (mouseDeviceId <= UIElement_packedData_maxMouseDeviceId) {
                return (this.__uiElement_packedData2 & (1 << (mouseDeviceId + UIElement_packedData2_isMouseCaptureWithinPerDevice_offset))) !== 0;
            }
            isMouseCaptureWithinPerDevice = this.__uiElement_isMouseCaptureWithinPerDevice;
            return isMouseCaptureWithinPerDevice !== null
                && hasOwnPropertyFunction.call(isMouseCaptureWithinPerDevice, mouseDeviceId);
        },
        __getIsMouseCaptureWithin_cache: function () {
            return (this.__uiElement_packedData2 & UIElement_packedData2_isMouseCaptureWithin_cache_mask) !== 0;
        },
        __getIsMouseCaptureWithin_computed: function () {
            var isMouseCaptureWithinPerDevice;
            if ((this.__uiElement_packedData2 & UIElement_packedData2_isMouseCaptureWithinPerDevice_mask) !== 0) {
                return true;
            }
            isMouseCaptureWithinPerDevice = this.__uiElement_isMouseCaptureWithinPerDevice;
            return isMouseCaptureWithinPerDevice !== null && hasOwnProperties(isMouseCaptureWithinPerDevice);
        },
        getIsMouseDirectlyOver: function (mouseDevice) {
            var mouseDeviceId, isMouseDirectlyOverPerDevice;
            MouseDevice.forAllEnabled_validateDirectlyOverUIElement();
            if (arguments.length < 1) {
                return this.__getIsMouseDirectlyOver_cache();
            }
            if (!(mouseDevice instanceof MouseDevice)) throw Error();
            mouseDeviceId = mouseDevice.getId();
            assert(0 <= mouseDeviceId);
            if (mouseDeviceId <= UIElement_packedData_maxMouseDeviceId) {
                return (this.__uiElement_packedData1 & (1 << (mouseDeviceId + UIElement_packedData1_isMouseDirectlyOverPerDevice_offset))) !== 0;
            }
            isMouseDirectlyOverPerDevice = this.__uiElement_isMouseDirectlyOverPerDevice;
            return isMouseDirectlyOverPerDevice !== null
                && hasOwnPropertyFunction.call(isMouseDirectlyOverPerDevice, mouseDeviceId);
        },
        __getIsMouseDirectlyOver_cache: function () {
            return (this.__uiElement_packedData1 & UIElement_packedData1_isMouseDirectlyOver_cache_mask) !== 0;
        },
        __getIsMouseDirectlyOver_computed: function () {
            var isMouseDirectlyOverPerDevice;
            if ((this.__uiElement_packedData1 & UIElement_packedData1_isMouseDirectlyOverPerDevice_mask) !== 0) {
                return true;
            }
            isMouseDirectlyOverPerDevice = this.__uiElement_isMouseDirectlyOverPerDevice;
            return isMouseDirectlyOverPerDevice !== null && hasOwnProperties(isMouseDirectlyOverPerDevice);
        },
        getIsMouseOver: function (mouseDevice) {
            var mouseDeviceId, isMouseOverPerDevice;
            MouseDevice.forAllEnabled_validateDirectlyOverUIElement();
            if (arguments.length < 1) {
                return this.__getIsMouseOver_cache();
            }
            if (!(mouseDevice instanceof MouseDevice)) throw Error();
            mouseDeviceId = mouseDevice.getId();
            assert(0 <= mouseDeviceId);
            if (mouseDeviceId <= UIElement_packedData_maxMouseDeviceId) {
                return (this.__uiElement_packedData1 & (1 << (mouseDeviceId + UIElement_packedData1_isMouseOverPerDevice_offset))) !== 0;
            }
            isMouseOverPerDevice = this.__uiElement_isMouseOverPerDevice;
            return isMouseOverPerDevice !== null
                && hasOwnPropertyFunction.call(isMouseOverPerDevice, mouseDeviceId);
        },
        __getIsMouseOver_cache: function () {
            return (this.__uiElement_packedData1 & UIElement_packedData1_isMouseOver_cache_mask) !== 0;
        },
        __getIsMouseOver_computed: function () {
            var isMouseOverPerDevice;
            if ((this.__uiElement_packedData1 & UIElement_packedData1_isMouseOverPerDevice_mask) !== 0) {
                return true;
            }
            isMouseOverPerDevice = this.__uiElement_isMouseOverPerDevice;
            return isMouseOverPerDevice !== null && hasOwnProperties(isMouseOverPerDevice);
        },
        __getIsRootUIElementOfAPresentationSource: function () {
            return (this.__uiElement_packedData2 & UIElement_packedData2_isRootUIElementOfAPresentationSource_mask) !== 0;
        },
        __getIsUpdatingVisualTransform: function() {
            return (this.__uiElement_packedData2 & UIElement_packedData2_isUpdatingVisualTransform) !== 0;
        },
        __getIsVisualTransformValid: function() {
            return (this.__uiElement_packedData2 & UIElement_packedData2_isVisualTransformValid) !== 0;
        },
        getRenderSize: function() {
            return this.__uiElement_renderSize.clone();
        },
        __getRenderSize: function() {
            return this.__uiElement_renderSize;
        },
        getRenderTransform: function () {
            return this.__uiElement_renderTransform;
        },
        getRenderTransformÒrigin: function () {
            return this.__getRenderTransformOrigin().clone();
        },
        __getRenderTransformOrigin: function () {
            return this.__uiElement_renderTransformOrigin;
        },
        __getUIElementTree_children_count: function() {
            return 0;
        },
        getUIElementTree_depth: function () {
            return this.__uiElement_packedData1 & UIElement_packedData1_depth_mask;
        },
        __getUIElementTree_layoutIsland_parent: function () {
            if (this.__getIsLayoutIslandRoot()) {
                return null;
            }
            return this.__uilElementTree_parent;
        },
        getUIElementTree_parent: function () {
            return this.__uiElementTree_parent;
        },
        // Gets this UI element and its ancestors in an array in order of increasing depth.
        getUIElementTree_selfAndAncestors: function () {
            var UIElement, a, i;
            i = this.getUIElementTree_depth() + 1;
            a = new Array(i);
            UIElement = this;
            while (true) {
                a[--i] = UIElement;
                assert((i === 0) === (UIElement.__uiElementTree_parent === null));
                if (i === 0) break;
                UIElement = UIElement.__uiElementTree_parent;
            }
            return a;
        },
        getVisibility: function () {
            return Visibility_toString[this.__getVisibility()];
        },
        __getVisibility: function() {
            return (this.__uiElement_packedData2 & UIElement_packedData2_visibility_mask) >> UIElement_packedData2_visibility_offset;
        },
        getVisibility_effective: function () {
            return Visibility_toString[this.__getVisibility_effective()];
        },
        __getVisibility_effective: function () {
            return (this.__uiElement_packedData2 & UIElement_packedData2_visibility_effective_mask)
                >> UIElement_packedData2_visibility_effective_offset;
        },
        __getVisibility_effective_alternate: function () {
            if (!this.__uiElementTree_root.__getIsRootUIElementOfAPresentationSource()) {
                return "collapsed";
            }
            return null;
        },
        _getVisualOffset: function () {
            return this.__visual_offset.clone();
        },
        __getVisualOffset: function() {
            return this.__visual_offset;
        },
        _getVisualTransform: function () {
            return this.__visual_transform;
        },
        invalidateArrange: function () {
            if (this.__getIsArrangeValid() && !this.__getIsArrangeInProgress()) {
                this.__arrange_enqueueIfNeeded();
                this.__setIsArrangeValid(false);
            }
        },
        invalidateMeasure: function () {
            if (this.__getIsMeasureValid() && !this.__getIsMeasureInProgress()) {
                this.__measure_enqueueIfNeeded();
                this.__setIsMeasureValid(false);
            }
        },
        measure: function (availableSize) {
            var desiredSize;
            var availableSizeX;
            var availableSizeY;
            var flag;
            if (!(availableSize instanceof Vector2) || !availableSize.getAreXAndYNotNan()) throw Error();
            availableSizeX = availableSize.getX();
            availableSizeY = availableSize.getY();
            flag = this.__uiElement_lastMeasureAvailableSize.isCloseTo(availableSizeX, availableSizeY);
            if (this.__getVisibility_effective() === Visibility_collapsed) {
                this.__measure_removeFromQueue();
                if (!flag) {
                    this.__setIsMeasureValid(false);
                    this.__uiElement_lastMeasureAvailableSize.assign(availableSizeX, availableSizeY);
                }
                return;
            }
            if (!this.__getIsMeasureValid() || !flag) {
                this.__setHasEverReachedMeasureCore(true);
                this.invalidateArrange();
                try {
                    this.__setIsMeasureInProgress(true);
                    desiredSize = this._measureCore1(availableSize);
                } catch (e) {
                    throw e;
                } finally {
                    this.__uiElement_lastMeasureAvailableSize.assign(availableSizeX, availableSizeY);
                    this.__setIsMeasureInProgress(false);
                }
                if (!(desiredSize instanceof Vector2)
                    || !desiredSize.getAreXAndYNotPositiveInfinity()
                    || !desiredSize.getAreXAndYNotNan()) {
                    throw Error();
                }
                this.__measure_removeFromQueue();
                this.__setIsMeasureValid(true);
                this.__uiElement_desiredSize.assign(desiredSize);
            }
        },
        _measureCore1: function (availableSize) {
            if (!(availableSize instanceof Vector2) || !availableSize.getAreXAndYNotNan()) throw Error();
            return new Vector2();
        },
        __measure_enqueueIfNeeded: function() {
            __ContextLayoutManager.getInstance().enqueueIfNeeded(this);
        },
        __measure_getAvailableSize: function () {
            return this.__uiElement_lastMeasureAvailableSize;
        },
        __measure_removeFromQueue: function() {
            __ContextLayoutManager.getInstance().getMeasureQueue().remove(this);
        }, 
        __onPropertyChanged: function (e) {
            if (!(e instanceof PropertyChangedEventArgs)) throw Error();
            switch (e.getPropertyName()) {
                case "uiElementTree_parent":
                    this.__onUIElementTree_parentChanged();
                    break;
                case "visibility":
                    this.__onVisibilityChanged();
                    break;
                case "renderTransform":
                case "renderTransformOrigin":
                    assert(!this.__getIsUpdatingVisualTransform());
                    this.invalidateArrange();
                    this.__setIsVisualTransformValid(false);
                    break;
            }
        },
        __onRenderTransformDisposed: function (sender, e) {
            this.setRenderTransform(null);
        },
        __onUIElementTree_parentChanged: function () {
            var uiElemQueue, uiElem1, uiElem2;
            var value = this.__uiElementTree_parent;
            if (value === null) {
                this.__uiElementTree_root = this;
                this.__setUIElementTree_depth(0);
            } else {
                this.__uiElementTree_root = value.__uiElementTree_root;
                this.__setUIElementTree_depth(value.getUIElementTree_depth() + 1);
            }
            uiElemQueue = [];
            this.__uiElementTree_appendReversedChildrenToArray(uiElemQueue);
            while ((uiElem1 = uiElemQueue.pop()) !== undefined) {
                uiElem2 = uiElem1.__uiElementTree_parent;
                uiElem1.__uiElementTree_root = uiElem2.__uiElementTree_root;
                uiElem1.__setUIElementTree_depth(uiElem2.getUIElementTree_depth() + 1);
                uiElem1.__uiElementTree_appendReversedChildrenToArray(uiElemQueue);                
            }
            if (!this.__getIsLayoutIslandRoot()) {
                this.__uiElementTree_layoutIsland_propagateRootInDepth();
            }
            this.__updateVisibility_effective_cache();
        },
        __onVisibilityChanged: function () {
            this.__updateVisibility_effective_cache();
        },
        __updateVisibility_effective_cache: function () {
            var uiElem1;
            var visEffect_new;
            var visEffect_old;
            var uiElemStack;
            var i;
            uiElem2 = this.__uiElementTree_parent;
            assert((uiElem2 === null) === (this.__uiElementTree_root === this));
            visEffect_new = this.__getVisibility();
            if (uiElem2 !== null) {
                i = uiElem2.__getVisibility_effective();
                if (visEffect_new < i) visEffect_new = i;
            }
            i = this.__getVisibility_effective_alternate();
            if (i !== null) {
                assert(hasOwnPropertyFunction.call(Visibility_parse, i));
                i = Visibility_parse[i];
                if (visEffect_new < i) visEffect_new = i;
            }
            visEffect_old = this.__getVisibility_effective();
            if (visEffect_old === visEffect_new) return;
            this.__setVisibility_effective(visEffect_new);
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("visibility_effective", 
                Visibility_toString[visEffect_old],
                Visibility_toString[visEffect_new]));
            if (visEffect_old === Visibility_collapsed) {
                if (!this.__getIsMeasureValid()) contextLayoutManager.getMeasureQueue().enqueueIfNeeded(this);
                if (!this.__getIsArrangeValid()) contextLayoutManager.getArrangeQueue().enqueueIfNeeded(this);
            }
            uiElemStack = [];
            this.__uiElementTree_appendReversedChildrenToArray(uiElemStack);
            while ((uiElem1 = uiElemStack.pop()) !== undefined) {
                uiElem2 = uiElem1.__uiElementTree_parent;
                visEffect_old = uiElem1.__getVisibility_effective();
                visEffect_new = maxDouble(uiElem2.__getVisibility_effective(), uiElem1.__getVisibility());
                if (visEffect_old === visEffect_new) {
                    continue;
                }
                uiElem1.__setVisibility_effective(visEffect_new);
                uiElem1.raiseEvent("propertyChanged", new PropertyChangedEventArgs("visibility_effective",
                    Visibility_toString[visEffect_old],
                    Visibility_toString[visEffect_new]));
                uiElem1.__uiElementTree_appendReversedChildrenToArray(uiElemStack);
            }
        },
        releaseMouseCapture: function (mouseDevice) {
            if (arguments.length < 1) mouseDevice = MouseDevice.getPrimary();
            else if (!(mouseDevice instanceof MouseDevice)) throw Error();
            if (mouseDevice.getCaptureUIElement() === this) {
                mouseDevice.setCaptureUIElement(null);
            }
        },
        __removeRenderTransformEventHandlers: function () {
            var transform2D;
            if ((transform2D = this.__uiElement_renderTransform) === null) return;
            transform2D.__removeEventHandler("disposed", this.__onRenderTransformDisposed, this);
        },
        __setHasEverReachedMeasureCore: function (value) {
            if (typeof value !== "boolean") throw Error();
            this.__uiElement_packedData2 = value
                ? (this.__uiElement_packedData2 | UIElement_packedData2_hasEverReachedMeasureCore_mask)
                : (this.__uiElement_packedData2 & ~UIElement_packedData2_hasEverReachedMeasureCore_mask);
        },
        __setHasMouseCapture_cache: function (value) {
            if (typeof value !== "boolean") throw Error();
            this.__uiElement_packedData1 = value
                ? (this.__uiElement_packedData1 | UIElement_packedData1_hasMouseCapture_cache_mask)
                : (this.__uiElement_packedData1 & ~UIElement_packedData1_hasMouseCapture_cache_mask);
        },
        __setHasMouseCapture_device: function (mouseDevice, value) {
            var mouseDeviceId, m;
            if (!(mouseDevice instanceof MouseDevice)) throw Error();
            if (typeof value !== "boolean") throw Error();
            mouseDeviceId = mouseDevice.getId();
            assert(0 <= mouseDeviceId);
            if (mouseDeviceId <= UIElement_packedData_maxMouseDeviceId) {
                m = 1 << (mouseDeviceId + UIElement_packedData1_hasMouseCapturePerDevice_offset);
                this.__uiElement_packedData1 = value
                    ? (this.__uiElement_packedData1 | m)
                    : (this.__uiElement_packedData1 & ~m);
            } else {
                m = this.__uiElement_hasMouseCapturePerDevice;
                if (m === null) this.__uiElement_hasMouseCapturePerDevice = m = {};
                m[mouseDeviceId] = 1;
            }
        },
        __setIsArrangeInProgress: function (value) {
            if (typeof value !== "boolean") throw Error();
            this.__uiElement_packedData1 = value
                ? (this.__uiElement_packedData1 | UIElement_packedData1_isArrangeInProgress_mask)
                : (this.__uiElement_packedData1 & ~UIElement_packedData1_isArrangeInProgress_mask);
        },
        __setIsArrangeValid: function (value) {
            if (typeof value !== "boolean") throw Error();
            this.__uiElement_packedData2 = value
                ? (this.__uiElement_packedData2 | UIElement_packedData2_isArrangeValid_mask)
                : (this.__uiElement_packedData2 & ~UIElement_packedData2_isArrangeValid_mask);
        },
        __setIsFrozenInUIElementTree: function (value) {
            if (typeof value !== "boolean") throw Error();
            this.__uiElement_packedData1 = value
                ? (this.__uiElement_packedData1 | UIElement_packedData1_isFrozenInUIElementTree_mask)
                : (this.__uiElement_packedData1 & ~UIElement_packedData1_isFrozenInUIElementTree_mask);
        },
        __setIsLayoutIslandRoot: function (value) {
            var uiElemTreeParent;
            if (this.__getIsLayoutIslandRoot() === value) return;
            if (typeof value !== "boolean") throw Error();
            if (value) {
                this.__uiElementTree_layoutIsland_root = this;
            } else {
                uiElemTreeParent = this.__uiElementTree_parent;
                this.__uiElementTree_layoutIsland_root = uiElemTreeParent !== null
                    ? uiElemTreeParent.__uiElementTree_layoutIsland_root
                    : null;
            }
            this.__uiElementTree_layoutIsland_propagateRootInDepth();
        },
        __setIsMeasureInProgress: function (value) {
            if (typeof value !== "boolean") throw Error();
            this.__uiElement_packedData1 = value
                ? (this.__uiElement_packedData1 | UIElement_packedData1_isMeasureInProgress_mask)
                : (this.__uiElement_packedData1 & ~UIElement_packedData1_isMeasureInProgress_mask);
        },
        __setIsMeasureValid: function (value) {
            if (typeof value !== "boolean") throw Error();
            this.__uiElement_packedData2 = value
                ? (this.__uiElement_packedData2 | UIElement_packedData2_isMeasureValid_mask)
                : (this.__uiElement_packedData2 & ~UIElement_packedData2_isMeasureValid_mask);
        },
        __setIsMouseCaptureWithin_cache: function (value) {
            if (typeof value !== "boolean") throw Error();
            this.__uiElement_packedData2 = value
                ? (this.__uiElement_packedData2 | UIElement_packedData2_isMouseCaptureWithin_cache_mask)
                : (this.__uiElement_packedData2 & ~UIElement_packedData2_isMouseCaptureWithin_cache_mask);
        },
        __setIsMouseCaptureWithin_device: function (mouseDevice, value) {
            var mouseDeviceId, m;
            if (!(mouseDevice instanceof MouseDevice)) throw Error();
            if (typeof value !== "boolean") throw Error();
            mouseDeviceId = mouseDevice.getId();
            assert(0 <= mouseDeviceId);
            if (mouseDeviceId <= UIElement_packedData_maxMouseDeviceId) {
                m = 1 << (mouseDeviceId + UIElement_packedData2_isMouseCaptureWithinPerDevice_offset);
                this.__uiElement_packedData2 = value
                    ? (this.__uiElement_packedData2 | m)
                    : (this.__uiElement_packedData2 & ~m);
            } else {
                m = this.__uiElement_isMouseCaptureWithinPerDevice;
                if (m === null) this.__uiElement_isMouseCaptureWithinPerDevice = m = {};
                m[mouseDeviceId] = 1;
            }
        },
        __setIsMouseDirectlyOver_cache: function (value) {
            if (typeof value !== "boolean") throw Error();
            this.__uiElement_packedData1 = value
                ? (this.__uiElement_packedData1 | UIElement_packedData1_isMouseDirectlyOver_cache_mask)
                : (this.__uiElement_packedData1 & ~UIElement_packedData1_isMouseDirectlyOver_cache_mask);
        },
        __setIsMouseDirectlyOver_device: function (mouseDevice, value) {
            var mouseDeviceId, m;
            if (!(mouseDevice instanceof MouseDevice)) throw Error();
            if (typeof value !== "boolean") throw Error();
            mouseDeviceId = mouseDevice.getId();
            assert(0 <= mouseDeviceId);
            if (mouseDeviceId <= UIElement_packedData_maxMouseDeviceId) {
                m = 1 << (mouseDeviceId + UIElement_packedData1_isMouseDirectlyOverPerDevice_offset);
                this.__uiElement_packedData1 = value
                    ? (this.__uiElement_packedData1 | m)
                    : (this.__uiElement_packedData1 & ~m);
            } else {
                m = this.__uiElement_isMouseDirectlyOverPerDevice;
                if (m === null) this.__uiElement_isMouseDirectlyOverPerDevice = m = {};
                m[mouseDeviceId] = 1;
            }
        },
        __setIsMouseOver_cache: function (value) {
            if (typeof value !== "boolean") throw Error();
            this.__uiElement_packedData1 = value
                ? (this.__uiElement_packedData1 | UIElement_packedData1_isMouseOver_cache_mask)
                : (this.__uiElement_packedData1 & ~UIElement_packedData1_isMouseOver_cache_mask);
        },
        __setIsMouseOver_device: function (mouseDevice, value) {
            var mouseDeviceId, m;
            if (!(mouseDevice instanceof MouseDevice)) throw Error();
            if (typeof value !== "boolean") throw Error();
            mouseDeviceId = mouseDevice.getId();
            assert(0 <= mouseDeviceId);
            if (mouseDeviceId <= UIElement_packedData_maxMouseDeviceId) {
                m = 1 << (mouseDeviceId + UIElement_packedData1_isMouseOverPerDevice_offset);
                this.__uiElement_packedData1 = value
                    ? (this.__uiElement_packedData1 | m)
                    : (this.__uiElement_packedData1 & ~m);
            } else {
                m = this.__uiElement_isMouseOverPerDevice;
                if (m === null) this.__uiElement_isMouseOverPerDevice = m = {};
                m[mouseDeviceId] = 1;
            }
        },
        __setIsRootUIElementOfAPresentationSource: function (value) {
            if (value === this.__getIsRootUIElementOfAPresentationSource()) return;
            this.__uiElement_packedData2 = value
                ? (this.__uiElement_packedData2 | UIElement_packedData2_isRootUIElementOfAPresentationSource_mask)
                : (this.__uiElement_packedData2 & ~UIElement_packedData2_isRootUIElementOfAPresentationSource_mask);
            this.__updateVisibility_effective_cache();
        },
        __setIsUpdatingVisualTransform: function(value) {
            if (typeof value !== "boolean") throw Error();
            this.__uiElement_packedData2 = value
                ? (this.__uiElement_packedData2 | UIElement_packedData2_isUpdatingVisualTransform)
                : (this.__uiElement_packedData2 & ~UIElement_packedData2_isUpdatingVisualTransform);
        },
        __setIsVisualTransformValid: function (value) {
            if (typeof value !== "boolean") throw Error();
            this.__uiElement_packedData2 = value
                ? (this.__uiElement_packedData2 | UIElement_packedData2_isVisualTransformValid)
                : (this.__uiElement_packedData2 & ~UIElement_packedData2_isVisualTransformValid);
        },
        __setLayout: function (arrangeRect) {
            var oldRenderSize;
            var oldVisualOffset;
            var oldVisualTransform;
            var newVisualTransform;
            oldRenderSize = this.__uiElement_renderSize;
            if (oldRenderSize.isCloseTo(arrangeRect.getWidth(), arrangeRect.getHeight())) {
                oldRenderSize = null;
            } else {
                this.__uiElement_renderSize = new Vector2(arrangeRect.getWidth(), arrangeRect.getHeight());
            }
            oldVisualOffset = this.__visual_offset;
            if (oldVisualOffset.isCloseTo(arrangeRect.getX(), arrangeRect.getY())) {
                oldVisualOffset = null;
            } else {
                this.__visual_offset = new Vector2(arrangeRect.getX(), arrangeRect.getY());
            }
            oldVisualTransform = undefined;
            if (!this.__getIsVisualTransformValid()) {
                try {
                    this.__setIsUpdatingVisualTransform(true);
                    newVisualTransform = this.__computeVisualTransform(arrangeRect);
                    if (newVisualTransform !== null && !(newVisualTransform instanceof Transform2D)) {
                        throw Error();
                    }
                } finally {
                    this.__setIsUpdatingVisualTransform(false);
                }
                this.__setIsVisualTransformValid(true);
                oldVisualTransform = this.__visual_transform; 
                this.__visual_transform = newVisualTransform;
            }
            this.raiseEvent("layoutUpdated", new LayoutUpdatedEventArgs(
                oldRenderSize, this.__uiElement_renderSize,
                oldVisualOffset, this.__visual_offset,
                oldVisualTransform, this.__visual_transform));
        },
        setRenderTransform: function (value) {
            var ov;
            if (value !== null && (!(value instanceof Transform2D) || value.getIsDisposed())) {
                throw Error();
            }
            ov = this.__uiElement_renderTransform;
            if (ov === value) return;
            this.__removeRenderTransformEventHandlers();
            this.__uiElement_renderTransform = value;
            if (value != null) {
                value.__addEventHandler("disposed", this.__onRenderTransformDisposed, this);
            }
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("renderTransform", ov, value));
        },
        setRenderTransformOrigin: function (value) {
            var ov;
            if (!(value instanceof Vector2)) {
                throw Error();
            }
            ov = this.__uiElement_renderTransformOrigin;
            if (ov.isCloseTo(value)) return;
            this.__uiElement_renderTransformOrigin = value.clone();
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("renderTransformOrigin", ov, value.clone()));
        },
        __setUIElementTree_depth: function (value) {
            if (!isIntegralDouble_nonNegative(value) || UIElement_packedData1_depth_mask < value) throw Error();
            this.__uiElement_packedData1 = (this.__uiElement_packedData1 & ~UIElement_packedData1_depth_mask) | value;
        },
        __setUIElementTree_parent: function (value) {
            var oldValue;
            if (this.__uiElementTree_parent !== null && value !== null) throw Error();
            if (!(value instanceof UIElement)) throw Error();
            oldValue = this.__uiElementTree_parent;
            this.__uiElementTree_parent = value;
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("uiElementTree_parent", oldValue, value));
        },
        setVisibility: function (value) {
            var value_i;
            value_i = getOwnProperty(Visibility_parse, value);
            if (value_i === undefined) throw Error();
            this.__setVisibility(value);
        },
        __setVisibility: function(value) {
            var oldValue;
            if (!Visibility_isValid(value)) throw Error();
            oldValue = this.__getVisibility();
            if (oldValue !== value) throw Error();
            this.__uiElement_packedData2 = (this.__uiElement_packedData2 & ~UIElement_packedData2_visibility_mask)
                | (value << UIElement_packedData2_visibility_offset);
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("visibility", Visibility_toString[oldValue], Visibility_toString[value]));
        },
        __setVisibility_effective: function (value) {
            this.__uiElement_packedData2 = (this.__uiElement_packedData2 & ~UIElement_packedData2_visibility_effective_mask)
                | (value << UIElement_packedData2_visibility_effective_offset);
        },
        __uiElementTree_appendReversedChildrenToArray: function (array) {
            var i, j;
            i = this.__getUIElementTree_children_count();
            j = array.length;
            while (0 <= --i) {
                array[j++] = this.__uiElementTree_children_get(i);
            }
        },
        __uiElementTree_children_get: function (i) {
            throw Error();
        },
        uiElementTree_findDeepestCommonAncestor: function (uiElement) {
            if (!(uiElement instanceof UIElement)) throw Error();
            if (this.__uiElementTree_root !== uiElement.__uiElementTree_root
                || this === uiElement) return null;
            return __uiElementTree_findDeepestCommonAncestor(this, uiElement);
        },
        // Return true if this is an ancestor of other in the UI element tree.
        uiElementTree_isAncestorOf: function (other) {
            var i;
            if (!(other instanceof UIElement)) throw Error();

            // Early out if this and other are not part of the same UI element tree.
            if (this.__uiElementTree_root !== other.__uiElementTree_root) return false;

            // Use the depth of this and other in the UI element tree in another optimization.
            i = other.getUIElementTree_depth() - this.getUIElementTree_depth();

            // If other is not deeper than this in the UI element tree then this cannot be an ancestor of other.
            if (i <= 0) return false;
            do {
                --i;
                other = other.__uiElementTree_parent;
            } while (0 < i);
            return this === other;
        },
        __uiElementTree_layoutIsland_propagateRootInDepth: function () {
            var uiElemQueue = [];
            var uiElem1, uiElem2;
            this.__uiElementTree_appendReversedChildrenToArray(uiElemQueue);
            while ((uiElem1 = uiElemQueue.pop()) !== undefined) {
                uiElem2 = uiElem1.__uiElementTree_parent;
                if (!uiElem2.__getIsLayoutIslandRoot()) {
                    uiElem2.__uiElementTree_layoutIsland_root = uiElem2;
                    uiElem2.__uiElementTree_appendReversedChildrenToArray(uiElemQueue);
                }
            }
        }
    }, Object.create(UIElement_baseTypeProto));
    JsonMarkup.__addType("UIElement", UIElement, UIElement_baseTypeName);
    function __uiElementTree_findDeepestCommonAncestor(uiElement1, uiElement2) {
        var i;
        i = uiElement1.getUIElementTree_depth() - uiElement2.getUIElementTree_depth();
        if (i < 0) {
            while (++i <= 0) uiElement2 = uiElement2.__uiElementTree_parent;
        } else if (0 < i) {
            while (0 <= --i) uiElement1 = uiElement1.__uiElementTree_parent;
        }
        while (uiElement1 !== uiElement2) {
            uiElement1 = uiElement1.__uiElementTree_parent;
            uiElement2 = uiElement2.__uiElementTree_parent;
            assert(uiElement1 !== null && uiElement2 !== null);
        }
        return uiElement1;
    }
    function __LayoutUpdatedEventArgs(uiElement, oldRenderSize, oldVisualOffset, oldVisualTransform) {
        this.__oldRenderSize = oldRenderSize;
        this.__newRenderSize = oldRenderSize === null ? null : uiElement.__uiElement_renderSize;
        this.__oldVisualOffset = oldVisualOffset;
        this.__newVisualOffset = oldVisualOffset === null ? null : uiElement.__visual_offset;
        if (oldVisualTransform === undefined) {
            this.__oldVisualTransform = null;
            this.__newVisualTransform = null;
        } else {
            this.__oldVisualTransform = oldVisualTransform;
            this.__newVisualTransform = uiElement.__visual_transform;
        }
    }
    function LayoutUpdatedEventArgs() { throw Error(); }
    LayoutUpdatedEventArgs.prototype = __LayoutUpdatedEventArgs.prototype = setOwnSrcPropsOnDst({
        getNewRenderSize: function () { return function_copyValueType(this.__getNewRenderSize()); },
        __getNewRenderSize: function () { return this.__newRenderSize; },
        getNewVisualOffset: function () { return function_copyValueType(this.__getNewVisualOffset()); },
        __getNewVisualOffset: function () { return this.__newVisualOffset; },
        getNewVisualTransform: function () { return this.__newVisualTransform; },
        getOldRenderSize: function () { return function_copyValueType(this.__getOldRenderSize()); },
        __getOldRenderSize: function () { return this.__oldRenderSize; },
        getOldVisualOffset: function () { return function_copyValueType(this.__getOldVisualOffset()); },
        __getOldVisualOffset: function () { return this.__oldVisualOffset; },
        getOldVisualTransform: function () { return this.__oldVisualTransform; },
        __setNewRenderSize: function (value) {
            this.__newRenderSize = value;
        },
        __setNewVisualOffset: function (value) {
            this.__newVisualOffset = value;
        },
        __setNewVisualTransform: function(value) { this.__newVisualTransform = value; },
        __setOldRenderSize: function (value) {
            this.__oldRenderSize = value;
        },
        __setOldVisualOffset: function (value) {
            this.__oldVisualOffset = value;
        },
        __setOldVisualTransform: function (value) { this.__oldVisualTransform = value; }
    }, Object.create(EventArgs.prototype));
    var LayoutUpdatedEventQueueBehavior_baseTypeCtor = __EventQueueBehaviorAtMostOneEventPerObject;
    var LayoutUpdatedEventQueueBehavior_baseTypeProto = LayoutUpdatedEventQueueBehavior_baseTypeCtor.prototype;
    function __LayoutUpdatedEventQueueBehavior() {
        LayoutUpdatedEventQueueBehavior_baseTypeCtor.call(this);
    }
    function LayoutUpdatedEventQueueBehavior() {
        throw Error();
    }
    LayoutUpdatedEventQueueBehavior.prototype = __LayoutUpdatedEventQueueBehavior.prototype = setOwnSrcPropsOnDst({
        constructor: LayoutUpdatedEventQueueBehavior,
        equals: function (other) {
            return other != null && other.constructor === LayoutUpdatedEventQueueBehavior;
        },
        _mergeEventArgs: function (curEventArgs, newEventArgs) {
            assert(curEventArgs.__getNewRenderSize().equals(newEventArgs.__getOldRenderSize()));
            if (newEventArgs.__getNewRenderSize().isCloseTo(curEventArgs.__getOldRenderSize())) {
                newEventArgs.__setOldRenderSize(null);
                newEventArgs.__setNewRenderSize(null);
            }
            assert(curEventArgs.__getNewVisualOffset().equals(newEventArgs.__getOldVisualOffset()));
            if (newEventArgs.__getNewVisualOffset().isCloseTo(curEventArgs.__getOldVisualOffset())) {
                newEventArgs.__setOldVisualOffset(null);
                newEventArgs.__setNewVisualOffset(null);
            }
            assert(curEventArgs.getNewVisualTransform() === newEventArgs.getOldVisualTransform());
            if (newEventArgs.getNewVisualTransform() === curEventArgs.getOldVisualTransform()) {
                newEventArgs.__setNewVisualTransform(null);
                newEventArgs.__setOldVisualTransform(null);
            }
            if (newEventArgs.__getOldRenderSize() === null
                && newEventArgs.__getOldVisualOffset() === null
                && newEventArgs.getOldVisualTransform() === newEventArgs.getNewVisualTransform()) {
                return null;
            }
            return newEventArgs;
        }
    }, Object.create(LayoutUpdatedEventQueueBehavior_baseTypeProto));
    EventClass.register(UIElement, "layoutUpdated", function (value) {
        return value != null && value.constructor === LayoutUpdatedEventArgs;
    }, new __LayoutUpdatedEventQueueBehavior());

    setOwnSrcPropsOnDst({
        UIElement: UIElement,
        LayoutUpdatedEventArgs: LayoutUpdatedEventArgs,
        LayoutUpdatedEventQueueBehavior: LayoutUpdatedEventQueueBehavior
    }, window);

})();