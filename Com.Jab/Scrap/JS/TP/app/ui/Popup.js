(function () {

    // Suppose we have three Popups popup1, popup2 and popup3 and a UIElement uiElement4 that is not a Popup or descendant of one. 
    // Let list1 be the singly linked list induced by the Popup.PlacementTarget property starting at popup1: popup1, popup2, popup3, uiElement4.
    // Arranging has to be performed in the reverse order of list1, namely: uiElement4, popup3, popup2, popup1, to obtain the correct results.
    // The initial layout solution l1 uses one measure and arrange queue that is designed to process UI elements in tree order (depth-first search).
    // We want to implement the correct arrange ordering for all graphs induced by the Popup.PlacementTarget property in any UI element tree.
    // The above example does not show the full scope of the problem.
    var hasOwnPropertyFunction = Object.prototype.hasOwnProperty;









    var Placement_right = 0;
    var Placement_bottom = 1;

    var Placement_toString = ["right", "bottom"];
    var Placement_parse = Placement_createParseTable();
    function Placement_createParseTable() {
        var i, t;
        t = {};
        for (i = Placement_toString.length; 0 <= --i;) {
            t[Placement_toString[i]] = i;
        }
        return t;
    }
    var Placement_sizeOf_base2 = Placement_toString.length === 0
        ? 0
        : log2FloorDouble(Placement_toString.length - 1) + 1;
    assert(Placement_sizeOf_base2 < 32);
    var Placement_mask = (1 << Placement_sizeOf_base2) - 1;
    function Placement_isValid(value) {
        return isIntegralDouble_nonNegative(value) && value < Placement_toString.length;
    }

    var Popup_packedData1_placement_offset = 0;
    var Popup_packedData1_placement_mask = Placement_mask << Popup_packedData1_placement_offset;
    assert(Popup_packedData1_isOpen_mask !== 0);

    var Popup_baseTypeName = "FrameworkElement";
    var Popup_baseTypeCtor = window[Popup_baseTypeName];
    var Popup_baseTypeProto = Popup_baseTypeCtor.prototype;
    function Popup() {
        this.__popup_child = null;
        this.__popup_placementTarget = null;
        this.__popup_packedData1 = 0;
        this.__popup_horizontalOffset = 0;
        this.__popup_verticalOffset = 0;
        Popup_baseTypeCtor.call(this);
        this.__setIsLayoutIslandRoot(true);
        this.__setIsFrozenInUIElementTree(true);
    }
    Popup.prototype = setOwnSrcPropsOnDst({
        //__arrange_getFinalRect: function () {
        //    var pt;
        //    if (this.getVisibility_effective() === "collapsed") {
        //        return Popup_baseTypeProto.__arrange_getFinalRect.call(this);
        //    }
        //    pt = this.getPlacementTarget();
        //    throw Error();
        //},
        getChild: function () {
            return this.__popup_child;
        },
        getHorizontalOffset: function () {
            return this.__popup_horizontalOffset;
        },
        getPlacement: function () {             
            return Placement_toString[this.__getPlacement()];
        },
        __getPlacement: function () {
            return (this.__popup_packedData1 & Popup_packedData1_placement_mask) >> Popup_packedData1_placement_offset;
        },
        getPlacementTarget: function() {
            return this.__popup_placementTarget;
        },
        getVerticalOffset: function () {
            return this.__popup_verticalOffset;
        },
        __getVisibility_effective_alternate: function () {
            var pt;
            pt = this.getPlacementTarget();
            return pt !== null ? pt.getVisibility_effective() : "collapsed";
        },
        //__measure_getAvailableSize: function () {
        //    if (this.getVisibility_effective() === "collapsed") {
        //        return Popup_baseTypeProto.__measure_getAvailableSize.call(this);
        //    }
        //    throw Error();
        //},
        __onChildChanged: function (oldValue, newValue) {
            if (oldValue !== null) {
                oldValue.__setUIElementTree_parent(null);
            }
            if (newValue !== null) {
                newValue.__setUIElementTree_parent(this);
            }
            this.invalidateMeasure();
        },
        __onPlacementTargetDisposed: function (sender, e) {
            this.setPlacementTarget(null);
        },
        __onPlacementTargetPropertyChanged: function(sender, e) {
            switch (e.getPropertyName()) {
                case "visibility_effective":
                    this.__updateVisibility_effective_cache();
                    break;
            }
        },
        __onPropertyChanged: function (e) {
            var f;
            Popup_baseTypeProto.__onPropertyChanged.call(this, e);
            switch (e.getPropertyName()) {
                case "child":
                    this.__onChildChanged(e.__getOldValue(), e.__getNewValue());
                    break;
                case "placementTarget":
                    this.invalidateArrange();
                    this.__updateVisibility_effective_cache();           
                    break;
                case "horizontalOffset":
                case "verticalOffset":
                case "placement":
                    this.invalidateArrange();
                    break;
            }       
        },
        setChild: function (value) {
            var oldValue;
            oldValue = this.__popup_child;
            if (oldValue === value) return;
            if (value !== null && !(value instanceof UIElement)) throw Error();
            this.__popup_child = value;
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("child", oldValue, value));
        },
        setHorizontalOffset: function (value) {
            var oldValue;
            oldValue = this.__popup_horizontalOffset;
            if (oldValue === value) return;
            if (!isFiniteDouble(value)) throw Error();
            this.__popup_horizontalOffset = value;
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("horizontalOffset", oldValue, value));
        },
        setPlacement: function (value) {
            var value_i;
            if (!hasOwnPropertyFunction.call(Placement_parse, value)) throw Error();
            value_i = Placement_parse[value];
            this.__setPlacement(value_i);
        },
        __setPlacement: function (value) {
            var oldValue;
            oldValue = this.__getPlacement();
            if (oldValue === value) return;
            if (Placement_isValid(value)) throw Error();
            this.__popup_packedData1 = (this.__popup_packedData1 & ~Popup_packedData1_placement_mask) | (value << Popup_packedData1_placement_offset);
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("placement", Placement_toString[oldValue], Placement_toString[value]));
        },
        setPlacementTarget: function (value) {
            var oldValue;
            oldValue = this.getPlacementTarget();
            if (oldValue === value) return;
            if (value !== null) {
                if (!(value instanceof UIElement) ||
                    value.getIsDisposed()) throw Error();
            }
            if (oldValue !== null) {
                oldValue.__removeEventHandler("disposed", this.__onPlacementTargetDisposed, this);
                oldValue.__removeEventHandler("propertyChanged", this.__onPlacementTargetPropertyChanged, this);
            }
            this.__popup_placementTarget = value;
            if (value !== null) {
                value.__addEventHandler("disposed", this.__onPlacementTargetDisposed, this);
                value.__addEventHandler("propertyChanged", this.__onPlacementTargetPropertyChanged, this); 
            }
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("placementTarget", oldValue, value));
        },
        setVerticalOffset: function (value) {
            var oldValue;
            oldValue = this.__popup_verticalOffset;
            if (oldValue === value) return;
            if (!isFiniteDouble(value)) throw Error();
            this.__popup_verticalOffset = value;
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("verticalOffset", oldValue, value));
        }
    }, Object.create(Popup_baseTypeProto));


})();