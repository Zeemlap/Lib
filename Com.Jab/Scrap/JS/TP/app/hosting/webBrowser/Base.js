(function () {
    var undefined;
    var array_prototype_slice = Array.prototype.slice;
    var floorDouble = Math.floor;
    var hasOwnPropertyFunction = Object.prototype.hasOwnProperty;

    var hostSpecificPropertyPrefixes = ["ms", "moz", "webkit", "o"];
    var HostObject_idExpandoPropertyName = "__TimelinePlatform.Web_" + Date.now().toString(16) + "__";
    var HostObject_idGenerator = new StringGenerator();
    var HostObject_dataFromId = {};
    function __HostObject_getData(hostObject) {
        var hostObject_id = getOwnProperty(hostObject, HostObject_idExpandoPropertyName);
        if (hostObject_id === undefined) {
            return null;
        }
        assert(hasOwnProperty(HostObject_dataFromId, hostObject_id));
        var hostObject_data = HostObject_dataFromId[hostObject_id];
        return hostObject_data;
    }
    function __HostObject_initializeData(hostObject) {
        var hostObject_id, hostObject_data;
        hostObject_id = HostObject_idGenerator.next();
        hostObject[HostObject_idExpandoPropertyName] = hostObject_id;
        hostObject_data = {};
        HostObject_dataFromId[hostObject_id] = hostObject_data;
        return hostObject_data;
    }
    function __HostObject_ensureData(hostObject) {
        var hostObject_data = __HostObject_getData(hostObject);
        if (hostObject_data === null) return __HostObject_initializeData(hostObject);
        return hostObject_data;
    }
    function __HostObject_deleteData(hostObject) {
        var hostObject_id = getOwnProperty(hostObject, HostObject_idExpandoPropertyName);
        if (hostObject_id === undefined) {
            return false;
        }
        assert(hasOwnProperty(HostObject_dataFromId, hostObject_id));
        var hostObject_data = HostObject_dataFromId[hostObject_id];
        
        var eventName, hostEventDelegatorHandlers, hostEventDelegatorHandler;
        hostEventDelegatorHandlers = getOwnProperty(hostObject_data, "hostEventDelegatorHandlers");
        if (hostEventDelegatorHandlers !== undefined) {
            for (var eventName in hostEventDelegatorHandlers) {
                if (!hasOwnProperty(hostEventDelegatorHandlers, eventName)) break;
                hostEventDelegatorHandler = hostEventDelegatorHandlers[eventName];
                if (hostEventDelegatorHandler.__shouldUseDetachEvent) {
                    hostEventDelegatorHandler.__hostObject.detachEvent(
                        "on" + eventName,
                        hostEventDelegatorHandler.__onHostEventFunc);
                } else {
                    hostEventDelegatorHandler.__hostObject.removeEventListener(
                        eventName,
                        hostEventDelegatorHandler.__onHostEventFunc,
                        false);
                }                                    
            }
        }

        delete HostObject_dataFromId[hostObject_id];
        if (isObject(hostObject.removeAttribute)) {
            try {
                hostObject.removeAttribute(HostObject_idExpandoPropertyName);
            } catch (e) {
            }
        }
        if (typeof hostObject[HostObject_idExpandoPropertyName] === "string") {
            hostObject[HostObject_idExpandoPropertyName] = undefined;
        }
        HostObject_idGenerator.recycle(hostObject_id);
        return true;
    }


    function __UserEventHandler(func, thisp, prev) {
        this.__func = func;
        this.__thisp = thisp;
        this.__prev = prev;
    }
    function UserEventHandler() { throw Error(); }
    __UserEventHandler.prototype = UserEventHandler.prototype = {
        invoke: function (sender, e) {
            return this.__func.call(this.__thisp, sender, e);
        }
    };

    function __HostEventDelegatorHandler(hostObject, flags) {
        this.__hostObject = hostObject;
        this.__flags = flags;
        this.__invokeFunc = this.invoke.bind(this);
        this.__eventArgs = null;
    }
    function HostEventDelegatorHandler() { throw Error(); }
    __HostEventDelegatorHandler.prototype = HostEventDelegatorHandler.prototype = {
        constructor: HostEventDelegatorHandler,
        invoke: function (hostEvent) {
            try {
                this.__eventArgs = new HostEventEventArgs(arguments.length < 1 ? event : hostEvent, HostUtilities.fromHostObject(this.__hostObject));
                Dispatcher.getInstance().__runIOperationHooked(this);
            } catch (e) {
                throw e;
            } finally {
                this.__eventArgs = null;
            }
        },
        // __IDispatcherOperation interface
        __run: function () {

            var hostObject = this.__hostObject;
            var hostObject_data = __HostObject_getData(hostObject);
            assert(hostObject_data !== null && hasOwnPropertyFunction.call(hostObject_data, "lastUserHandlerFromEventName"));
            var lastUserHandlerFromEventName = hostObject_data.lastUserHandlerFromEventName;
            var eventArgs = this.__eventArgs;
            var userHandler = lastUserHandlerFromEventName[eventArgs.getEventName()];
            var userHandlerListReversed = [];
            var i = 0;
            do {
                userHandlerListReversed[i++] = userHandler;
            } while ((userHandler = userHandler.__prev) !== null);
            do userHandlerListReversed[--i].invoke(hostObject, eventArgs);
            while (0 < i);
        }
    };

    function HostEventEventArgs(hostEvent, hostUtilities) {
        this.__hostEvent = hostEvent;
        this.__hostUtilities = hostUtilities;
        this.__targetHostElem = null;
        this.__targetHostElem_isSet = false;
        this.__isDefaultPrevented = null;
    }
    HostEventEventArgs.prototype = Object.create(EventArgs.prototype);
    setOwnSrcPropsOnDst({
        constructor: HostEventEventArgs,
        getChangedMouseButton_fromHostEventWhichProperty: function () {
            var t = this.getHostEvent().which;
            if (typeof t === "number" && t % 1 === 0 && -1 < t) {
                if (t === 0) throw Error();
                return t;
            }
            return 0;
        },
        getEventName: function () {
            return this.getHostEvent().type;
        },
        getHostEvent: function () {
            return this.__hostEvent;
        },
        getIsDefaultPrevented: function () {
            var hostEvent, v;
            hostEvent = this.getHostEvent();
            if (!isObject(hostEvent.preventDefault)) {
                v = hostEvent.returnValue;
                if (typeof v === "boolean") {
                    return this.getEventName() === "error" ? !v : v;
                }
            }
            if (isObject(hostEvent.isDefaultPrevented)) {
                return hostEvent.isDefaultPrevented();
            }
            return this.__isDefaultPrevented;
        },
        getMousePosition_screen: function () {
            var t = this.getHostEvent();
            return new Vector2(t.screenX, t.screenY);
        },
        getMousePosition_viewport: function () {
            var t, x, y, mousePos_vp;
            t = this.getHostEvent();
            x = t.clientX;
            y = t.clientY;
            mousePos_vp = null;
            if (isFiniteDouble(x) && isFiniteDouble(y)) {
                mousePos_vp = new Vector2(x, y);
                mousePos_vp = this.__hostUtilities.transform_hostClientToViewport(mousePos_vp);
                if (!mousePos_vp.getAreXAndYFinite()) {
                    mousePos_vp = null;
                }
            }
            return mousePos_vp;
        },
        getRelatedHostElem: function () {
            var hostEvent = this.getHostEvent();
            var relatedHostElem = hostEvent.relatedTarget;
            if (!isObject(relatedHostElem)) {
                relatedHostElem = hostEvent.fromElement;
                if (relatedHostElem === this.getTargetHostElem()) {
                    relatedHostElem = hostEvent.toElement;
                }
            }
            if (!isObject(relatedHostElem)) relatedHostElem = null;
            else assert(isHostElement(relatedHostElem) && relatedHostElem.ownerDocument === this.__hostUtilities.getDocNode());
            return relatedHostElem;
        },
        getTargetHostElem: function () {
            var hostEvent, targetHostElem;
            if (this.__targetHostElem_isSet) return this.__targetHostElem;
            hostEvent = this.getHostEvent();
            targetHostElem = hostEvent.srcElement;
            if (!isObject(targetHostElem)) targetHostElem = hostEvent.target;
            if (!isObject(targetHostElem)) targetHostElem = this.__hostUtilities.getDocElem();
            else if (targetHostElem.nodeType === 3) targetHostElem = targetHostElem.parentNode;
            assert(isHostElement(targetHostElem) && targetHostElem.ownerDocument === this.__hostUtilities.getDocNode());
            this.__targetHostElem = targetHostElem;
            this.__targetHostElem_isSet = true;
            return targetHostElem;
        },
        preventDefault: function () {
            var hostEvent;
            hostEvent = this.getHostEvent();
            if (isObject(hostEvent.preventDefault)) {
                hostEvent.preventDefault();
                this.__isDefaultPrevented = true;
            } else if (typeof hostEvent.returnValue === "boolean") {
                hostEvent.returnValue = this.getEventName() !== "error";
            } else {
                return;
            }
        },
        setTargetHostElem: function (value) {
            var hostDocNode;
            if (value !== null) {
                if (!isHostElement(value)) throw Error();
                hostDocNode = this.__hostUtilities.getDocNode();
                if (value.ownerDocument !== hostDocNode) throw Error();
            }
            this.__targetHostElem = value;
            this.__targetHostElem_isSet = true;
        }
    }, HostEventEventArgs.prototype);

    function HostObject_addEventHandler(hostObject, eventName, func, thisp) {
        if (typeof eventName !== "string" || !isFunction(func)) throw Error();
        if (thisp === undefined) thisp = null;
        var hostObject_data = __HostObject_getData(hostObject);
        var lastUserHandlerFromEventName;
        var prevUserHandler;
        var hostEventDelegatorHandlerFromEventName;
        var hostEventDelegatorHandler;
        var flags = 0;
        if (hostObject_data === null) {
            flags |= 7;
        } else {
            if (!hasOwnPropertyFunction.call(hostObject_data, "lastUserHandlerFromEventName")) {
                flags |= 6;
            }
            assert(((flags & 2) === 0) === hasOwnPropertyFunction.call(hostObject_data, "hostEventDelegatorHandlerFromEventName"));
            if ((flags & 2) === 0) {
                lastUserHandlerFromEventName = hostObject_data.lastUserHandlerFromEventName;
                hostEventDelegatorHandlerFromEventName = hostObject_data.hostEventDelegatorHandlerFromEventName;
                if (!hasOwnPropertyFunction.call(hostEventDelegatorHandlerFromEventName, eventName)) {
                    flags |= 4;
                }
                assert(((flags & 4) === 0) === hasOwnPropertyFunction.call(lastUserHandlerFromEventName, eventName));
            }
        }
        if ((flags & 2) !== 0) {
            lastUserHandlerFromEventName = {};
            hostEventDelegatorHandlerFromEventName = {};
        }
        if ((flags & 4) !== 0) {
            if (isObject(hostObject.attachEvent)) {
                flags |= 8;
            }
            hostEventDelegatorHandler = new __HostEventDelegatorHandler(hostObject, flags);
            if ((flags & 8) !== 0) {
                hostObject.attachEvent("on" + eventName, hostEventDelegatorHandler.__invokeFunc);
            } else {
                hostObject.addEventListener(eventName, hostEventDelegatorHandler.__invokeFunc, false);
            }
            hostEventDelegatorHandlerFromEventName[eventName] = hostEventDelegatorHandler;
            prevUserHandler = null;
        } else {
            prevUserHandler = lastUserHandlerFromEventName[eventName];
        }
        lastUserHandlerFromEventName[eventName] = new __UserEventHandler(func, thisp, prevUserHandler);
        if ((flags & 1) !== 0) {
            hostObject_data = __HostObject_initializeData(hostObject);
        }
        if ((flags & 2) !== 0) {
            hostObject_data.lastUserHandlerFromEventName = lastUserHandlerFromEventName;
            hostObject_data.hostEventDelegatorHandlerFromEventName = hostEventDelegatorHandlerFromEventName;
        }
    }
    function HostObject_removeEventHandler(hostObject, eventName, func, thisp) {
        if (typeof eventName !== "string" || !isFunction(func)) throw Error();
        var hostObject_data = __HostObject_getData(hostObject);
        if (hostObject_data === null) return;
        var lastUserHandlerFromEventName;
        if (hasOwnPropertyFunction.call(hostObject_data, "lastUserHandlerFromEventName")) {
            lastUserHandlerFromEventName = hostObject_data.lastUserHandlerFromEventName;
        }
        assert((lastUserHandlerFromEventName === undefined) === !hasOwnPropertyFunction.call(hostObject_data, "hostEventDelegatorHandlerFromEventName"));
        if (lastUserHandlerFromEventName === undefined) return;
        var userHandler1;
        if (hasOwnPropertyFunction.call(lastUserHandlerFromEventName, eventName)) {
            userHandler1 = lastUserHandlerFromEventName[eventName];
        }
        assert((userHandler1 === undefined) === !hasOwnProperty(hostObject_data.hostEventDelegatorHandlerFromEventName, eventName));
        if (userHandler1 === undefined) return;
        if (thisp === undefined) thisp = null;
        if (userHandler1.__func === func && userHandler1.__thisp === thisp) {
            if (userHandler1.__prev === null) {
                var hostEventDelegatorHandlerFromEventName;
                var hostEventDelegatorHandler;
                hostEventDelegatorHandlerFromEventName = hostObject_data.hostEventDelegatorHandlerFromEventName;
                hostEventDelegatorHandler = hostEventDelegatorHandlerFromEventName[eventName];
                assert(hostObject === hostEventDelegatorHandler.__hostObject);
                if ((hostEventDelegatorHandler.__flags & 8) !== 0) {
                    hostObject.detachEvent("on" + eventName, hostEventDelegatorHandler.__invokeFunc);
                } else {
                    hostObject.removeEventListener(eventName, hostEventDelegatorHandler.__invokeFunc, false);
                }
                delete lastUserHandlerFromEventName[eventName];
                delete hostEventDelegatorHandlerFromEventName[eventName];

                assert(hasOwnProperties(lastUserHandlerFromEventName) === hasOwnProperties(hostEventDelegatorHandlerFromEventName));
                if (!hasOwnProperties(lastUserHandlerFromEventName)) {
                    delete hostObject_data.lastUserHandlerFromEventName;
                    delete hostObject_data.hostEventDelegatorHandlerFromEventName;
                    if (!hasOwnProperties(hostObject_data)) {
                        var f = __HostObject_deleteData(hostObject);
                        assert(f);
                    }
                }
                return;
            }
            lastUserHandlerFromEventName[eventName] = userHandler1.__prev;
            return;
        }
        var userHandler2;
        while (true) {
            userHandler2 = userHandler1;
            if ((userHandler1 = userHandler1.__prev) === null) {
                break;
            }
            if (userHandler1.__func === func && userHandler1.__thisp === thisp) {
                userHandler2.__prev = userHandler1.__prev;
                break;
            }
        }
    }
                      
    setOwnSrcPropsOnDst({
        HostObject_addEventHandler: HostObject_addEventHandler,
        __HostObject_deleteData: __HostObject_deleteData,
        __HostObject_ensureData: __HostObject_ensureData,
        __HostObject_getData: __HostObject_getData,
        __HostObject_initializeData: __HostObject_initializeData,
        HostObject_removeEventHandler: HostObject_removeEventHandler,
        HostEventEventArgs: HostEventEventArgs
    }, window);


    function AnimationFramePolyfillUsingSetTimeout() {
        this.__noTicksPerSec = 60;
        this.__tickIntervalMillis = 1000 / this.__noTicksPerSec;
        this.__unixMilliTime_prevDesiredScheduledTick = 0;
        this.__unixMilliTime_nextDesiredScheduledTick = 0;
        this.__timeoutId_nextScheduledTick = null;
        this.__requestFromId = {};
        this.__nextRequestId = 0;
        this.__timeoutFunc_nextScheduledTick = this.__onTick.bind(this);
    }
    AnimationFramePolyfillUsingSetTimeout.prototype = {
        constructor: AnimationFramePolyfillUsingSetTimeout,
        __addRequest: function (func) {
            var unixMilliTime_now, millisFromNow, i,
                unixMilliTime_prevDesiredTick;
            if (this.__nextRequestId === largestDecrementableIntegralDouble) throw Error();
            if (this.__timeoutId_nextScheduledTick === null) {
                unixMilliTime_now = Date.now();
                i = floorDouble((unixMilliTime_now - this.__unixMilliTime_prevDesiredScheduledTick) / this.__tickIntervalMillis);
                unixMilliTime_prevDesiredTick = this.__unixMilliTime_prevDesiredScheduledTick + i * this.__tickIntervalMillis;
                this.__unixMilliTime_nextDesiredScheduledTick = unixMilliTime_prevDesiredTick + this.__tickIntervalMillis;
                millisFromNow = bankersRoundingDouble(this.__unixMilliTime_nextDesiredScheduledTick) - unixMilliTime_now;
                if (millisFromNow === 0) {
                    millisFromNow = bankersRoundingDouble(this.__unixMilliTime_nextDesiredScheduledTick + this.__tickIntervalMillis) - unixMilliTime_now;
                }
                this.__timeoutId_nextScheduledTick = setTimeout(this.__timeoutFunc_nextScheduledTick, millisFromNow);
            }
            i = this.__nextRequestId++;
            this.__requestFromId[i] = func;
            return i;
        },
        __onTick: function () {
            var i, requestFromId_old, func;
            this.__unixMilliTime_prevDesiredScheduledTick = this.__unixMilliTime_nextDesiredScheduledTick;
            this.__timeoutId_nextScheduledTick = null;
            requestFromId_old = this.__requestFromId;
            this.__requestFromId = {};
            for (i in requestFromId_old) {
                if (!hasOwnPropertyFunction.call(requestFromId_old, i)) break;
                func = requestFromId_old[i];
                func();
            }
        },
        removeRequest: function (id) {
            var requestFromId, i;
            requestFromId = this.__requestFromId;
            if (!hasOwnPropertyFunction.call(requestFromId, id)) return;
            delete requestFromId[id];
            for (i in requestFromId) if (hasOwnPropertyFunction.call(requestFromId, i)) {
                return;
            }
            clearTimeout(this.__timeoutId_nextScheduledTick);
            this.__timeoutId_nextScheduledTick = null;
        }
    };
             
    var KnownHostId_null = 0;
    var KnownHostId_msie = 1;
    var KnownHostId_firefox = 2;
    var KnownHostId_chrome = 3;
    var HostUtilities_packedData_knownHostId_mask = 0x0000003;
    var HostUtilities_packedData_isVersionAtLeast5 = 0x4000000;
    var HostUtilities_packedData_isVersionLessThan7 = 0x2000000;

    var HostUtilities_baseTypeName = "ObjectWithEvents";
    var HostUtilities_baseTypeCtor = window[HostUtilities_baseTypeName];
    var HostUtilities_baseTypeProto = HostUtilities_baseTypeCtor.prototype;
    function HostUtilities() {
        throw Error();
    }
    function __HostUtilities(hostContext) {
        HostUtilities_baseTypeCtor.call(this);
        this.__hostContext = hostContext;
        this.__version = null;
        this.__packedData = 0;
        this.__addAnimationFrameRequestFunction = this.__initializingAddAnimationFrameRequestFunction;
        this.__createHttpRequestFactoryFunction = this.__initializingHttpRequestFactoryFunction;
        this.__removeAnimationFrameRequestFunction = this.__initializingRemoveAnimationFrameRequestFunction;
        this.__initializeFromHostNavigator();
        __HostObject_ensureData(hostContext).hostUtilities = this;
        __HostObject_ensureData(this.getDocNode()).hostUtilities = this;

        this.__viewportSize_lastKnown = this.getSize_viewport();
        this.__viewportSize_pollSetIntervalFunc = this.__onViewportSizePotentiallyChanged.bind(this);
        // In older MSIE browsers changes to borderWidth/borderStyle of HTML/BODY element (in STRICT/QUIRKS mode, respectively) results in 
        // the size of what we call viewport changing.
        this.__viewportSize_pollSetIntervalId = setInterval(this.__viewportSize_pollSetIntervalFunc, 1000);
        HostObject_addEventHandler(this.getHostContext(), "resize", this.__onViewportSizePotentiallyChanged, this);
    }
    __HostUtilities.prototype = HostUtilities.prototype = setOwnSrcPropsOnDst({
        constructor: HostUtilities,
        addAnimationFrameRequest: function (func) {
            var addAnimationFrameRequestFunction;
            if (!isFunction(func)) throw Error();
            addAnimationFrameRequestFunction = this.__addAnimationFrameRequestFunction;
            addAnimationFrameRequestFunction(func);
        },
        createHttpRequest: function () {
            return this.__createHttpRequestFactoryFunction();
        },
        _disposeCore: function() {
            throw Error();
        },
        getBodyElem: function () {
            var bodyElem = this.getDocNode().body;
            if (bodyElem !== null && !isHostElement(bodyElem)) throw Error();
            return bodyElem;
        },
        getDocElem: function () {
            var docElem = this.getDocNode().documentElement;
            if (!isHostElement(docElem)) throw Error();
            return docElem;
        },
        getDocNode: function () {
            var docNode = this.getHostContext().document;
            if (!isHostDocNode(docNode)) throw Error();
            return docNode;
        },
        getHostContext: function () {
            return this.__hostContext;
        },
        getIsChrome: function () {
            return (this.__packedData & HostUtilities_packedData_knownHostId_mask) === KnownHostId_chrome;
        },
        getIsFirefox: function () {
            return (this.__packedData & HostUtilities_packedData_knownHostId_mask) === KnownHostId_firefox;
        },
        getIsHostElementSelectionDisabledWithinSubtree: function (hostElement) {
            var style;
            if (typeof document.createElement("div").style.WebkitUserSelect === "string") {
                style = this.__getHostElement_cascadedStyle(hostElement);
                switch (style.WebkitUserSelect) {
                    case "none":
                        return true;
                    case "text":
                        return false;
                    default:
                        throw Error();
                }
            } else {
                throw Error();
            }
        },
        getIsMsie: function () {
            return (this.__packedData & HostUtilities_packedData_knownHostId_mask) === KnownHostId_msie;
        },
        getIsVersionAtLeast5: function () {
            return (this.__packedData & HostUtilities_packedData_isVersionAtLeast5) !== 0;
        },
        getIsVersionLessThan7: function () {
            return (this.__packedData & HostUtilities_packedData_isVersionLessThan7) !== 0;
        },      
        getSize_hostClient: function () {
            var hostElem, v;
            v = this.__getSize_hostContextInnerWidthHeight();
            if (v !== null) return v;
            if (this.getDocNode().compatMode === "CSS1Compat") {
                hostElem = this.getDocElem();
            } else {
                hostElem = this.getBodyElem();
                if (hostElem === null) throw Error();
            }
            v = new Vector2(hostElem.offsetWidth, hostElem.offsetHeight);
            return v;
        },
        __getSize_hostContextInnerWidthHeight: function () {
            var w, h, fw, fh, hostContext;
            hostContext = this.getHostContext();
            w = hostContext.innerWidth;
            h = hostContext.innerHeight;
            fw = typeof w === "number" && !(w < 0) && w < 1 / 0;
            fh = typeof h === "number" && !(h < 0) && h < 1 / 0;
            assert(fw === fh);
            if (fw) {
                return new Vector2(w, h);
            }
            return null;
        },
        getSize_viewport: function () {
            var w;
            w = this.__getSize_hostContextInnerWidthHeight();
            if (w !== null) return w;
            throw Error();
        },
        getVersion: function () { return this.__version; },
        hostElementsFromPoint_viewport: function (v) {
            var docNode, hostElems, hostElem;
            v = this.transform_viewportToHostClient(v.clone());
            // TODO implement elementFromPoint coordinate space feature detection

            docNode = this.getDocNode();
            if (isObject(docNode.elementsFromPoint)) {
                hostElems = docNode.elementsFromPoint(v.getX(), v.getY());
            } else if (isObject(docNode.msElementsFromPoint)) {
                hostElems = docNode.msElementsFromPoint(v.getX(), v.getY());
            } else if (isObject(docNode.elementFromPoint)) {
                hostElem = docNode.elementFromPoint(v.getX(), v.getY());
                hostElems = isObject(hostElem) ? [hostElem] : [];
            } else {
                throw Error();
            }
            return hostElems;
        },
        __initializeAnimationFrameRequestFunctions: function () {
            var hc, i, hostSpecificPrefix;
            hc = this.getHostContext();
            this.__addAnimationFrameRequestFunction = hc.requestAnimationFrame;
            this.__removeAnimationFrameRequestFunction = hc.cancelAnimationFrame;
            if (!isObject(this.__removeAnimationFrameRequestFunction)) {
                this.__removeAnimationFrameRequestFunction = hc.cancelRequestAnimationFrame;
            }
            if (isObject(this.__addAnimationFrameRequestFunction) && isObject(this.__removeAnimationFrameRequestFunction)) {
                return;
            }
            for (i = hostSpecificPropertyPrefixes.length; 0 <= --i;) {
                hostSpecificPrefix = hostSpecificPropertyPrefixes[i];
                this.__addAnimationFrameRequestFunction = hc[hostSpecificPrefix + "RequestAnimationFrame"];
                this.__removeAnimationFrameRequestFunction = hc[hostSpecificPrefix + "CancelAnimationFrame"];
                if (!isObject(this.__removeAnimationFrameRequestFunction)) {
                    this.__removeAnimationFrameRequestFunction = hc[hostSpecificPrefix + "CancelRequestAnimationFrame"];
                }
                if (isObject(this.__addAnimationFrameRequestFunction) && isObject(this.__removeAnimationFrameRequestFunction)) {
                    return;
                }
            }
            i = new AnimationFramePolyfillUsingSetTimeout();
            this.__addAnimationFrameRequestFunction = i.__addRequest.bind(i);
            this.__removeAnimationFrameRequestFunction = i.removeRequest.bind(i);
        },
        __initializeFromHostNavigator: function () {
            var nav, ua, m;
            nav = this.getHostContext().navigator;
            if (!isObject(navigator)) return;
            ua = nav.userAgent;
            if (typeof ua !== "string") return;
            m = /MSIE (\d+(?:\.\d+)*)?/.exec(ua);
            if (m !== null) {
                if ((this.__packedData & HostUtilities_packedData_knownHostId_mask) !== KnownHostId_null) throw Error();
                this.__packedData |= KnownHostId_msie;
                if (m[1] !== undefined && 0 < m[1].length) {
                    this.__version = new Version(m[1]);
                }
            }
            if (0 <= ua.indexOf("Firefox")) {
                if ((this.__packedData & HostUtilities_packedData_knownHostId_mask) !== KnownHostId_null) throw Error();
                this.__packedData |= KnownHostId_firefox
            }
            m = /(?:^|\s)Chrome\/(\d+(?:\.\d+)*)(?:\s|$)/.exec(ua);
            if (m !== null) {
                if ((this.__packedData & HostUtilities_packedData_knownHostId_mask) !== KnownHostId_null) throw Error();
                this.__packedData |= KnownHostId_chrome;
                this.__version = new Version(m[1]);
            }
            if (this.__version !== null) {
                if (new Version("5.0").compareTo(this.__version) <= 0) this.__packedData |= HostUtilities_packedData_isVersionAtLeast5;
                if (this.__version.compareTo(new Version("7.0")) < 0) this.__packedData |= HostUtilities_packedData_isVersionLessThan7;
            }
        },
        __initializingAddAnimationFrameRequestFunction: function(func) {
            var addAnimationFrameRequestFunction;
            this.__initializeAnimationFrameRequestFunctions();
            addAnimationFrameRequestFunction = this.__addAnimationFrameRequestFunction;
            return addAnimationFrameRequestFunction(func);
        },
        __initializingHttpRequestFactoryFunction: function() {
            var hc, hostHttpReqFactoryFuncs, i;
            var hc_XmlHttpReq, hc_ActiveXObj;
            var hostHttpReqFactoryFunc, hostHttpReq;
            hostHttpReqFactoryFuncs = [];
            i = 0;

            hc = this.getHostContext();

            hc_ActiveXObj = hc.ActiveXObject;
            if (isObject(hc_ActiveXObj)) {
                hostHttpReqFactoryFuncs[i++] = function () { return new hc_ActiveXObj("MSXML2.XMLHTTP.3.0"); };
                hostHttpReqFactoryFuncs[i++] = function () { return new hc_ActiveXObj("MSXML2.XMLHTTP.6.0"); };
            }
            hc_XmlHttpReq = hc.XMLHttpRequest
            if (isObject(hc_XmlHttpReq)) {
                hostHttpReqFactoryFuncs[i++] = function () { return new hc_XmlHttpReq(); };
            }
            while (0 <= --i) {
                hostHttpReqFactoryFunc = hostHttpReqFactoryFuncs[i];
                try {
                    hostHttpReq = hostHttpReqFactoryFunc();
                    this.__createHttpRequestFactoryFunction = hostHttpReqFactoryFunc;
                    return hostHttpReq;
                } catch (e) {
                }
            }
            hostHttpReqFactoryFunc = function () { throw Error(); };
            this.__createHttpRequestFactoryFunction = hostHttpReqFactoryFunc;
            return hostHttpReqFactoryFunc();
        },
        __initializingRemoveAnimationFrameRequestFunction: function(id) {
            var removeAnimationFrameRequestFunction;
            this.__initializeAnimationFrameRequestFunctions();
            removeAnimationFrameRequestFunction = this.__removeAnimationFrameRequestFunction;
            removeAnimationFrameRequestFunction(i);
        },
        __onViewportSizePotentiallyChanged: function () {
            var s1, s2;
            s1 = this.__viewportSize_lastKnown;
            s2 = this.getSize_viewport();
            if (s1.isCloseTo(s2)) return;
            this.__viewportSize_lastKnown = s2.clone();
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("size_viewport", s1, s2));
        },
        removeAnimationFrameRequest: function (id) {
            var removeAnimationFrameRequestFunction;
            removeAnimationFrameRequestFunction = this.__removeAnimationFrameRequestFunction;
            removeAnimationFrameRequestFunction(id);
        },
        setIsHostElementSelectionDisabledWithinSubtree: function (hostElement, value) {
            if (!(typeof value === "boolean")) throw Error();
            if (typeof hostElement.style.WebkitUserSelect === "string") {
                hostElement.style.WebkitUserSelect = value
                    ? "none"
                    : "text";
            } else {
                throw Error();
            }
        },
        transform_hostClientToViewport: function (v) {
            return this.__transform_hostClientViewport(v, -1);
        },
        __transform_hostClientViewport: function (v, s) {
            var hostElem, cl, ct;
            if (!(v instanceof Vector2) && !(v instanceof Rect2D)) throw Error();
            if (!this.getIsMsie()) return v;
            hostElem = null;
            if (this.getIsVersionAtLeast5() && this.getIsVersionLessThan7()) {
                hostElem = this.getDocNode().compatMode === "CSS1Compat" ? this.getDocElem() : this.getBodyElem();
            }
            if (hostElem === null) {
                throw Error(); // TODO this is not implemented for other IE versions
            }
            cl = hostElem.clientLeft;
            ct = hostElem.clientTop;
            if (!isFiniteDouble(cl) || !isFiniteDouble(ct)) throw Error();
            v.assign(
                pos.getX() + s * cl,
                pos.getY() + s * ct);
            return v;
        },       
        transform_screenToHostClient: function (v) {
            var hostContext, x, y;
            if (!(v instanceof Vector2) && !(v instanceof Rect2D)) throw Error();
            hostContext = this.getHostContext();
            x = hostContext.screenLeft;
            y = hostContext.screenTop;
            if (!isFiniteDouble(x) || !isFiniteDouble(y)) throw Error();
            v.setX(v.getX() - x);
            v.setY(v.getY() - y);
            return v;
        },
        transform_viewportContentToBodyElemContent: function (v) {
            var docElem, bodyElem, bodyElem_cs, docNode;
            var bodyElem_scroll, r;
            if (!(v instanceof Vector2) && !(v instanceof Rect2D)) throw Error();
            bodyElem = this.getBodyElem();
            if (bodyElem === null || !isObject(bodyElem.getBoundingClientRect)) {
                throw Error();
            }
            docElem = this.getDocElem();
            docNode = this.getDocNode();
            if (this.getIsMsie()) {
                if (this.getIsVersionAtLeast5() && this.getIsVersionLessThan7()) {
                    if (docNode.compatMode !== "CSS1Compat") {
                        // The body element represents the viewport and its content coordinate 
                        // space is the same as the viewport content coordinate space.
                        return v;
                    }
                    // The document element represents the viewport and the body element could still: 
                    // 1. have an offset relative to the viewport content;
                    // 2. have a border;
                    // 3. be scrollable and have a scroll offset.
                } else {
                    throw Error();
                }
                bodyElem_scroll = new Vector2(bodyElem.scrollLeft, bodyElem.scrollTop);
                if (!bodyElem_scroll.getAreXAndYFinite()) throw Error();
            } else {
                if (!this.getIsChrome()) throw Error();
                if ((bodyElem_cs = HostElement_getComputedStyle(bodyElem)).get_string("overflow") !== "visible"
                    || HostElement_getComputedStyle(docElem).get_string("overflow") !== "visible") {
                    // bodyElem as well as docElem may have a scrollBar,
                    // but bodyElem.scrollLeft and bodyElem.scrollTop report viewport scrolling (in Chrome)
                    throw Error();
                    // We could use getBoundingClientRect() on a child of bodyElem and compare it to getBoundingClientRect of bodyElem
                    // to find out scrolling, but this is error-prone and will depend on positioning of child.
                }
                bodyElem_scroll = new Vector2(0, 0);
                // The document element could still have:
                // 1. an offset relative to the viewport content;
                // 2. a border.
                // The body element could still have:
                // 1. an offset relative to the the document element content or viewport content;
                // 2. a border.
                // We consider all the above steps (except taking into account the body element border) below by using getBoundingClientRect.
            }
            r = HostElement_getBoundingRect_viewport(bodyElem);
            if (r === null) throw Error(); // Body is disconnected from the dom.
            this.transform_viewportToViewportContent(r);
            if (bodyElem_cs === undefined) bodyElem_cs = HostElement_getComputedStyle(bodyElem);
            v.setX(v.getX() - r.getX() - bodyElem_cs.get_parsed("borderLeftWidth") + bodyElem_scroll.getX());
            v.setY(v.getY() - r.getY() - bodyElem_cs.get_parsed("borderTopWidth") + bodyElem_scroll.getY());
            return v;

        },
        transform_viewportToHostClient: function (v) {
            return this.__transform_hostClientViewport(v, 1);
        },
        transform_viewportToViewportContent: function (v) {
            return this.__transform_viewportViewportContent(v, 1);
        },
        __transform_viewportViewportContent: function (v, s) {
            var hostContext, dx, dy, ver, hostElem;
            if (!(v instanceof Vector2) && !(v instanceof Rect2D)) throw Error();
            hostContext = this.getHostContext();
            dx = hostContext.pageXOffset;
            dy = hostContext.pageYOffset;
            assert(isFiniteDouble(dx) === isFiniteDouble(dy));
            if (!isFiniteDouble(dx)) {
                hostElem = null;
                if (this.getIsMsie()
                    && 5 <= (ver = this.getVersion()) && ver < 7) {
                    hostElem = this.__docNode.compatMode === "CSS1Compat"
                        ? this.__docElem
                        : this.__bodyElem;
                }
                if (hostElem === null) throw Error();
                dx = elem.scrollLeft;
                dy = elem.scrollTop;
                assert(isFiniteDouble(dx) === isFiniteDouble(dy));
                if (!isFiniteDouble(dx)) {
                    throw Error();
                }
            }
            v.setX(v.getX() + s * dx);
            v.setY(v.getY() + s * dy);
            return v;
        }
    }, Object.create(HostUtilities_baseTypeProto));

    HostUtilities.fromHostContext = function (hostContext) {
        var hostContext_data, hostUtilities;
        if (!isHostContext(hostContext)) throw Error();
        hostContext_data = __HostObject_getData(hostContext);
        if (hostContext_data !== null) {
            hostUtilities = getOwnProperty(hostContext_data, "hostUtilities");
            if (hostUtilities !== undefined) return hostUtilities;
        }
        return new __HostUtilities(hostContext);
    };
    HostUtilities.fromHostElement = function (hostElement) {
        if (!isHostElement(hostElement)) throw Error();
        return __fromDocNode(hostElement.ownerDocument);
    };
    HostUtilities.fromDocNode = function (docNode) {
        if (!isHostDocNode(docNode)) throw Error();
        return __fromDocNode(docNode);
    };
    function __fromDocNode(docNode) {
        var docNode_data, hostUtilities;
        docNode_data = __HostObject_getData(docNode);
        if (docNode_data === null) throw Error(); // Not implemented.
        hostUtilities = getOwnProperty(docNode_data, "hostUtilities", null);
        if (hostUtilities === null) throw Error();  // Not implemented.
        return hostUtilities;
    }
    HostUtilities.fromHostObject = function (hostObject) {
        var docNode;
        if (isHostElement(hostObject)) docNode = hostObject.ownerDocument;
        else if (isHostDocNode(hostObject)) docNode = hostObject;
        else return HostUtilities.fromHostContext(hostObject);
        return __fromDocNode(docNode);
    };
    HostUtilities.__hostSpecificPropertyPrefixes = hostSpecificPropertyPrefixes;
    setOwnSrcPropsOnDst({
        HostUtilities: HostUtilities
    }, window);
})();