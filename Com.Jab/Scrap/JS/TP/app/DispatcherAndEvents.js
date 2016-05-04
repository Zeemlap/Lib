(function () {

    var array_prototype_slice = Array.prototype.slice;
    var __array_empty = [];
    var hasOwnPropertyFunction = Object.prototype.hasOwnProperty;
    var largestDecrementableIntegralDouble = window.largestDecrementableIntegralDouble;
    var undefined;
    var positiveInfinityDouble = 1 / 0;
    var NullDisposable_instance = NullDisposable.getInstance();

    function __DispatcherOperation(dispatcher, func, thisp, argArr) {
        this.__dispatcher = dispatcher;
        this.__func = func;
        this.__thisp = thisp;
        this.__argArr = argArr;
    }
    function DispatcherOperation() { throw Error(); }
    DispatcherOperation.prototype = __DispatcherOperation.prototype = {
        constructor: DispatcherOperation,
        
        dispose: function () { },
        getDispatcher: function () {
            return this.__dispatcher;
        },
        __run: function () {
            return this.__func.apply(this.__thisp, this.__argArr);
        }
    };

    function __DispatcherOperationSetTimeout(dispatcher, func, thisp, argArr) {
        __DispatcherOperation.call(this, dispatcher, func, thisp, argArr);
        this.__timeoutId = null;
    }
    function DispatcherOperationSetTimeout() { throw Error(); }
    DispatcherOperationSetTimeout.prototype = __DispatcherOperationSetTimeout.prototype = setOwnSrcPropsOnDst({
        constructor: DispatcherOperationSetTimeout,
        dispose: function () {
            if (this.__timeoutId !== null) {
                clearTimeout(this.__timeoutId);
                this.__timeoutId = null;
            }
        }
    }, Object.create(DispatcherOperation.prototype));
  
    function __DispatcherOperationAnimationFrame(dispatcher, func, thisp, argArr) {
        __DispatcherOperation.call(this, dispatcher, func, thisp, argArr);
        this.__animationFrameRequestId = null;
    }
    function DispatcherOperationAnimationFrame() { throw Error(); }
    DispatcherOperationAnimationFrame.prototype = __DispatcherOperationAnimationFrame.prototype = setOwnSrcPropsOnDst({
        constructor: DispatcherOperationAnimationFrame,
        dispose: function () {
            if (this.__animationFrameRequestId !== null) {
                this.getDispatcher().__hostUtilities.removeAnimationFrameRequest(this.__animationFrameRequestId);
                this.__animationFrameRequestId = null;
            }
        }
    }, Object.create(DispatcherOperation.prototype));

    function __DispatcherOperationRunAfterAllEvents(dispatcher, func, thisp, argArr) {
        __DispatcherOperation.call(this, dispatcher, func, thisp, argArr);
        this.__prevRunAfterAllEventsOp = null;
        this.__nextRunAfterAllEventsOp = null;
        this.__ownerRunAfterAllEventsQueue = null;
    }
    function DispatcherOperationRunAfterAllEvents() { throw Error(); }
    DispatcherOperationRunAfterAllEvents.prototype = __DispatcherOperationRunAfterAllEvents.prototype = setOwnSrcPropsOnDst({
        constructor: DispatcherOperationRunAfterAllEvents,
        dispose: function () {
            this.getDispatcher().__runAfterAllEventsOperations_dequeue(this);
        }
    }, Object.create(DispatcherOperation.prototype));

    function IDistpacherOperationRaiseEvent() { throw Error(); }
    function __IDistpacherOperationRaiseEvent(dispatcher, event) {
        this.__dispatcher = dispatcher;
        this.__event = event;
    }
    IDistpacherOperationRaiseEvent.prototype = __IDistpacherOperationRaiseEvent.prototype = {
        constructor: IDistpacherOperationRaiseEvent,
        __run: function () {
            var event;
            event = this.__event;
            event.getEventClass().getEventQueueBehavior().enqueue(
                this.__dispatcher.__eventQueue,
                event);
            event.invokeHandlers(__EventHandlerCategory_INTERNAL);
        }
    };

    function Dispatcher() {
        throw Error();
    }
    function __Dispatcher() {
        this.__hostUtilities = HostUtilities.fromHostContext(window);
        this.__isRunningOperationHooked = false;
        this.__eventQueue = new __EventQueue();
        this.__runAfterAllEventsOperations_first = null;
        this.__runAfterAllEventsOperations_last = null;
    }
    Dispatcher.prototype = __Dispatcher.prototype = {
        constructor: Dispatcher,

        __getIsRunningOperationHooked: function() {
            return this.__isRunningOperationHooked;
        },
        
        __raiseEvent: function (event) {
            if (this.__isRunningOperationHooked) {
                event.getEventClass().getEventQueueBehavior().enqueue(this.__eventQueue, event);
                event.invokeHandlers(__EventHandlerCategory_INTERNAL);
                return;
            }
            this.__runIOperationHooked(new __IDistpacherOperationRaiseEvent(this, event));
        },
        
        // Returns null if func was called within this function.
        runAfterAllEvents: function (func, thisp, argArr) {
            var argN, runAfterAllEventsOp;
            if (!isFunction(func)) throw Error();
            argN = arguments.length;
            if (this.__isRunningOperationHooked) {
                if (argN < 3) {
                    argArr = __array_empty;
                } else {
                    if (!isArrayLike(argArr)) throw Error();
                    argArr = array_prototype_slice.call(argArr);
                }
                runAfterAllEventsOp = new __DispatcherOperationRunAfterAllEvents(this, func, thisp, argArr);
                this.__runAfterAllEventsOperations_enqueue(runAfterAllEventsOp);
                return runAfterAllEventsOp;
            }
            if (argN < 3) {
                func.call(thisp);
            } else {
                if (!isArrayLike(argArr)) throw Error();
                func.apply(thisp, argArr);
            }
            return null;
        },

        __runAfterAllEventsOperations_enqueue: function (runAfterAllEventsOp) {
            if (!(runAfterAllEventsOp instanceof __DispatcherOperationRunAfterAllEvents) || runAfterAllEventsOp.__ownerRunAfterAllEventsQueue !== null) throw Error();
            assert((this.__runAfterAllEventsOperations_first === null) === (this.__runAfterAllEventsOperations_last === null));
            if (this.__runAfterAllEventsOperations_first === null) {
                this.__runAfterAllEventsOperations_first = runAfterAllEventsOp;
            } else {
                (runAfterAllEventsOp.__prevRunAfterAllEventsOp = this.__runAfterAllEventsOperations_last).__nextRunAfterAllEventsOp = runAfterAllEventsOp;
            }
            this.__runAfterAllEventsOperations_last = runAfterAllEventsOp;
            runAfterAllEventsOp.__ownerRunAfterAllEventsQueue = this;
        },

        __runAfterAllEventsOperations_remove: function (runAfterAllEventsOp) {
            if (!(runAfterAllEventsOp instanceof __DispatcherOperationRunAfterAllEvents)) throw Error();
            if (runAfterAllEventsOp.__ownerRunAfterAllEventsQueue !== this) return;
            if (this.__runAfterAllEventsOperations_first === runAfterAllEventsOp) {
                this.__runAfterAllEventsOperations_first = runAfterAllEventsOp.__nextRunAfterAllEventsOp;
            } else {
                runAfterAllEventsOp.__prevRunAfterAllEventsOp.__nextRunAfterAllEventsOp = runAfterAllEventsOp.__nextRunAfterAllEventsOp;
            }
            if (this.__runAfterAllEventsOperations_last === runAfterAllEventsOp) {
                this.__runAfterAllEventsOperations_last = runAfterAllEventsOp.__prevRunAfterAllEventsOp;
            } else {
                runAfterAllEventsOp.__nextRunAfterAllEventsOp.__prevRunAfterAllEventsOp = runAfterAllEventsOp.__prevRunAfterAllEventsOp;
            }
            runAfterAllEventsOp.__ownerRunAfterAllEventsQueue = null;
        },

        runWithinAnimationFrame: function (func, thisp, argArr) {
            var argN, dispatcherOp;
            if (!isFunction(func)) throw Error();
            argN = arguments.length;
            if (3 <= argN) {
                if (!isArrayLike(argArr)) throw Error();
                argArr = array_prototype_slice.call(argArr);
            } else {
                argArr = __array_empty;
            }
            dispatcherOp = new __DispatcherOperationAnimationFrame(this, func, thisp, argArr);
            dispatcherOp.__animationFrameRequestId = this.__hostUtilities.addAnimationFrameRequest(this.__runIOperationHooked.bind(this, dispatcherOp));
            return dispatcherOp;
        },

        runAtMillisecondsRelativeToNow: function (milliseconds, func, thisp, argArr) {
            var argN, dispatcherOp;
            if (typeof milliseconds !== "number" || !(0 <= milliseconds)) throw Error();
            if (!isFunction(func)) throw Error();
            argN = arguments.length;
            if (argN < 4) argArr = __array_empty;
            else {
                if (!isArrayLike(argArr)) throw Error();
                argArr = array_prototype_slice.call(argArr);
            }
            if (positiveInfinityDouble === milliseconds) return NullDisposable_instance;
            dispatcherOp = new __DispatcherOperationSetTimeout(this, func, thisp, argArr);
            dispatcherOp.__timeoutId = setTimeout(this.__runIOperationHooked.bind(this, dispatcherOp), bankersRoundingDouble(milliseconds));
            return dispatcherOp;
        },

        __runIOperationHooked: function (iDispatcherOp) {
            var error;
            var error_isSet;
            var eventQueue, event;
            var i;
            var runAfterAllEventsOp;
            error_isSet = false;
            try {
                this.__isRunningOperationHooked = true;
                iDispatcherOp.__run();
                eventQueue = this.__eventQueue;
                outer: while(true) {
                    while ((event = eventQueue.dequeue()) !== null) {
                        eventQueue.__setInsertBefore(eventQueue.peek());
                        event.invokeHandlers(__EventHandlerCategory_USER);
                    }
                    runAfterAllEventsOp = this.__runAfterAllEventsOperations_first;
                    if (runAfterAllEventsOp !== null) {
                        do {
                            this.__runAfterAllEventsOperations_remove(runAfterAllEventsOp);
                            runAfterAllEventsOp.__run();
                            if (!eventQueue.getIsEmpty()) {
                                continue outer;
                            }
                        } while ((runAfterAllEventsOp = this.__runAfterAllEventsOperations_first) !== null);
                    }
                    break;
                }
            } catch (e) {
                error = e;
                error_isSet = true;
            } finally {
                this.__isRunningOperationHooked = false;
            }

            this.__eventQueue.__clear();
            ObjectWithEvents_idRecyclingBin.push.apply(ObjectWithEvents_idRecyclingBin, ObjectWithEvents_idsOfDisposedInstances);
            ObjectWithEvents_idsOfDisposedInstances.length = 0;
            for (i = EventClass_registry_uniqueEventQueueBehaviors.length; 0 <= --i;) {
                EventClass_registry_uniqueEventQueueBehaviors[i].resetData();
            }
            if (error_isSet) {
                throw error;
            }
        }
    };

    var Dispatcher_instance = null;
    Dispatcher.getInstance = function () {
        if (Dispatcher_instance === null) {
            Dispatcher_instance = new __Dispatcher;
        }
        return Dispatcher_instance;
    };

    setOwnSrcPropsOnDst({
        Dispatcher: Dispatcher
    }, window);



    function EventArgs() { }
    EventArgs.prototype = {
        constructor: EventArgs
    };
    var EventArgs_empty = new EventArgs();
    EventArgs.getEmpty = function () {
        return EventArgs_empty;
    };
    function isEventArgs_nonDerived(eventArgs) {
        return eventArgs != null && eventArgs.constructor === EventArgs;
    }

    function __EventHandlerCategory() { }
    function EventHandlerCategory() { throw Error(); }
    __EventHandlerCategory.prototype = EventHandlerCategory.prototype = {
        constructor: EventHandlerCategory,
        __getLastEventHandlerFromEventClassNameMap: function (objectWithEvents) { throw Error(); },
        getInstanceEventHandlerMethodNamePrefix: function () { throw Error(); }
    };

    function __InternalEventHandlerCategory() { }
    function InternalEventHandlerCategory() { throw Error(); }
    __InternalEventHandlerCategory.prototype = InternalEventHandlerCategory.prototype = setOwnSrcPropsOnDst({
        constructor: InternalEventHandlerCategory,
        __getLastEventHandlerFromEventClassNameMap: function (objectWithEvents) {
            return objectWithEvents.__objectWithEvents_lastInternalEventHandlerFromEventClassName;
        },
        getInstanceEventHandlerMethodNamePrefix: function () {
            return "__on";
        }
    }, Object.create(__EventHandlerCategory.prototype));

    function __UserEventHandlerCategory() { }
    function UserEventHandlerCategory() { throw Error(); }
    __UserEventHandlerCategory.prototype = UserEventHandlerCategory.prototype = setOwnSrcPropsOnDst({
        constructor: UserEventHandlerCategory,
        __getLastEventHandlerFromEventClassNameMap: function (objectWithEvents) {
            return objectWithEvents.__objectWithEvents_lastUserEventHandlerFromEventClassName;
        },
        getInstanceEventHandlerMethodNamePrefix: function () {
            return "_on";
        }
    }, Object.create(__EventHandlerCategory.prototype)) ;

    var __EventHandlerCategory_USER = new __UserEventHandlerCategory();
    var __EventHandlerCategory_INTERNAL = new __InternalEventHandlerCategory();
    var __EventHandlerCategory_all = [__EventHandlerCategory_USER, __EventHandlerCategory_INTERNAL];
    __EventHandlerCategory.INTERNAL = __EventHandlerCategory_INTERNAL;
    __EventHandlerCategory.USER = __EventHandlerCategory_USER;

    function __EventHandler(func, thisp, prevEventHandler) {
        this.__func = func;
        this.__thisp = thisp;
        this.__prevEventHandler = prevEventHandler;
    }
    function EventHandler() { throw Error(); }
    EventHandler.prototype = __EventHandler.prototype = {
        constructor: EventHandler,
        invoke: function (sender, eventArgs) {
            this.__func.call(this.__thisp, sender, eventArgs);
        }
    };
    function __InstanceMethodEventHandler(func, thisp) {
        this.__func = func;
        this.__thisp = thisp;
    }
    function InstanceMethodEventHandler() { throw Error(); }
    InstanceMethodEventHandler.prototype = __InstanceMethodEventHandler.prototype = {
        constructor: InstanceMethodEventHandler,
        invoke: function (sender, eventArgs) {
            this.__func.call(this.__thisp, eventArgs);
        }
    };


    function Event() { throw Error(); }
    function __Event(target, eventClass, args) {
        this.__args = args;
        this.__eventClass = eventClass;
        this.__target = target;
        this.__ownerEventQueue = null;
        this.__prevEvent = null;
        this.__nextEvent = null;
    }
    Event.prototype = __Event.prototype = {
        constructor: Event,
        getArgs: function() {
            return this.__args;
        },
        getEventClass: function () {
            return this.__eventClass;
        },
        getTarget: function () {
            return this.__target;
        },
        invokeHandlers: function (handlerCategory) {
            var eventHandlerList, i;
            var target, args;
            target = this.__target;
            args = this.__args;
            eventHandlerList = target.__getEventHandlerListReversed(this.__eventClass, handlerCategory);
            for (i = eventHandlerList.length; 0 <= --i;) {
                eventHandlerList[i].invoke(target, args);
            }
        },
        __setArgs: function (value) {
            this.__args = value;
        }
    };
    function EventQueue() { throw Error(); }
    function __EventQueue() {
        this.__first = null;
        this.__last = null;
        this.__insertBefore = null;
    }
    EventQueue.prototype = __EventQueue.prototype = {
        constructor: EventQueue,
        __clear: function () {
            var event1, event2;
            event1 = this.__first;
            if (event1 === null) return;
            while (true) {
                event2 = event1.__nextEvent;
                event1.__prevEvent = null;
                event1.__ownerEventQueue = null;
                if (event2 === null) {
                    break;
                }
                event1.__nextEvent = null;
                event1 = event2;
            }
            this.__first = null;
            this.__last = null;
            this.__insertBefore = null;
        },
        dequeue: function(event) {
            var event = this.__first;
            if (event === null) {#x
                return null;
            }
            this.remove(event);
            event.getEventClass().getEventQueueBehavior().onDequeued(event);
            return event;
        },
        enqueue: function (event) {
            if (!(event instanceof Event) || event.__ownerEventQueue !== null) throw Error();
            if (this.__insertBefore !== null) {
                if (this.__first === this.__insertBefore) {
                    this.__first = event;
                } else {
                    event.__prevEvent = this.__insertBefore.__prevEvent;
                }
                event.__nextEvent = this.__insertBefore;
                event.__nextEvent.__prevEvent = event;
            } else {
                if (this.__first === null) {
                    this.__first = event;
                } else {
                    this.__last.__nextEvent = event;
                    event.__prevEvent = this.__last;
                }
                this.__last = event;
            }
            event.__ownerEventQueue = this;
        },
        getIsEmpty: function () {
            return this.__first === null;
        },
        getNextEvent: function (event) {
            if (!(event instanceof Event) || event.__ownerEventQueue !== this) throw Error();
            return event.__nextEvent;
        },
        getPreviousEvent: function (event) {
            if (!(event instanceof Event) || event.__ownerEventQueue !== this) throw Error();
            return event.__prevEvent;
        },

        isEventRankedLowerThanAnyEventToBeEnqueued: function (event1) {
            var event2, insertBefore;
            if (!(event1 instanceof Event) || event1.__ownerEventQueue !== this) throw Error();
            insertBefore = this.__insertBefore;
            if (insertBefore === null) {
                // New events are enqueued at the end, thus all events in the queue are ranked lower than any new event.
                return true;
            }
            // We now walk through the queue in order of increasing rank.
            for (event2 = this.__first; event2 !== insertBefore; event2 = event2.__nextEvent) {
                if (event2 === event1) {
                    return true;
                }
            }
            return false;
        },

        peek: function () {
            return this.__first;
        },
        remove: function (event) {
            if (!(event instanceof Event) || event.__ownerEventQueue !== this) throw Error();
            if (event === this.__insertBefore) {
                this.__insertBefore = event.__nextEvent;
            }
            if (event.__prevEvent !== null) {
                event.__prevEvent.__nextEvent = event.__nextEvent;
            } else {
                this.__first = event.__nextEvent;
            }
            if (event.__nextEvent !== null) {
                event.__nextEvent.__prevEvent = event.__prevEvent;
            } else {
                this.__last = event.__prevEvent;
            }
        },
        __setInsertBefore: function (event) {
            if (event !== null && (!(event instanceof Event) || event.__ownerEventQueue !== this)) throw Error();
            this.__insertBefore = event;
        }
    };


    function EventQueueBehavior() {}
    EventQueueBehavior.prototype = {
        constructor: EventQueueBehavior,
        resetData: function () {
        },
        enqueue: function (eventQueue, event) {
            if (!(eventQueue instanceof EventQueue) || !(event instanceof Event)) throw Error();
            eventQueue.enqueue(event);
        },
        equals: function (other) {
            return other != null && other.constructor === EventQueueBehavior;
        },
        onDequeued: function (event) {
            if (!(event instanceof Event)) throw Error();
        }
    };
    var EventQueueBehavior_default = EventQueueBehavior.DEFAULT = new EventQueueBehavior();


    function __EventClass(ownerTypeConstructor, name, isEventArgsValidFunction, eventQueueBehavior) {
        var name_pascalCase;
        if (!isFunction(ownerTypeConstructor)) throw Error();
        name_pascalCase = string_nameToPascalCase(name);
        if (!isFunction(isEventArgsValidFunction)) throw Error();
        if (!(eventQueueBehavior instanceof EventQueueBehavior)) throw Error();

        this.__name = name;
        this.__name_pascalCase = name_pascalCase;
        this.__ownerTypeConstructor = ownerTypeConstructor;
        this.__eventQueueBehavior = eventQueueBehavior;
        this.__isEventArgsValidFunction = isEventArgsValidFunction;
    }
    function EventClass() { throw Error(); }
    EventClass.prototype = __EventClass.prototype = {
        constructor: EventClass,
        isEventArgsValid: function (eventArgs) {
            var f, b;
            b = false;
            if (eventArgs instanceof EventArgs) {
                f = this.__isEventArgsValidFunction;
                b = f(eventArgs);
                if (typeof b !== "boolean") throw Error();
            }
            return b;
        },
        createInstance: function (objectWithEvents, eventArgs) {
            if (!(objectWithEvents instanceof ObjectWithEvents)) throw Error();
            if (!this.isEventArgsValid(eventArgs)) throw Error();
            return new __Event(objectWithEvents, this, eventArgs);
        },
        getEventQueueBehavior: function() {
            return this.__eventQueueBehavior;
        },
        getName: function() {
            return this.__name;
        },
        getName_pascalCase: function () {
            return this.__name_pascalCase;
        },
        getOwnerTypeConstructor: function () {
            return this.__ownerTypeConstructor;
        },

        __setEventQueueBehavior: function (value) {
            this.__eventQueueBehavior = value;
        }
    };
    
    var EventClass_registry_uniqueEventQueueBehaviors = [];
    var EventClass_registry_eventClassFromName = {};
    function __EventClass_register(eventClass) {
        var name_pascalCase;
        var i;
        var ownerTypeConstructor_prototype, instanceMethodEventHandler_methodName;
        var instanceMethodEventHandler_methodFunc_default;
        var eventQueueBehavior;

        if (hasOwnPropertyFunction.call(EventClass_registry_eventClassFromName, eventClass.getName())) throw Error();

        ownerTypeConstructor_prototype = eventClass.getOwnerTypeConstructor().prototype;
        name_pascalCase = eventClass.getName_pascalCase();
        for (i = __EventHandlerCategory_all.length; 0 <= --i;) {
            instanceMethodEventHandler_methodName = __EventHandlerCategory_all[i].getInstanceEventHandlerMethodNamePrefix() + name_pascalCase;
            if (ownerTypeConstructor_prototype[instanceMethodEventHandler_methodName] !== undefined
                ? !isFunction(ownerTypeConstructor_prototype[instanceMethodEventHandler_methodName])
                : hasPropertyWithUndefinedValue(ownerTypeConstructor_prototype, instanceMethodEventHandler_methodName)) {
                throw Error();
            }
        }
        for (i = __EventHandlerCategory_all.length; 0 <= --i;) {
            instanceMethodEventHandler_methodName = __EventHandlerCategory_all[i].getInstanceEventHandlerMethodNamePrefix() + name_pascalCase;
            if (!isFunction(ownerTypeConstructor_prototype[instanceMethodEventHandler_methodName])) {
                if (instanceMethodEventHandler_methodFunc_default === undefined) {
                    instanceMethodEventHandler_methodFunc_default = function (e) {
                        if (!eventClass.isEventArgsValid(e)) throw Error();
                    };
                }
                ownerTypeConstructor_prototype[instanceMethodEventHandler_methodName] = instanceMethodEventHandler_methodFunc_default;
            }
        }

        EventClass_registry_eventClassFromName[eventClass.getName()] = eventClass;
        eventQueueBehavior = eventClass.getEventQueueBehavior();
        for (i = EventClass_registry_uniqueEventQueueBehaviors.length; 0 <= --i;) {
            if (EventClass_registry_uniqueEventQueueBehaviors[i].equals(eventQueueBehavior)) {
                eventQueueBehavior = EventClass_registry_uniqueEventQueueBehaviors[i];
                eventClass.__setEventQueueBehavior(eventQueueBehavior);
                break;
            }
        }
        if (i < 0) {
            EventClass_registry_uniqueEventQueueBehaviors.push(eventQueueBehavior);
        }
        return eventClass;
    }
    function EventClass_register(ownerTypeConstructor, name, isEventArgsValidFunction, eventQueueBehavior) {
        var eventClass, i;
        i = arguments.length;
        if (i < 3 || isEventArgsValidFunction === null) isEventArgsValidFunction = isEventArgs_nonDerived;
        if (i < 4 || eventQueueBehavior === null) eventQueueBehavior = EventQueueBehavior_default;
        eventClass = new __EventClass(ownerTypeConstructor, name, isEventArgsValidFunction, eventQueueBehavior);
        return __EventClass_register(eventClass);
    }
    function EventClass_fromName(name) {
        return getOwnProperty(EventClass_registry_eventClassFromName, name, null);
    }
    EventClass.fromName = EventClass_fromName;
    EventClass.register = EventClass_register;
    EventClass.__register = __EventClass_register;

    var ObjectWithEvents_maxId = -1;
    var ObjectWithEvents_idRecyclingBin = [];
    var ObjectWithEvents_idsOfDisposedInstances = [];
    function ObjectWithEvents_nextId() {
        var id;
        if ((id = ObjectWithEvents_idRecyclingBin.pop()) === undefined) {
            if (ObjectWithEvents_maxId === largestDecrementableIntegralDouble) throw Error();
            id = ++ObjectWithEvents_maxId;
        }
        return id;
    }
    function ObjectWithEvents() {
        this.__objectWithEvents_id = ObjectWithEvents_nextId();                    
        this.__objectWithEvents_lastInternalEventHandlerFromEventClassName = {};
        this.__objectWithEvents_lastUserEventHandlerFromEventClassName = {};
    }
    ObjectWithEvents.prototype = {
        constructor: ObjectWithEvents,
        addEventHandler: function(eventClassOrItsName, func, thisp) {
            this.__addEventHandler_common(eventClassOrItsName, func, thisp, __EventHandlerCategory_USER);
        },
        __addEventHandler: function(eventClassOrItsName, func, thisp) {
            this.__addEventHandler_common(eventClassOrItsName, func, thisp, __EventHandlerCategory_INTERNAL);
        },
        __addEventHandler_common: function(eventClassOrItsName, func, thisp, category) {
            var eventClass, lastEventHandlerFromEventClassName;
            var eventClass_name;
            var eventHandler;
            if (typeof eventClassOrItsName === "string") eventClass = EventClass_fromName(eventClassOrItsName);
            else eventClass = eventClassOrItsName;
            if (!(eventClass instanceof EventClass)) throw Error();
            if (!(this instanceof eventClass.getOwnerTypeConstructor())) throw Error();
            if (!isFunction(func)) throw Error();
            if (thisp === undefined) thisp = null;
            lastEventHandlerFromEventClassName = category.__getLastEventHandlerFromEventClassNameMap(this);
            eventClass_name = eventClass.getName();
            eventHandler = null;
            if (hasOwnPropertyFunction.call(lastEventHandlerFromEventClassName, eventClass_name)) {
                eventHandler = lastEventHandlerFromEventClassName[eventClass_name];
            }
            lastEventHandlerFromEventClassName[eventClass_name] = new __EventHandler(func, thisp, eventHandler);
        },

        dispose: function () {
            if (this.__objectWithEvents_id !== null) {
                this._disposeCore();
                if (this.__objectWithEvents_id !== null) throw Error();
                this.raiseEvent("disposed", EventArgs.getEmpty());
            }
        },
        _disposeCore: function () {
            if (Dispatcher_instance.__getIsRunningOperationHooked()) {
                ObjectWithEvents_idsOfDisposedInstances.push(this.__objectWithEvents_id);
            } else {
                ObjectWithEvents_idRecyclingBin.push(this.__objectWithEvents_id);
            }
            this.__objectWithEvents_id = null;
        },
                     
        __getEventHandlerListReversed: function (eventClass, category) {
            var lastEventHandlerFromEventClassName;
            var eventClass_name;
            var eventHandler;
            var eventHandlerListReversed;
            var instanceMethodEventHandler_func;
            var instanceMethodEventHandler_methodName;
            var i;
            if (!(eventClass instanceof EventClass)) throw Error();
            if (!(category instanceof EventHandlerCategory)) throw Error();
            lastEventHandlerFromEventClassName = category.__getLastEventHandlerFromEventClassNameMap(this);
            eventClass_name = eventClass.getName();
            eventHandlerListReversed = [];
            i = 0;
            if (hasOwnPropertyFunction.call(lastEventHandlerFromEventClassName, eventClass_name)) {
                eventHandler = lastEventHandlerFromEventClassName[eventClass_name];
                do eventHandlerListReversed[i++] = eventHandler;
                while ((eventHandler = eventHandler.__prevEventHandler) !== null);
            }
            instanceMethodEventHandler_methodName = category.getInstanceEventHandlerMethodNamePrefix() + eventClass.getName_pascalCase();
            instanceMethodEventHandler_func = this[instanceMethodEventHandler_methodName];
            assert(isFunction(instanceMethodEventHandler_func));
            eventHandlerListReversed[i++] = new __InstanceMethodEventHandler(instanceMethodEventHandler_func, this);
            return eventHandlerListReversed;
        },

        getId: function() {
            return this.__objectWithEvents_id;
        },
        getIsDisposed: function() {
            return this.__objectWithEvents_id === null;
        },

        raiseEvent: function (eventClassOrItsName, eventArgs) {
            var eventClass;
            var event;
            if (typeof eventClassOrItsName === "string") eventClass = EventClass_fromName(eventClassOrItsName);
            if (!(eventClass instanceof EventClass)) throw Error();
            if (!(this instanceof eventClass.getOwnerTypeConstructor())) throw Error();
            if (!eventClass.isEventArgsValid(eventArgs)) throw Error();
            event = eventClass.createInstance(this, eventArgs);
            if (!(event instanceof __Event)) throw Error();
            Dispatcher.getInstance().__raiseEvent(event);
        },

        removeEventHandler: function (eventClassOrItsName, func, thisp) {
            this.__removeEventHandler_common(eventClassOrItsName, func, thisp, __EventHandlerCategory_USER);
        },
        __removeEventHandler: function (eventClassOrItsName, func, thisp) {
            this.__removeEventHandler_common(eventClassOrItsName, func, thisp, __EventHandlerCategory_INTERNAL);
        },
        __removeEventHandler_common: function (eventClassOrItsName, func, thisp, category) {
            var eventClass, lastEventHandlerFromEventClassName;
            var eventClass_name;
            var eventHandler1, eventHandler2;
            if (typeof eventClassOrItsName === "string") eventClass = EventClass_fromName(eventClassOrItsName);
            else eventClass = eventClassOrItsName;
            if (!(eventClass instanceof EventClass)) throw Error();
            if (!(this instanceof eventClass.getOwnerTypeConstructor())) throw Error();
            if (!isFunction(func)) throw Error();
            lastEventHandlerFromEventClassName = category.__getLastEventHandlerFromEventClassNameMap(this);
            eventClass_name = eventClass.getName();
            if (!hasOwnPropertyFunction.call(lastEventHandlerFromEventClassName, eventClass_name)) {
                return;
            }
            if (thisp === undefined) thisp = null;
            eventHandler1 = lastEventHandlerFromEventClassName[eventClass_name];
            if (eventHandler1.__func === func && eventHandler1.__thisp === thisp) {
                if (eventHandler1.__prevEventHandler === null) {
                    delete lastEventHandlerFromEventClassName[eventClass_name];
                } else {
                    lastEventHandlerFromEventClassName[eventClass_name] = eventHandler1.__prevEventHandler;
                }
                return;
            }
            while (true) {
                eventHandler2 = eventHandler1;
                if ((eventHandler1 = eventHandler1.__prevEventHandler) === null) {
                    break;
                }
                if (eventHandler1.__func === func && eventHandler1.__thisp === thisp) {
                    eventHandler2.__prevEventHandler = eventHandler1.__prevEventHandler;
                    break;
                }
            }
        }
    };


    function PropertyChangedEventArgs(propertyName, oldValue, newValue) {
        this.__propertyName = propertyName;
        this.__oldValue = oldValue;
        this.__newValue = newValue;
    }
    PropertyChangedEventArgs.prototype = setOwnSrcPropsOnDst({
        constructor: PropertyChangedEventArgs,
        getOldValue: function () { return funtion_copyValueType(this.__getOldValue()); },
        __getOldValue: function() { return this.__oldValue; },
        getPropertyName: function () { return this.__propertyName; },
        getNewValue: function () { return function_copyValueType(this.__getNewValue());},
        __getNewValue: function () { return this.__newValue; },
        __setOldValue: function (value) { this.__oldValue = value; }
    }, Object.create(EventArgs.prototype));
    function isPropertyChangedEventArgs_nonDerived(eventArgs) {
        return eventArgs.constructor === PropertyChangedEventArgs;
    }
    function PropertyChangedEventQueueBehavior() {
        this.__eventFromInstancePropertyId = {};
    }
    function PropertyChangedEventQueueBehavior_getInstancePropertyId(event) {
        return event.getTarget().getId()
            + "_"
            + event.getArgs().getPropertyName();
    }
    PropertyChangedEventQueueBehavior.prototype = setOwnSrcPropsOnDst({
        constructor: PropertyChangedEventQueueBehavior,
        enqueue: function (eventQueue, newEvent) {
            var ipid, obj, propName;
            var newEvent_args;
            var curEvent, curEvent_args_oldValue;
            var newPropVal;
            if (!(eventQueue instanceof EventQueue) || !(newEvent instanceof Event)) throw Error();
            newEvent_args = newEvent.getArgs();
            if (!isPropertyChangedEventArgs_nonDerived(newEvent_args)) throw Error();
            obj = newEvent.getTarget();
            propName = newEvent.getArgs().getPropertyName();
            ipid = obj.getId()
                + "_"
                + propName;
            curEvent = getOwnProperty(this.__eventFromInstancePropertyId, ipid);
            if (curEvent === undefined) {
                eventQueue.enqueue(newEvent);
                this.__eventFromInstancePropertyId[ipid] = newEvent;
                return;
            }
            newPropVal = newEvent_args.__getNewValue();
            if (!function_equalityValueTypes(newEvent_args.__getOldValue(), curEvent.getArgs().__getNewValue())) throw Error();
            curEvent_args_oldValue = curEvent.getArgs().__getOldValue();
            if (!function_equalityValueTypes(curEvent_args_oldValue, newPropVal)) {
                if (eventQueue.isEventRankedLowerThanAnyEventToBeEnqueued(curEvent)) {
                    // The user event handlers for curEvent will be raised earlier than for newEvent if we would enqueue newEvent.
                    return;
                }
                newEvent.__setOldValue(curEvent_args_oldValue);
                eventQueue.remove(curEvent);
                eventQueue.enqueue(newEvent);
                this.__eventFromInstancePropertyId[ipid] = newEvent;
                return;
            }
            eventQueue.remove(curEvent);
            delete this.__eventFromInstancePropertyId[ipid];
        },
        equals: function (other) {
            return other != null && other.constructor === PropertyChangedEventQueueBehavior;
        },
        onDequeued: function (event) {
            var m, ipid;
            m = this.__eventFromInstancePropertyId;
            ipid = PropertyChangedEventQueueBehavior_getInstancePropertyId(event);
            assert(hasOwnProperty(m, ipid));
            delete m[ipid];
        },
        resetData: function () {
            this.__eventFromInstancePropertyId = {};
        }
    }, Object.create(EventQueueBehavior.prototype));

    EventClass_register(ObjectWithEvents, "propertyChanged", isPropertyChangedEventArgs_nonDerived, new PropertyChangedEventQueueBehavior());
    EventClass_register(ObjectWithEvents, "disposed");


    function EventQueueBehaviorAtMostOneEventPerObject() {
        throw Error();
    }
    function __EventQueueBehaviorAtMostOneEventPerObject() {
        this.__eventFromObjectId = {};
    }
    EventQueueBehaviorAtMostOneEventPerObject.prototype = __EventQueueBehaviorAtMostOneEventPerObject.prototype = setOwnSrcPropsOnDst({
        constructor: EventQueueBehaviorAtMostOneEventPerObject,
        
        enqueue: function (eventQueue, newEvent) {
            var object_id, curEvent, eventFromObjectId, mergedEventArgs;
            if (!(eventQueue instanceof EventQueue) || !(newEvent instanceof Event)) throw Error();
            object_id = newEvent.getTarget().getId();
            eventFromObjectId = this.__eventFromObjectId;
            if (!hasOwnPropertyFunction.call(eventFromObjectId, object_id)) {
                eventFromObjectId[object_id] = newEvent;
                eventQueue.enqueue(newEvent);
                return;
            }
            curEvent = eventFromObjectId[object_id];
            mergedEventArgs = this._mergeEventArgs(curEvent.getArgs(), newEvent.getArgs());
            if (mergedEventArgs === null) {
                eventQueue.remove(curEvent);
                delete eventFromObjectId[object_id];
                return;
            }
            if (!curEvent.getEventClass().isEventArgsValid(mergedEventArgs)) throw Error();
            if (eventQueue.isEventRankedLowerThanAnyEventToBeEnqueued(curEvent)) {
                curEvent.__setArgs(mergedEventArgs);
                return;
            }
            eventQueue.remove(curEvent);
            eventFromObjectId[object_id] = newEvent;
            newEvent.__setArgs(mergedEventArgs);
        },
        equals: function(other) {
            return other != null && other.constructor === EventQueueBehaviorAtMostOneEventPerObject;
        },
        _mergeEventArgs: function (curEventArgs, newEventArgs) {
            return newEventArgs;
        },
        onDequeued: function (oldEvent) {
            var object_id, eventFromObjectId;
            if (!(oldEvent instanceof Event)) throw Error();
            object_id = oldEvent.getTarget().getId();
            eventFromObjectId = this.__eventFromObjectId;
            assert(hasOwnPropertyFunction.call(eventFromObjectId, object_id));
            delete eventFromObjectId[object_id];
        },
        resetData: function () {
            this.__eventFromObjectId = {};
        }
    }, Object.create(EventQueueBehavior.prototype));


    EventQueueBehavior.AT_MOST_ONE_EVENT_PER_OBJECT = new __EventQueueBehaviorAtMostOneEventPerObject();


    setOwnSrcPropsOnDst({
        Dispatcher,
        DispatcherOperation,
        DispatcherOperationRunAfterAllEvents: DispatcherOperationRunAfterAllEvents,
        DispatcherOperationAnimationFrame: DispatcherOperationAnimationFrame,
        DispatcherOperationSetTimeout: DispatcherOperationSetTimeout,
        Event: Event,
        __Event: __Event,
        EventArgs: EventArgs,
        EventClass: EventClass,
        __EventClass: __EventClass,
        EventHandler: EventHandler,
        EventHandlerCategory: EventHandlerCategory,
        EventQueue: EventQueue,
        EventQueueBehavior: EventQueueBehavior,
        EventQueueBehaviorAtMostOneEventPerObject: EventQueueBehaviorAtMostOneEventPerObject,
        __EventQueueBehaviorAtMostOneEventPerObject: __EventQueueBehaviorAtMostOneEventPerObject,
        InternalEventHandlerCategory: InternalEventHandlerCategory,
        ObjectWithEvents: ObjectWithEvents,
        PropertyChangedEventArgs: PropertyChangedEventArgs,
        PropertyChangedEventQueueBehavior: PropertyChangedEventQueueBehavior,
        UserEventHandlerCategory: UserEventHandlerCategory
    }, window);

})();