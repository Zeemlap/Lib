(function () {

    var hasOwnPropertyFunction = Object.prototype.hasOwnProperty;
    var __uiElementTree_findDeepestCommonAncestor = UIElement.__uiElementTree_findDeepestCommonAncestor;


    function RoutedEventArgs() {
        this.__source = null;
        this.__isHandled = false;
    }
    RoutedEventArgs.prototype = setOwnSrcPropsOnDst({
        constructor: RoutedEventArgs,
        getIsHandled: function () {
            return this.__isHandled;
        },
        getSource: function () {
            return this.__source;
        },
        setIsHandled: function (value) {
            if (typeof value !== "boolean") throw Error();
        }
    }, Object.create(EventArgs.prototype));
    function isRoutedEventArgs_nonDerived(eventArgs) {
        return eventArgs != null && eventArgs.constructor === RoutedEventArgs;
    }

    var RoutingTactic_direct = 0;
    var RoutingTactic_tunnel = 1;
    var RoutingTactic_bubble = 2;

    var RoutingTactic_toString = ["direct", "tunnel", "bubble"];
    
    var RoutingTactic_createParseTable = function () {
        var i, m;
        m = {};
        for (i = RoutingTactic_toString.length; 0 <= --i;) {
            m[RoutingTactic_toString[i]] = i;
        }
        return m;
    };
    var RoutingTactic_parse = RoutingTactic_createParseTable();

    function __RoutedEvent(target, routedEventClass, eventArgs) {
        __Event.call(this, target, routedEventClass, eventArgs);
    }
    function RoutedEvent() { throw Error(); }
    RoutedEvent.prototype = __RoutedEvent.prototype = setOwnSrcPropsOnDst({
        constructor: RoutedEvent,
        invokeHandlers: function (handlerCategory) {
            var uiElements, uiElement, i, iEnd, iChange;
            var eventHandlerList;
            var j, eventArgs;
            var routedEventClass;
            eventArgs = this.getArgs();
            routedEventClass = this.getEventClass();
            j = routedEventClass.__routingTactic_i;
            uiElement = this.getTarget();
            if (j === RoutingTactic_direct) {
                uiElements = [uiElement];
            } else {
                uiElements = uiElement.getUIElementTree_selfAndAncestors();
            }
            if (j === RoutingTactic_tunnel) {
                i = uiElements.length - 1;
                iEnd = iChange = -1;
            } else {
                i = 0;
                iEnd = uiElements.length;
                iChange = 1;
            }
            for (; i !== iEnd; i += iChange) {
                uiElement = uiElements[i];
                eventHandlerList = uiElement.__getEventHandlerListReversed(routedEventClass, handlerCategory);
                for (j = eventHandlerList.length; 0 <= --j;) {
                    eventHandlerList[j].invoke(uiElement, eventArgs);
                }
            }
        }
    }, Object.create(Event.prototype));


    function RoutedEventClass() { throw Error(); }
    function __RoutedEventClass(ownerTypeConstructor, name, isEventArgsValidFunction, eventQueueBehavior, routingTactic) {
        var i;
        i = getOwnProperty(RoutingTactic_parse, routingTactic);
        if (i === undefined) throw Error();
        this.__routingTactic_i = i;
        __EventClass.call(this, ownerTypeConstructor, name, isEventArgsValidFunction, eventQueueBehavior);
    }
    RoutedEventClass.prototype = __RoutedEventClass.prototype = setOwnSrcPropsOnDst({
        constructor: RoutedEventClass,
        isEventArgsValid: function (eventArgs) {
            var f, b;
            b = false;
            if (eventArgs instanceof RoutedEventArgs) {
                f = this.__isEventArgsValidFunction;
                b = f(eventArgs);
                if (typeof b !== "boolean") throw Error();
            }
            return b;
        },
        createInstance: function (objectWithEvents, eventArgs) {
            if (!(objectWithEvents instanceof UIElement)) throw Error();
            if (!this.isEventArgsValid(eventArgs)) throw Error();
            eventArgs.__source = objectWithEvents;
            return new __RoutedEvent(objectWithEvents, this, eventArgs);
        },
        getRoutingTactic: function () {
            return RoutingTactic_toString[this.__routingTactic_i];
        }
    }, Object.create(EventClass.prototype));
    var RoutedEventClass_registry_routedEventClassFromName = {};
    function RoutedEventClass_register(ownerTypeConstructor, name, isEventArgsValidFunction, eventQueueBehavior, routingTactic) {
        var i, routedEventClass;
        i = arguments.length;
        if (i < 3 || isEventArgsValidFunction === null) isEventArgsValidFunction = isRoutedEventArgs_nonDerived;
        if (i < 4 || eventQueueBehavior === null) eventQueueBehavior = EventQueueBehavior.DEFAULT;
        if (i < 5) routingTactic = "direct";
        routedEventClass = EventClass.__register(new __RoutedEventClass(ownerTypeConstructor, name, isEventArgsValidFunction, eventQueueBehavior, routingTactic));
        RoutedEventClass_registry_routedEventClassFromName[name] = routedEventClass;
        return routedEventClass;
    }
    function RoutedEventClass_fromName(name) {
        return getOwnProperty(RoutedEventClass_registry_routedEventClassFromName, name, null);
    }
    RoutedEventClass.register = RoutedEventClass_register;
    RoutedEventClass.fromName = RoutedEventClass_fromName;


    function MouseEventArgs(mouseDevice) {
        if (!(mouseDevice instanceof MouseDevice)) throw Error();
        this.__mouseDevice = mouseDevice;
    }
    MouseEventArgs.prototype = setOwnSrcPropsOnDst({
        constructor: MouseEventArgs,
        getButtonState: function (buttonId) {
            return this.getMouseDevice().getButtonState(buttonId);
        },
        getLeftButtonState: function () {
            return this.getMouseDevice().getLeftButtonState();
        },
        getMiddleButtonState: function () {
            return this.getMouseDevice().getMiddleButtonState();
        },
        getMouseDevice: function () {
            return this.__mouseDevice;
        },
        getPosition: function(uiElement) {
            return this.__mouseDevice.getPosition(uiElement);
        },
        getPosition_viewport: function () {
            return this.__mouseDevice.getPosition_viewport();
        },
        getRightButtonState: function () {
            return this.getMouseDevice().getRightButtonState();
        },
        getXButton1State: function () {
            return this.getMouseDevice().getXButton1State();
        },
        getXButton2State: function () {
            return this.getMouseDevice().getXButton2State();
        }
    }, Object.create(RoutedEventArgs.prototype));
    function MouseButtonEventArgs(mouseDevice, changedButtonId) {
        if (!isIntegralDouble(changedButtonId) || changedButtonId < 1) throw Error();
        this.__changedButtonId = changedButtonId;
        MouseEventArgs.call(this, mouseDevice);
    }
    MouseButtonEventArgs.prototype = setOwnSrcPropsOnDst({
        constructor: MouseButtonEventArgs,
        getChangedButton: function () {
            return this.__changedButtonId;
        },
        getButtonState: function (buttonId) {
            if (arguments.length < 1) {
                buttonId = this.__changedButtonId;
            }
            return MouseEventArgs.prototype.getButtonState.call(this, buttonId);
        }
    }, Object.create(MouseEventArgs.prototype));


    var MouseButtonState_unknown = 0;
    var MouseButtonState_pressed = 1;
    var MouseButtonState_released = 2;

    function MouseButtonState_isValid(value) {
        return value === MouseButtonState_unknown
            || value === MouseButtonState_pressed
            || value === MouseButtonState_released;
    }
    var MouseButtonState_sizeOf_base2 = 2;
    var MouseButtonState_toString = ["unknown", "pressed", "released"];

    var CaptureMode_none = 0;
    var CaptureMode_uiElement = 1;
    var CaptureMode_uiElementSubtree = 2;

    var CaptureMode_sizeOf_base2 = 2;
    var CaptureMode_parse = {
        "none": CaptureMode_none,
        "uiElement": CaptureMode_uiElement,
        "uiElementSubtree": CaptureMode_uiElementSubtree
    };
    var CaptureMode_toString = ["none", "uiElement", "uiElementSubtree"];


    var mouseDevice_packedData_buttonStateCount = 5;
    var mouseDevice_packedData_firstButtonState_offset = 0;
    var mouseDevice_packedData_buttonStates_mask = (1 << (mouseDevice_packedData_buttonStateCount * MouseButtonState_sizeOf_base2)) - 1;
    var mouseDevice_packedData_directlyOverUIElement_isChanging_mask = mouseDevice_packedData_buttonStates_mask + 1;
    var mouseDevice_packedData_captureMode_offset = log2FloorDouble(mouseDevice_packedData_directlyOverUIElement_isChanging_mask * 2);
    var mouseDevice_packedData_captureMode_mask = ((1 << CaptureMode_sizeOf_base2) - 1) << mouseDevice_packedData_captureMode_offset;
    assert(mouseDevice_packedData_captureMode_mask < 0x0002000);
    var mouseDevice_packedData_directlyOverUIElement_isDirty_mask = 0x0002000;

    function __mouseDevice_buttonIdToPropertyName(buttonId) {
        switch (buttonId) {
            case 1: return "leftButtonState";
            case 2: return "middleButtonState";
            case 3: return "rightButtonState";
            case 4: return "xButton1State";
            case 5: return "xButton2State";
        }
        if (!isIntegralDouble_nonNegative(buttonId) || buttonId === 0) throw Error();
        return "buttonState[" + buttonId + "]";
    }


    function MouseDevice() {
        throw Error();
    }
    var mouseDevice_nextId = 0;
    function __MouseDevice() {
        if (largestDecrementableIntegralDouble === mouseDevice_nextId) throw Error();
        this.__id = mouseDevice_nextId++;
        this.__directlyOverUIElement = null;
        this.__captureUIElement = null;
        this.__position_viewport = null;
        this.__mouseDevice_packedData = 0;
        this.__buttonStates = null;
        ObjectWithEvents.call(this);
    }
    function __mouseDevice_buildMouseEnterOrLeaveUIElemsWithCommonAncestor(i, uiElement, commonAncestorUIElement) {
        var a;
        a = new Array(i);
        while (true) {
            assert((i === 0) === (uiElement === commonAncestorUIElement));
            if (i === 0) break;
            a[--i] = uiElement;
            uiElement = uiElement.__uiElementTree_parent;
        }
        return a;
    }
    __MouseDevice.prototype = MouseDevice.prototype = Object.create(ObjectWithEvents.prototype);
    setOwnSrcPropsOnDst({
        constructor: MouseDevice,
        __captureUIElement_propertyChanged: function (sender, e) {
            assert(this.__captureUIElement === sender);
            if (e.getPropertyName() === "visibility_effective") {
                assert(sender.getVisibility_effective() !== "visible");
                this.setCaptureUIElement(null);
            }
        },
        __directlyOverUIElement_propertyChanged: function (sender, e) {
            assert(this.__directlyOverUIElement === sender);
            if (e.getPropertyName() === "visibility_effective") {
                this.__setDirectlyOverUIElement_isDirty(true);
            }
        },

        getButtonState: function (buttonId) {
            return MouseButtonState_toString[this.__getButtonState(buttonId)];
        },
        __getButtonState: function (buttonId) {
            var i, buttonState_mask, buttonStates;
            if (!isIntegralDouble(buttonId) || buttonId < 1) throw Error();
            if (buttonId <= mouseDevice_packedData_buttonStateCount) {
                i = (buttonId - 1) * MouseButtonState_sizeOf_base2;
                buttonState_mask = ((1 << MouseButtonState_sizeOf_base2) - 1) << i;
                return (this.__mouseDevice_packedData & buttonState_mask) >> i;
            }
            buttonStates = this.__buttonStates;
            if (buttonStates === null || !hasOwnPropertyFunction.call(buttonStates, buttonId)) return MouseButtonState_unknown;
            return buttonStates[buttonId];
        },
        getCaptureMode: function () {
            return CaptureMode_toString[this.__getCaptureMode()];
        },
        __getCaptureMode: function () {
            return (this.__mouseDevice_packedData & mouseDevice_packedData_captureMode_mask) >> mouseDevice_packedData_captureMode_offset;
        },
        getCaptureUIElement: function () {
            return this.__captureUIElement;
        },
        getDirectlyOverUIElement: function () {
            if (!this.__getDirectlyOverUIElement_isDirty()) return this.__directlyOverUIElement;
            pos_vp = this.getPosition_viewport();
            value = pos_vp === null
                ? null
                : this._getTopMostUIElementContainingPoint_viewport(pos_vp);
            this.setDirectlyOverUIElement(value);
            return this.__directlyOverUIElement;
        },
        __getDirectlyOverUIElement_isChanging: function () {
            return (this.__mouseDevice_packedData & mouseDevice_packedData_directlyOverUIElement_isChanging_mask) !== 0;
        },
        __getDirectlyOverUIElement_isDirty: function () {
            return (this.__mouseDevice_packedData & mouseDevice_packedData_directlyOverUIElement_isDirty_mask) !== 0;
        },
        getId: function () {
            return this.__id;
        },
        __getIsAnyButtonPressed: function () {
            var i, packedData, buttonStates, buttonState_i_mask;

            assert(mouseDevice_packedData_firstButtonState_offset + (MouseButtonState_sizeOf_base2 * mouseDevice_packedData_buttonStateCount) - 1 <= 31);
            buttonState_i_mask = (1 << MouseButtonState_sizeOf_base2) - 1 + mouseDevice_packedData_firstButtonState_offset;
            i = buttonState_i_mask << (MouseButtonState_sizeOf_base2 * mouseDevice_packedData_buttonStateCount);
            if (0 < mouseDevice_packedData_buttonStateCount) {
                packedData = this.__mouseDevice_packedData;
                while (true) {
                    if ((packedData & buttonState_i_mask) === MouseButtonState_pressed) {
                        return true;
                    }
                    buttonState_i_mask <<= MouseButtonState_sizeOf_base2;
                    if (i <= buttonState_i_mask) {
                        break;
                    }
                }
            }
            buttonStates = this.__buttonStates;
            if (buttonStates !== null) {
                for (i in buttonStates) {
                    if (!hasOwnPropertyFunction.call(buttonStates, i)) break;
                    if (buttonStates[i] === MouseButtonState_pressed) {
                        return true;
                    }
                }
            }
            return false;
        },
        getIsCaptureNotKnownByScriptEnvironment: function () {
            return false;
        },
        __getIsPosition_viewportNonNull: function () {
            return this.__position_viewport !== null;
        },
        getLeftButtonState: function () {
            return this.getButtonState(1);
        },
        getMiddleButtonState: function () {
            return this.getButtonState(2);
        },
        // Get's the mouse position (in viewport client coordinates) as a Vector2 that 
        // was last observed while the mouse position is observable. 
        // If the mouse position is not observable, a tactic to retrieve it is not implemented or 
        // is set to null through setPosition_viewport(null) then
        // this value is null.
        getPosition_viewport: function () {
            var p1;
            p1 = this.__position_viewport;
            if (p1 === null) return null;
            return p1.clone();
        },
        getPosition: function (uiElement) {
            var p1, r1;
            if (!(uiElement instanceof UIElement)) throw Error();
            p1 = this.__position_viewport;
            if (p1 === null) return null;
            r1 = this._getUIElementBoundingRect_viewport(uiElement);
            r1.subtractAssign(p1);
            return r1.getTopLeft();
        },
        getRightButtonState: function () {
            return this.getButtonState(3);
        },
        _getTopMostUIElementContainingPoint_viewport: function (v) {
            throw Error();
        },
        _getUIElementBoundingRect_viewport: function (uiElement) {
            throw Error();
        },
        getXButton1State: function () {
            return this.getButtonState(4);
        },
        getXButton2State: function () {
            return this.getButtonState(5);
        },
        __setIsDirectlyOverUIElement_isValid: function (value) {
            if (!(value instanceof UIElement)) throw Error();
            return true;
        },

        __onCaptureUIElementChanged: function (oldValue) {
            var newValue, i, deepestCommonAncestorOfOldNewValues;
            var uiElement, uiElements, j, n;
            newValue = this.__captureUIElement;
            deepestCommonAncestorOfOldNewValues = null;
            if (oldValue !== null) {
                oldValue.__removeEventHandler("propertyChanged", this.__captureUIElement_propertyChanged, this);
                i = oldValue.__getHasMouseCapture_cache();
                oldValue.__setHasMouseCapture_device(this, false);
                oldValue.raiseEvent("propertyChanged", new PropertyChangedEventArgs("hasMouseCapture[" + this.getId() + "]", true, false));
                if (i !== oldValue.__getHasMouseCapture_computed()) {
                    assert(i);
                    oldValue.__setHasMouseCapture_cache(false);
                    oldValue.raiseEvent("propertyChanged", new PropertyChangedEventArgs("hasMouseCapture", true, false));
                }
                if (newValue !== null) {
                    if (oldValue.__uiElementTree_root !== newValue.__uiElementTree_root) throw Error();
                    deepestCommonAncestorOfOldNewValues = __uiElementTree_findDeepestCommonAncestor(oldValue, newValue);
                }
            }
            for (uiElement = oldValue; uiElement !== deepestCommonAncestorOfOldNewValues; uiElement = uiElement.__uiElementTree_parent) {
                i = uiElement.__getIsMouseCaptureWithin_cache();
                uiElement.__setIsMouseCaptureWithin_device(this, false);
                uiElement.raiseEvent("propertyChanged", new PropertyChangedEventArgs("isMouseCaptureWithin[" + this.getId() + "]", true, false));
                if (i !== uiElement.__getIsMouseCaptureWithin_computed()) {
                    assert(i);
                    uiElement.__setIsMouseCaptureWithin_cache(false);
                    uiElement.raiseEvent("propertyChanged", new PropertyChangedEventArgs("isMouseCaptureWithin", true, false));
                }
            }
            if (newValue !== null) {
                if (deepestCommonAncestorOfOldNewValues === null) {
                    uiElements = newValue.getUIElementTree_selfAndAncestors();
                    i = 0;
                } else {
                    uiElement = newValue;
                    i = uiElement.getUIElementTree_depth() - deepestCommonAncestorOfOldNewValues.getUIElementTree_depth();
                    uiElements = new Array(i);
                    while (0 <= --i) {
                        uiElements[i] = uiElement;
                        uiElement = uiElement.__uiElementTree_parent;
                    }
                    assert(uiElement.__uiElementTree_parent === deepestCommonAncestorOfOldNewValues);
                }
                n = uiElements.length;
                for (i = 0; i < n; i++) {
                    uiElement = uiElements[i];
                    j = uiElement.__getIsMouseCaptureWithin_cache();
                    uiElement.__setIsMouseCaptureWithin_device(this, true);
                    uiElement.raiseEvent("propertyChanged", new PropertyChangedEventArgs("isMouseCaptureWithin[" + this.getId() + "]", false, true));
                    if (j !== uiElement.__getIsMouseCaptureWithin_computed()) {
                        assert(!j);
                        uiElement.__setIsMouseCaptureWithin_cache(true);
                        uiElement.raiseEvent("propertyChanged", new PropertyChangedEventArgs("isMouseCaptureWithin", false, true));
                    }
                }


                newValue.__addEventHandler("propertyChanged", this.__captureUIElement_propertyChanged, this);
                i = newValue.__getHasMouseCapture_cache();
                newValue.__setHasMouseCapture_device(this, true);
                newValue.raiseEvent("propertyChanged", new PropertyChangedEventArgs("hasMouseCapture[" + this.getId() + "]", false, true));
                if (i !== newValue.__getHasMouseCapture_computed()) {
                    assert(!i);
                    newValue.__setHasMouseCapture_cache(true);
                    newValue.raiseEvent("propertyChanged", new PropertyChangedEventArgs("hasMouseCapture", false, true));
                }
            }
            if (oldValue !== null) {
                oldValue.raiseEvent("lostMouseCapture", new MouseEventArgs(this));
            }
            if (newValue !== null) {
                newValue.raiseEvent("gotMouseCapture", new MouseEventArgs(this));
            }
            var directlyOverUIElement_old = this.getDirectlyOverUIElement();
            if (directlyOverUIElement_old !== null
                && newValue !== null
                && this.__getCaptureMode() === CaptureMode_uiElementSubtree
                && newValue.uiElementTree_isAncestorOf(directlyOverUIElement_old)) {
                return;
            }
            if (newValue !== null) {
                this.setDirectlyOverUIElement(newValue);
            } else {
                this.__setDirectlyOverUIElement_isDirty(true);
            }
        },
        __onDirectlyOverUIElementChanged: function (oldValue) {
            try {
                this.__setDirectlyOverUIElement_isChanging(true);
                var newValue = this.__directlyOverUIElement;

                // The old value may not have a root with respect to the UI element tree,
                // because updating the directly over UI element can be A CONSEQUENCE of removing a UI element from the UI element tree.
                assert(newValue === null || newValue.__uiElement_root !== null);
                var mouseLeaveUIElems;
                var mouseEnterUIElems;
                var i, n, uiElement1, f;
                if (oldValue !== null && newValue !== null) {
                    if (oldValue.__uiElement_root !== null) {
                        if (oldValue.__uiElement_root !== newValue.__uiElement_root) throw Error(); // This case is not implemented and should rarely occur (perhaps in situations where different frames interact).
                        uiElement1 = __uiElementTree_findDeepestCommonAncestor(oldValue, newValue);
                        i = uiElement1.getUIElementTree_depth();
                        mouseLeaveUIElems = __mouseDevice_buildMouseEnterOrLeaveUIElemsWithCommonAncestor(
                            oldValue.getUIElementTree_depth() - i,
                            oldValue,
                            uiElement1);
                        mouseEnterUIElems = __mouseDevice_buildMouseEnterOrLeaveUIElemsWithCommonAncestor(
                            newValue.getUIElementTree_depth() - i,
                            newValue,
                            uiElement1);
                    } else {
                        mouseLeaveUIElems = oldValue.getUIElementTree_selfAndAncestors();
                    }
                } else {
                    if (oldValue !== null) {
                        mouseLeaveUIElems = oldValue.getUIElementTree_selfAndAncestors();
                        mouseEnterUIElems = [];
                    } else {
                        mouseLeaveUIElems = [];
                        mouseEnterUIElems = newValue.getUIElementTree_selfAndAncestors();
                    }
                }
                if (oldValue !== null) {

                    oldValue.__removeEventHandler("propertyChanged", this.__directlyOverUIElement_propertyChanged, this);

                    f = oldValue.__getIsMouseDirectlyOver_cache();
                    oldValue.__setIsMouseDirectlyOver_device(this, false);
                    oldValue.raiseEvent("propertyChanged", new PropertyChangedEventArgs("isMouseDirectlyOver[" + this.__id + "]", true, false));
                    if (f !== oldValue.__getIsMouseDirectlyOver_computed()) {
                        assert(f);
                        oldValue.__setIsMouseDirectlyOver_cache(false);
                        oldValue.raiseEvent("propertyChanged", new PropertyChangedEventArgs("isMouseDirectlyOver", true, false));
                    }
                }
                n = mouseLeaveUIElems.length;
                for (i = 0; i < n; i++) {
                    uiElement1 = mouseLeaveUIElems[i];
                    f = uiElement1.__getIsMouseOver_cache();
                    uiElement1.__setIsMouseOver_device(this, false);
                    uiElement1.raiseEvent("propertyChanged", new PropertyChangedEventArgs("isMouseOver[" + this.__id + "]", true, false));
                    if (f !== uiElement1.__getIsMouseOver_computed()) {
                        assert(f);
                        uiElement1.__setIsMouseOver_cache(false);
                        uiElement1.raiseEvent("propertyChanged", new PropertyChangedEventArgs("isMouseOver", true, false));
                    }
                }
                i = mouseEnterUIElems.length;
                while (0 <= --i) {
                    uiElement1 = mouseEnterUIElems[i];
                    f = uiElement1.__getIsMouseOver_cache();
                    uiElement1.__setIsMouseOver_device(this, true);
                    uiElement1.raiseEvent("propertyChanged", new PropertyChangedEventArgs("isMouseOver[" + this.__id + "]", false, true));
                    if (f !== uiElement1.__getIsMouseOver_computed()) {
                        assert(!f);
                        uiElement1.__setIsMouseOver_cache(true);
                        uiElement1.raiseEvent("propertyChanged", new PropertyChangedEventArgs("isMouseOver", false, true));
                    }
                }
                if (newValue !== null) {
                    newValue.__addEventHandler("propertyChanged", this.__directlyOverUIElement_propertyChanged, this, true);
                    f = newValue.__getIsMouseDirectlyOver_cache();
                    newValue.__setIsMouseDirectlyOver_device(this, true);
                    newValue.raiseEvent("propertyChanged", new PropertyChangedEventArgs("isMouseDirectlyOver[" + this.__id + "]", false, true));
                    if (f !== newValue.__getIsMouseDirectlyOver_computed()) {
                        assert(!f);
                        newValue.__setIsMouseDirectlyOver_cache(true);
                        newValue.raiseEvent("propertyChanged", new PropertyChangedEventArgs("isMouseDirectlyOver", false, true));
                    }
                }
            } finally {
                this.__setDirectlyOverUIElement_isChanging(false);
            }
        },
        __onPropertyChanged: function (e) {
            if (!(e instanceof PropertyChangedEventArgs)) throw Error();
            switch (e.getPropertyName()) {
                case "captureUIElement":
                    this.__onCaptureUIElementChanged(e.__getOldValue());
                    break;
                case "directlyOverUIElement":
                    this.__onDirectlyOverUIElementChanged(e.__getOldValue());
                    break;
            }
        },
        __setButtonState: function (buttonId, value) {
            var i, buttonState_mask, buttonStates;
            var oldValue;
            if (!isIntegralDouble(buttonId) || buttonId < 1) throw Error();
            if (!MouseButtonState_isValid(value)) throw Error();
            if (buttonId <= mouseDevice_packedData_buttonStateCount) {
                i = (buttonId - 1) * MouseButtonState_sizeOf_base2;
                buttonState_mask = ((1 << MouseButtonState_sizeOf_base2) - 1) << i;
                oldValue = (this.__mouseDevice_packedData & buttonState_mask) >> i;
                if (oldValue === value) return;
                this.__mouseDevice_packedData = (this.__mouseDevice_packedData & ~buttonState_mask) | (value << i);
            } else {
                buttonStates = this.__buttonStates;
                oldValue = MouseButtonState_unknown;
                if (buttonStates !== null && hasOwnPropertyFunction.call(buttonStates, buttonId)) {
                    oldValue = buttonStates[buttonId];
                }
                if (oldValue === value) return;
                if (buttonStates === null) buttonStates = this.__buttonStates = {};
                buttonStates[buttonId] = value;
            }
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs(
                __mouseDevice_buttonIdToPropertyName(buttonId),
                MouseButtonState_toString[oldValue],
                MouseButtonState_toString[value]));
            return oldValue;
        },
        __setButtonStatesToUnknown: function () {
            var buttonId;
            var buttonIdString, buttonStates;
            for (buttonId = 1; buttonId <= mouseDevice_packedData_buttonStateCount; buttonId++) {
                this.__setButtonState(buttonId, MouseButtonState_unknown);
            }
            buttonStates = this.__buttonStates;
            if (buttonStates === null) return;
            for (buttonIdString in buttonStates) {
                if (!hasOwnPropertyFunction.call(buttonStates, buttonIdString)) break;
                this.__setButtonState(Number(buttonIdString), MouseButtonState_unknown);
            }
        },
        __setCaptureMode: function (value) {
            this.__mouseDevice_packedData =
                (this.__mouseDevice_packedData & ~mouseDevice_packedData_captureMode_mask)
                | (value << mouseDevice_packedData_captureMode_offset);
        },
        setCaptureUIElement: function (value, captureMode) {
            var captureMode_i;
            if (value !== null && (!(value instanceof UIElement) || value.getVisibility_effective() !== "visible")) throw Error();
            if (arguments.length < 2) {
                if (value === null) captureMode = "none";
                else captureMode = "uiElement";
            } else {
                switch (captureMode) {
                    case "none":
                        if (value !== null) throw Error();
                        break;
                    case "uiElement":
                    case "uiElementSubtree":
                        if (value === null) throw Error();
                        break;
                    default:
                        throw Error();
                }
            }
            captureMode_i = CaptureMode_parse[captureMode];
            assert(hasOwnProperty(CaptureMode_parse, captureMode));
            this.__setCaptureMode(captureMode_i);
            if (this.__captureUIElement === value) return;
            // All we need to do is update the directly over UI element.
            // We want to set the directly over UI element to value, unless captureMode is uiElementSubtree and 
            // this.__directlyOverUIElement is a descendant of value.
            var oldValue = this.__captureUIElement;
            this.__captureUIElement = value;
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("captureUIElement", oldValue, value));
        },
        setDirectlyOverUIElement: function (value) {
            var oldValue;
            if (this.__getDirectlyOverUIElement_isChanging()) {
                // Reentrancy is not possible. Note that this does not mean that no isMouseOver isMouseDirectlyChanged property changed event handlers can 
                // call setDirectlyOverUIElement. Specifically user event handlers can do this because their execution is delayed.
                throw Error();
            }
            oldValue = this.__directlyOverUIElement;
            if (value === oldValue) return;
            if (value !== null) {
                if (!(value instanceof UIElement) || value.getVisibility_effective() !== "visible") throw Error();
                if (!this.__setDirectlyOverUIElement_validateValue(value)) throw Error();
            }
            this.__directlyOverUIElement = value;
            this.__setDirectlyOverUIElement_isDirty(false);
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("directlyOverUIElement", oldValue, value));
        },
        __setDirectlyOverUIElement_isChanging: function (value) {
            if (typeof value !== "boolean") throw Error();
            this.__mouseDevice_packedData = value
                ? (this.__mouseDevice_packedData | mouseDevice_packedData_directlyOverUIElement_isChanging_mask)
                : (this.__mouseDevice_packedData & ~mouseDevice_packedData_directlyOverUIElement_isChanging_mask);
        },
        __setDirectlyOverUIElement_isDirty: function (value) {
            if (typeof value !== "boolean") throw Error();
            this.__mouseDevice_packedData = value
                ? (this.__mouseDevice_packedData | mouseDevice_packedData_directlyOverUIElement_isDirty_mask)
                : (this.__mouseDevice_packedData & ~mouseDevice_packedData_directlyOverUIElement_isDirty_mask);
        },
        setPosition_viewport: function (value) {
            var oldValue, value_clone1, value_clone2;
            if (!(value === null || value instanceof Vector2)) throw Error();
            oldValue = this.__position_viewport;
            if (value === null) {
                if (oldValue === null) return;
                value_clone1 = null;
                value_clone2 = null;
            } else {
                if (value.equals(oldValue)) return;
                value_clone1 = value.clone();
                value_clone2 = value.clone();
            }
            this.__position_viewport = value_clone1;
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("position_viewport", oldValue, value_clone2));
        }
    }, __MouseDevice.prototype);



    var mouseDevice_primary = null;
    MouseDevice.getPrimary = function () {
        return mouseDevice_primary;
    };
    MouseDevice.forAllEnabled_validateDirectlyOverUIElement = function () {
        if (mouseDevice_primary === null) return;
        mouseDevice_primary.getDirectlyOverUIElement();
    };
    MouseDevice.__setPrimary = function (value) {
        if (!(value instanceof MouseDevice)) throw Error();
        mouseDevice_primary = value;
    };


    function Command() { }
    Command.prototype = setOwnSrcPropsOnDst({
        constructor: Command,
        execute: function (parameter) {
            throw Error();
        },
        getCanExecute: function (parameter) {
            throw Error();
        }
    }, Object.create(ObjectWithEvents.prototype));


    function isMouseButtonEventArgs(eventArgs) {
        return eventArgs instanceof MouseButtonEventArgs;
    }
    function isMouseEventArgs(eventArgs) {
        return eventArgs instanceof MouseEventArgs;
    }

    RoutedEventClass.register(UIElement, "click", null, null, "bubble");
    RoutedEventClass.register(UIElement, "gotMouseCapture", isMouseEventArgs, null, "bubble");
    RoutedEventClass.register(UIElement, "lostMouseCapture", isMouseEventArgs, null, "bubble");
    RoutedEventClass.register(UIElement, "mouseDown", isMouseButtonEventArgs, null, "bubble");
    RoutedEventClass.register(UIElement, "mouseMove", isMouseEventArgs, null, "bubble");
    RoutedEventClass.register(UIElement, "mouseUp", isMouseButtonEventArgs, null, "bubble");
    RoutedEventClass.register(UIElement, "previewMouseDown", isMouseButtonEventArgs, null, "tunnel");
    RoutedEventClass.register(UIElement, "previewMouseDownOutsideCaptureUIElement", isMouseButtonEventArgs, null, "tunnel");
    RoutedEventClass.register(UIElement, "previewMouseMove", isMouseEventArgs, null, "tunnel");
    RoutedEventClass.register(UIElement, "previewMouseUp", isMouseButtonEventArgs, null, "tunnel");
    RoutedEventClass.register(UIElement, "previewMouseUpOutsideCaptureUIElement", isMouseButtonEventArgs, null, "tunnel");

    setOwnSrcPropsOnDst({
        __CaptureMode_none: CaptureMode_none,
        __CaptureMode_uiElement: CaptureMode_uiElement,
        __CaptureMode_uiElementSubtree: CaptureMode_uiElementSubtree,
        Command: Command,
        __MouseButtonState_unknown: MouseButtonState_unknown,
        __MouseButtonState_pressed: MouseButtonState_pressed,
        __MouseButtonState_released: MouseButtonState_released,
        MouseButtonEventArgs: MouseButtonEventArgs,
        MouseDevice: MouseDevice,
        __MouseDevice: __MouseDevice,
        MouseEventArgs: MouseEventArgs,
        RoutedEvent: RoutedEvent,          
        RoutedEventArgs: RoutedEventArgs,
        RoutedEventClass: RoutedEventClass
    }, window);
})();