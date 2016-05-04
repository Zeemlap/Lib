(function () {


    var hasOwnPropertyFunction = Object.prototype.hasOwnProperty;
    var posInfDouble = 1 / 0;
    var assert = window.assert;

    function LayoutQueue() {
        throw Error();
    }
    function __LayoutQueue(contextLayoutManager) {
        assert(contextLayoutManager instanceof __ContextLayoutManager);
        this.__uiElementFromId = {};
        this.__uiElementFromId_count = 0;
        this.__contextLayoutManager = contextLayoutManager;
    }
    LayoutQueue.prototype = __LayoutQueue.prototype = {
        constructor: LayoutQueue,
        enqueueIfNeeded: function (uiElement) {
            var i;
            assert(uiElement instanceof UIElement);
            i = this.__getIsEnqueued(uiElement);
            assert(typeof i === "boolean");
            if (i) return;
            this.__removeLayoutIslandChildrenOf(uiElement);
            i = uiElement.__getUIElementTree_layoutIsland_parent();
            assert(i === null || i instanceof UIElement);
            if (i !== null && this.__getIsInvalidatedFlagAndNotInProgress(i)) return;
            this.__uiElementFromId[uiElement.getId()] = uiElement;
            this.__uiElementFromId_count += 1;
            this.__contextLayoutManager.__updateLayout_scheduleIfNotScheduledOrInProgress();
        },
        getIsEmpty: function() {
            return this.__uiElementFromId_count === 0;
        }, 
        __getIsEnqueued: function (uiElement) {
            return hasOwnPropertyFunction.call(this.__uiElementFromId, uiElement.getId());
        },
        __getIsInvalidatedFlagAndNotInProgress: function (uiElement) {
            throw Error();
        },
        peekAUIElementWithMinimalLayoutIslandDepth: function () {
            var i, uiElemFromId, uiElem1,
                uiElem1_layoutIslandDepth,
                uiElem2 = null,
                uiElem2_layoutIslandDepth = posInfDouble;
            uiElemFromId = this.__uiElementFromId;
            for (i in uiElemFromId) if (hasOwnPropertyFunction.call(uiElemFromId, i)) {
                uiElem1 = uiElemFromId[i];
                uiElem1_layoutIslandDepth = uiElem1.getUIElementTree_depth();
                if (uiElem1_layoutIslandDepth < uiElem2_layoutIslandDepth) {
                    uiElem2 = uiElem1;
                    uiElem2_layoutIslandDepth = uiElem1_layoutIslandDepth;
                }
            }
            return uiElem2;
        },
        __removeLayoutIslandChildrenOf: function (uiElement) {
            var i, c;
            i = uiElement.__getUIElementTree_children_count();
            while (0 <= --i) {
                c = uiElement.__uiElementTree_children_get(i);
                if (!c.__getIsLayoutIslandRoot()) {
                    this.remove(c);
                }
            }
        },
        remove: function (uiElement) {
            var uiElementFromId, uiElement_id;
            if (!(uiElement instanceof UIElement)) throw Error();
            uiElement_id = uiElement.getId();
            uiElementFromId = this.__uiElementFromId;
            if (hasOwnPropertyFunction.call(uiElementFromId, uiElement_id)) {
                delete uiElementFromId[uiElement_id];
                this.__uiElementFromId_count -= 1;
                return true;
            }
            return false;
        }
    };

    function ArrangeQueue() { throw Error(); }
    function __ArrangeQueue(contextLayoutManager) {
        __LayoutQueue.call(this, contextLayoutManager);
    }        
    ArrangeQueue.prototype = __ArrangeQueue.prototype = setOwnSrcPropsOnDst({
        constructor: ArrangeQueue,
        __getIsInvalidatedFlagAndNotInProgress: function (uiElement) {
            return !uiElement.__getIsArrangeValid() && !uiElement.__getIsArrangeInProgress();
        }
    }, Object.create(__LayoutQueue.prototype));

    function MeasureQueue() { throw Error(); }
    function __MeasureQueue(contextLayoutManager) {
        __LayoutQueue.call(this, contextLayoutManager);
    }
    MeasureQueue.prototype = __MeasureQueue.prototype = setOwnSrcPropsOnDst({
        constructor: MeasureQueue,
        __getIsInvalidatedFlagAndNotInProgress: function (uiElement) {
            return !uiElement.__getIsMeasureValid() && !uiElement.__getIsMeasureInProgress();
        }
    }, Object.create(__LayoutQueue.prototype));

    function __ContextLayoutManager() {
        this.__arrangeQueue = new __ArrangeQueue(this);
        this.__measureQueue = new __MeasureQueue(this);
        this.__updateLayout_isInProgress = false;
        this.__updateLayout_task = null;
    }
    __ContextLayoutManager.prototype = {
        constructor: __ContextLayoutManager,
        getArrangeQueue: function () {
            return this.__arrangeQueue;
        },
        getMeasureQueue: function () {
            return this.__measureQueue;
        },
        __updateLayout_scheduleIfNotScheduledOrInProgress: function () {
            if (this.__updateLayout_task !== null || this.__updateLayout_isInProgress) {
                return;
            }
            // We do not perform layout immediately so that any mouse events that are queued will be raised before layout is performed.
            // Therefore any metrics w.r.t. mouse events will always be consistent with the mouse position.
            // Furthermore, any layout invalidations are grouped together and thereby less processing is performed.
            this.__updateLayout_task = Dispatcher.getInstance().runAtMillisecondsRelativeToNow(1, this.__updateLayoutFromTask, this);
        },
        __updateLayout: function () {
            var measureQueue, uiElem1;
            var arrangeQueue;
            try {
                this.__updateLayout_isInProgress = true;
                measureQueue = this.__measureQueue;
                arrangeQueue = this.__arrangeQueue;
                outer: while (true) {
                    while ((uiElem1 = measureQueue.peekAUIElementWithMinimalLayoutIslandDepth()) !== null) {
                        uiElem1.measure(uiElem1.__measure_getAvailableSize());
                    }
                    while ((uiElem1 = arrangeQueue.peekAUIElementWithMinimalLayoutIslandDepth()) !== null) {
                        uiElem1.arrange(uiElem1.__arrange_getFinalRect());
                        if (!measureQueue.getIsEmpty()) {
                            continue outer;
                        }
                    }
                    break;
                }
            } catch (e) {
                throw e;
            } finally {
                this.__updateLayout_isInProgress = false;
            }
        },
        __updateLayoutFromTask: function () {
            this.__updateLayout_task = null;
            this.__updateLayout();
        }
    };

    var contextLayoutManager = new __ContextLayoutManager();
    __ContextLayoutManager.getInstance = function () {
        return contextLayoutManager;
    };
    setOwnSrcPropsOnDst({
        __ContextLayoutManager: __ContextLayoutManager,
        LayoutQueue: LayoutQueue,
        ArrangeQueue: ArrangeQueue,
        MeasureQueue: MeasureQueue
    }, window);

})();