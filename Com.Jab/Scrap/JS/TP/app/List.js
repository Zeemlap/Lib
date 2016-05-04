(function () {

    var undefined;
    var floor = Math.floor;
    var arr_proto_slice = Array.prototype.slice;

    function ListChangeEventArgs() {
        throw Error();
    }
    function __ListChangeEventArgs(type, oldIndex, oldItems, newIndex, newItems) {
        this.__type = type;
        this.__newIndex = newIndex;
        this.__newItems = newItems;
        this.__oldIndex = oldIndex;
        this.__oldItems = oldItems;
    }
    __ListChangeEventArgs.prototype = ListChangeEventArgs.prototype = Object.create(EventArgs.prototype);
    setOwnSrcPropsOnDst({
        constructor: ListChangeEventArgs,
        getType: function () {
            return this.__type;
        },
        getNewIndex: function () {
            return this.__newIndex;
        },
        getNewItem: function (index) {
            var newItems = this.__newItems;
            if (!(isIntegralDouble_nonNegative(index) && index < newItems.length)) throw Error();
            return newItems[index];
        },
        getNewItems_count: function () {
            return this.__newItems.length;
        },
        getOldIndex: function () {
            return this.__oldIndex;
        },
        getOldItem: function (index) {
            var oldItems = this.__oldItems;
            if (!(isIntegralDouble_nonNegative(index) && index < oldItems.length)) throw Error();
            return oldItems[index];
        },
        getOldItems_count: function () {
            return this.__oldItems.length;
        }
    }, EventArgs.prototype);
    var __ListChangeEventArgs_reset = new __ListChangeEventArgs("reset", -1, [], -1, []);
    function __ListChangeEventArgs_insert(newIndex, newItems) {
        return new __ListChangeEventArgs("insert", -1, [], newIndex, newItems);
    }
    function __ListChangeEventArgs_remove(oldIndex, oldItems) {
        return new __ListChangeEventArgs("remove", oldIndex, oldItems , - 1, []);
    }
    function __ListChangeEventArgs_removeFollowedByInsert(oldIndex, oldItems, newIndex, newItems) {
        return new __ListChangeEventArgs("removeFollowedByInsert", oldIndex, oldItems, newIndex, newItems);
    }
    setOwnSrcPropsOnDst({
        insert: function (newIndex, newItems) {
            if (!isIntegralDouble_nonNegative(newIndex)) throw Error();
            if (!isArrayLike_nonSparse(newItems)) throw Error();
            var c = new Integer(newIndex);
            c.addAssign(newItems.length);
            if (c.compareTo(largestDecrementableIntegralDouble) > 0) throw Error();
            return __ListChangeEventArgs_insert(newIndex, arr_proto_slice.call(newItems, 0));
        },
        remove: function (oldIndex, oldItems) {
            if (!isIntegralDouble_nonNegative(oldIndex)) throw Error();
            if (!isArrayLike_nonSparse(oldItems)) throw Error();
            return __ListChangeEventArgs_remove(oldIndex, arr_proto_slice.call(oldItems, 0));
        },
        reset: function () {
            return __ListChangeEventArgs_reset;
        },
        removedFollowedByInsert: function (oldIndex, oldItems, newIndex, newItems) {
            if (!isIntegralDouble_nonNegative(oldIndex)) throw Error();
            if (!isIntegralDouble_nonNegative(newIndex)) throw Error();
            if (!isArrayLike_nonSparse(oldItems)) throw Error();
            if (!isArrayLike_nonSparse(newItems)) throw Error();
            if (largestDecrementableIntegralDouble < oldIndex) throw Error();
            var integer = new Integer(newIndex);
            integer.subtractAssign(oldItems.length);
            integer.addAssign(newItems.length);
            if (integer.compareTo(largestDecrementableIntegralDouble) > 0) throw Error();
            return __ListChangeEventArgs_removeFollowedByInsert(oldIndex, oldItems, newIndex, newItems);
        }
    }, ListChangeEventArgs);

    function List(options) {
        var optionNames, i, n;
        var items;
        this.__itemEqualityFunction = function_equalityValueTypes;
        this.__isItemValidFunction = function_returnTrue;
        this.__canUseResetListChangeType = true;
        if (1 <= arguments.length) {
            optionNames = Object.getOwnPropertyNames(options);
            n = optionNames.length;
            for (i = 0; i < n; i++) {
                switch (optionNames[i]) {
                    case "areItemsEqual":
                        this.__itemEqualityFunction = options.areItemsEqual;
                        if (!isFunction(this.__itemEqualityFunction)) throw Error();
                        break;
                    case "isItemValid":
                        this.__isItemValidFunction = options.isItemValid;
                        if (!isFunction(this.__isItemValidFunction)) throw Error();
                        break;
                    case "canUseResetListChangeType":
                        this.__canUseResetListChangeType = options.canUseResetListChangeType;
                        if (typeof this.__canUseResetListChangeType !== "boolean") throw Error();
                        break;
                    case "items":
                        items = options.items;
                        if (!isArrayLike_nonSparse(item)) throw Error();
                        break;
                    default:
                        throw Error();
                }
            }
        }
        this.__isWithinListChanging = false;
        if (items === undefined) {
            this.__items = [];
        } else {
            this.__verifyAreItemsValid(items);
            this.__items = arr_proto_slice.call(items, 0);
        }
        ObjectWithEvents.call(this);
    }
    List.prototype = Object.create(ObjectWithEvents.prototype);
    setOwnSrcPropsOnDst({
        constructor: List,
        add: function (item) {
            this.insert(item, this.getCount());
            return this;
        },
        addRange: function (items) {
            this.insertRange(items, this.getCount());
            return this;
        },
        clear: function () {
            var e;
            this.__verifyIsNotChanging();
            if (this.__canUseResetListChangeType) {
                e = __ListChangeEventArgs_reset;
                this.__raiseOnListChanging(e);
                this.__items.length = 0;
                this.__raiseOnListChanged(e);
            } else {
                e = __ListChangeEventArgs_remove(0, this.__items);
                this.__raiseOnListChanging(e);
                this.__items = [];
                this.__raiseOnListChanged(e);
            }
            return this;
        },
        contains: function (item) {
            return 0 <= this.lastIndexOf(item);
        },
        get: function (index) {
            if (!this.__isIndexValid(index)) throw Error();
            return this.__items[index];
        },
        getCount: function () {
            return this.__items.length;
        },
        indexOf: function (item) {
            var itemEqualityFunction, i, n, items, f;
            itemEqualityFunction = this.__itemEqualityFunction;
            items = this.__items;
            for (i = 0, n = items.length; i < n; i++) {
                f = itemEqualityFunction(items[i], item);
                if (typeof f !== "boolean") throw Error();
                if (f) return i;
            }
            return -1;
        },
        insert: function (item, index) {
            var e;
            this.__verifyIsNotChanging();
            if (!this.__isInsertionIndexValid(index)) throw Error();
            if (this.getCount() === largestDecrementableIntegralDouble) throw Error();
            e = __ListChangeEventArgs_insert(index, [item]);
            this.__raiseOnListChanging(e);
            this.__items.splice(index, 0, item);
            this.__raiseOnListChanged(e);
            return this;
        },
        insertRange: function (items, index) {
            var e, thisCount_new;
            this.__verifyIsNotChanging();
            if (!isArrayLike_nonSparse(items)) throw Error();
            if (!this.__isInsertionIndexValid(index)) throw Error();
            if (items.length === 0) return;
            thisCount_new = new Integer(this.getCount());
            thisCount_new.addAssign(items.length);
            if (0 < thisCount_new.compareTo(largestDecrementableIntegralDouble)) throw Error();
            e = __ListChangeEventArgs_insert(index, arr_proto_slice.call(items, 0));
            this.__raiseOnListChanging(e);
            this.__insertRange(index, items, 0, items.length);
            this.__raiseOnListChanged(e);
            return this;
        },
        __insertRange: function (index, items, items_fromIncl, items_count) {
            var i, thisItems = this.__items;
            for (i = this.getCount(); --i >= index;) {
                thisItems[i + items_count] = thisItems[i];
            }
            for (i = 0; i < items_count; ++i) {
                thisItems[index + i] = items[items_fromIncl + i];
            }
        },
        __isInsertionIndexValid: function (index) {
            return isIntegralDouble_nonNegative(index) && index <= this.getCount();
        },
        __isIndexValid: function (index) {
            return isIntegralDouble_nonNegative(index) && index < this.getCount();
        },
        push: function () {
            this.addRange(arguments);
            return this.getCount();
        },
        pop: function () {
            var i = this.__items.length - 1;
            return this.removeAt(i);
        },
        lastIndexOf: function (item) {
            var itemEqualityFunction, i, items, f;
            itemEqualityFunction = this.__itemEqualityFunction;
            items = this.__items;
            for (i = items.length; 0 <= --i;) {
                f = itemEqualityFunction(items[i], item);
                if (typeof f !== "boolean") throw Error();
                if (f) return i;
            }
            return -1;
        },
        __raiseOnListChanged: function (e) {
            if (!(e instanceof ListChangeEventArgs)) throw Error();
            this.raiseEvent("listChanged", e);
        },
        __raiseOnListChanging: function (e) {
            this.__verifyAreItemsValid(e.__newItems);
            try {
                this.__isWithinListChanging = true;
                this.raiseEvent("listChanging", e);
            } catch (e) {
                throw e;
            } finally {
                this.__isWithinListChanging = false;
            }
        },
        remove: function (item) {
            var index;
            this.__verifyIsNotChanging();
            index = this.lastIndexOf(item);
            if (index < 0) return false;
            this.removeAt(index);
            return true;
        },
        removeAt: function (index) {
            var e, thisItems;
            this.__verifyIsNotChanging();
            if (!this.__isIndexValid(index)) throw Error();
            thisItems = this.__items;
            e = __ListChangeEventArgs_remove(index, [thisItems[index]]);
            this.__raiseOnListChanging(e);
            thisItems.splice(index, 1);
            this.__raiseOnListChanged(e);
            return e.__oldItems[0];
        },
        removeRange: function (index, count) {
            var e;
            this.__verifyIsNotChanging();
            if (!this.__isInsertionIndexValid(index)) throw Error();
            if (!isIntegralDouble_nonNegative(count) || this.getCount() < index + count) throw Error();
            if (count === 0) return;
            e = __ListChangeEventArgs_remove(index, this.__items.slice(index, index + count));
            this.__items.splice(index, count);
            this.__raiseOnListChanged(e);
            return this;
        },
        reverse: function () {
            var e, thisItems, n, hn, i, t;
            this.__verifyIsNotChanging();
            if (!this.__canUseResetListChangeType) throw Error(); // Not efficient without reset, using this would be bad design.
            e = __ListChangeEventArgs_reset;
            this.__raiseOnListChanging(e);
            thisItems = this.__items;
            n = thisItems.length;
            hn = floor(n / 2);
            for (i = 0; i < hn; ++i) {
                t = thisItems[i];
                thisItems[i] = thisItems[n - i - 1];
                thisItems[n - i - 1] = t;
            }
            this.__raiseOnListChanged(e);
            return this;
        },
        set: function (index, value) {
            var e, thisItems;
            this.__verifyIsNotChanging();
            if (!this.__isIndexValid(index, value)) {
                throw Error();
            }
            thisItems = this.__items;
            e = __ListChangeEventArgs_removeFollowedByInsert(index, [thisItems[index]], index, [item]);
            this.__raiseOnListChanging(e);
            thisItems[index] = value;
            this.__raiseOnListChanged(e);
            return this;
        },
        __setRange: function (index, items, itemCount) {
            var i, thisItems;
            thisItems = this.__items;
            for (i = 0; i < itemCount; ++i) {
                thisItems[index + i] = items[i];
            }
        },
        shift: function () {
            var oldItem = this.__items[0];
            this.removeAt(0);
            return oldItem;
        },
        splice: function (index, deleteCount) {
            this.__verifyIsNotChanging();
            if (!this.__isInsertionIndexValid(index)) throw Error();
            var argN = arguments.length;
            var thisN_old = this.getCount();
            var insertN;
            if (argN < 2) {
                removeCount = thisN_old - index;
                insertN = 0;
            } else {
                if (!isIntegralDouble(removeCount) ||
                    removeCount < 0 ||
                    thisN_old - index < removeCount) {
                    throw Error();
                }
                insertN = argN - 2;
            }
            if (insertN === 0 && removeCount === 0) {
                return [];
            }
            var thisN_new = new Integer(thisN_old);
            thisN_new.addAssign(insertN);
            thisN_new.subtractAssign(removeCount);
            if (thisN_new.compareTo(maxDecrementableIntegralDouble) > 0) throw Error();
            var itemsToRemove = arr_proto_slice.call(this.__items, index, index + removeCount);
            var itemsToInsert = arr_proto_slice.call(arguments, 2);
            var e = __ListChangeEventArgs_removeFollowedByInsert(index, itemsToRemove, index, itemsToInsert);
            this.__raiseOnListChanging(e);
            if (itemsToInsert.length < removeCount) {
                this.__setRange(index, itemsToInsert, itemsToInsert.length);
                this.__items.splice(index + itemsToInsert.length, removeCount - itemsToInsert.length);
            } else {
                this.__setRange(index, itemsToInsert, removeCount);
                this.__insertRange(index + removeCount, itemsToInsert, removeCount, itemsToInsert.length - removeCount);
            }
            this.__raiseOnListChanged(e);
            return itemsToRemove.slice(0);
        },
        unshift: function () {
            this.insertRange(arguments, 0);
            return this.getCount();
        },
        __verifyIsNotChanging: function () {
            if (this.__isWithinListChanging) throw Error();
        },
        __verifyAreItemsValid: function (items) {
            var i, n, f;
            var isItemValidFunction;
            isItemValidFunction = this.__isItemValidFunction;
            for (i = 0, n = items.length; i < n; i++) {
                f = isItemValidFunction(items[i]);
                if (typeof f !== "boolean") throw Error();
                if (!f) throw Error();
            }
        }
    }, List.prototype);

    function isListChangeEventArgs(e) { return e instanceof ListChangeEventArgs; }
    EventClass.register(List, "listChanging", isListChangeEventArgs);
    EventClass.register(List, "listChanged", isListChangeEventArgs);


    setOwnSrcPropsOnDst({
        ListChangeEventArgs: ListChangeEventArgs,
        List: List
    }, window);
})();