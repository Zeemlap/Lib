(function () {

    var hasOwnPropertyFunction = Object.prototype.hasOwnProperty;
    var maxDouble = Math.max;

    var Panel_baseTypeName = "FrameworkElement";
    var Panel_baseTypeCtor = window[Panel_baseTypeName];
    var Panel_baseTypeProto = Panel_baseTypeCtor.prototype;
    function Panel() {
        this.__panel_children = null;
        Panel_baseTypeCtor.call(this);
    }
    Panel.prototype = setOwnSrcPropsOnDst({
        constructor: Panel,
        getChildren: function () {
            if (this.__panel_children === null) {
                this.__panel_children = new __UIElementChildList(this);
            }
            return this.__panel_children;
        },
        getHasChildren: function() {
            return this.__panel_children !== null && 0 < this.__panel_children.getCount();
        },
        __getUIElementTree_children_count: function () {
            if (this.__panel_children === null) return 0;
            return this.__panel_children.getCount();
        }, 
        __uiElementTree_children_get: function(i) {
            if (this.__panel_children === null) throw Error();
            return this.__panel_children.get(i);
        }
    }, Object.create(Panel_baseTypeProto));

    var SENTINEL = __isUIElement;
    var getOptionOnce = JsonMarkup.getOptionOnce;
    JsonMarkup.__addType("Panel", Panel, Panel_baseTypeName, function (instance, options) {
        var childOptions, i, n;
        var childOption;
        var child;
        var panel_children;
        if ((childOptions = getOptionOnce(options, "children", SENTINEL)) !== SENTINEL) {
            if (!isArrayLike_nonSparse(childOptions)) throw Error();
            panel_children = instance.getChildren();
            for (i = 0, n = childOptions.length; i < n; i++) {
                childOption = childOptions[i];
                if (childOption instanceof UIElement) child = childOption;
                else child = JsonMarkup.convertToObject(childOption, "UIElement");
                panel_children.add(child);
            }
        }
    });



    function __isUIElement(value) {
        return value instanceof UIElement;
    }

    function __UIElementChildList(owner) {
        if (!(owner instanceof UIElement)) throw Error();
        this.__owner = owner;
        List.call(this, {
            isItemValid: __isUIElement,
            canUseResetListChangeType: false
        });
    }
    function UIElementChildList() { throw Error(); }
    UIElementChildList.prototype = __UIElementChildList.prototype = setOwnSrcPropsOnDst({
        constructor: UIElementChildList,
        __onListChanging: function (e) {
            if (!(e instanceof ListChangeEventArgs)) throw Error();
            var newItems, i, n, oldItems;
            if (0 <= e.getOldIndex()) {
                oldItems = e.__oldItems;
                for (i = 0, n = oldItems.length; i < n; i++) {
                    if (oldItems[i].getIsFrozenInUIElementTree()) throw Error();
                }
            }
            if (0 <= e.getNewIndex()) {
                newItems = e.__newItems;
                for (i = 0, n = newItems.length; i < n; i++) {
                    if (newItems[i].getUIElementTree_parent() !== null
                        || newItems[i].getIsFrozenInUIElementTree()) throw Error();
                }
            }
        },
        __onListChanged: function (e) {
            if (!(e instanceof ListChangeEventArgs)) throw Error();
            var newItems, i, n, oldItems;
            if (0 <= e.getOldIndex()) {
                oldItems = e.__oldItems;
                for (i = 0, n = oldItems.length; i < n; i++) {
                    oldItems[i].__setUIElementTree_parent(null);
                }
            }
            if (0 <= e.getNewIndex()) {
                newItems = e.__newItems;
                for (i = 0, n = newItems.length; i < n; i++) {
                    newItems[i].__setUIElementTree_parent(this.__owner);
                }
            }
        }
    }, Object.create(List.prototype));

    setOwnSrcPropsOnDst({
        Panel: Panel,
        UIElementChildList: UIElementChildList
    }, window);


    var DockPanel_baseTypeName = "Panel";
    var DockPanel_baseTypeCtor = window[DockPanel_baseTypeName];
    var DockPanel_baseTypeProto = DockPanel_baseTypeCtor.prototype;
    function DockPanel() {
        DockPanel_baseTypeCtor.call(this);
        this.__dockPanel_lastChildFill = false;
    }
    DockPanel.prototype = setOwnSrcPropsOnDst({
        constructor: DockPanel,
        _arrangeCore2: function (arrangeSize) {
            var i, n1, n2, children, child;
            var left, top, right, bottom;
            var child_fr;
            var arrangeSize_x, arrangeSize_y;
            var j;
            if (!(arrangeSize instanceof Vector2)) throw Error();
            if (!this.getHasChildren()) return arrangeSize;
            children = this.getChildren();
            left = right = 0;
            top = bottom = 0;
            child_fr = new Rect2D();
            arrangeSize_x = arrangeSize.getX();
            arrangeSize_y = arrangeSize.getY();
            n1 = children.getCount();
            n2 = n1 - (this.getLastChildFill() ? 1 : 0);
            for (i = 0; i < n1; i++) {
                child = children.get(i);
                child_fr.assign(
                    left,
                    top,
                    maxDouble(0, arrangeSize_x - (left + right)),
                    maxDouble(0, arrangeSize_y - (top + bottom)));
                if (i < n2) {
                    switch (DockPanel_getDock(child)) {
                        case "left":
                            j = child.__getDesiredSize().getX();
                            left += j;
                            child_fr.setWidth(j);
                            break;
                        case "top":
                            j = child.__getDesiredSize().getY();
                            top += j;
                            child_fr.setHeight(j);
                            break;
                        case "right":
                            j = child.__getDesiredSize().getX();
                            right += j;
                            child_fr.setX(maxDouble(0, arrangeSize_x - right));
                            child_fr.setWidth(j);
                            break;
                        case "bottom":
                            j = child.__getDesiredSize().getY();
                            bottom += j;
                            child_fr.setY(maxDouble(0, arrangeSize_y - bottom));
                            child_fr.setHeight(j);
                            break;
                        default:
                            throw Error();
                    }
                }
                child.arrange(child_fr);
            }
            return arrangeSize;
        },
        getLastChildFill: function() {
            return this.__dockPanel_lastChildFill;
        },
        _measureCore2: function (constraintSize) {
            var i, n, children, child;
            var x1, x2;
            var y1, y2;
            if (!this.getHasChildren()) return new Vector2();
            children = this.getChildren();
            x1 = x2 = 0;
            y1 = y2 = 0;
            for (i = 0, n = children.getCount() ; i < n; i++) {
                child = children.get(i);
                child.measure(new Vector2(
                    maxDouble(0, constraintSize.getX() - x2),
                    maxDouble(0, constraintSize.getY() - y2)));
                switch (DockPanel_getDock(child)) {
                    case "left":
                    case "right":
                        y1 = maxDouble(y1, y2 + child.__getDesiredSize().getY());
                        x2 += child.__getDesiredSize().getX();
                        break;
                    case "top":
                    case "bottom":
                        x1 = maxDouble(x1, x2 + child.__getDesiredSize().getX());
                        y2 += child.__getDesiredSize().getY();
                        break;
                    default:
                        throw Error();
                }
            }
            return new Vector2(maxDouble(x1, x2), maxDouble(y1, y2));
        },
        __onPropertyChanged: function (e) {
            DockPanel_baseTypeProto.__onPropertyChanged.call(this, e);
            switch (e.getPropertyName()) {
                case "lastChildFill":
                    this.invalidateArrange();
                    break;
            }
        },
        setLastChildFill: function (value) {
            if (value === this.__dockPanel_lastChildFill) return;
            if (typeof value !== "boolean") throw Error();
            this.__dockPanel_lastChildFill = value;
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("lastChildFill", !value, value));
        }
    }, Object.create(DockPanel_baseTypeProto));

    var DockPanel_DOCK_PROPERTY = DependencyProperty.registerAttached({
        defaultValue: "left",
        nameQualifiedByOwnerTypeName: "DockPanel.dock",
        ownerTypeConstructor: DockPanel,
        isValidValue: function (value) {
            switch (value) {
                case "left":
                case "top":
                case "right":
                case "bottom":
                    return true;
            }
            return false;
        },
        onPropertyChanged: function (depObj, value) {
            var uiElem, uiElem_uiElemTreeParent;
            uiElem = depObj instanceof UIElement ? depObj : null;
            if (uiElem !== null) {
                uiElem_uiElemTreeParent = uiElem.getUIElementTree_parent();
                if (uiElem_uiElemTreeParent instanceof DockPanel) {
                    uiElem_uiElemTreeParent.invalidateMeasure();
                }
            }
        }
    });
    DockPanel.DOCK_PROPERTY = DockPanel_DOCK_PROPERTY;
    function DockPanel_getDock(depObj) {
        if (!(depObj instanceof DependencyObject)) throw Error();
        return depObj.__getValue(DockPanel_DOCK_PROPERTY);
    }
    DockPanel.getDock = DockPanel_getDock;
    DockPanel.setDock = function (depObj, value) {
        if (!(depObj instanceof DependencyObject)) throw Error();
        depObj.__setValue(DockPanel_DOCK_PROPERTY, value);
    };


    JsonMarkup.__addType("DockPanel", DockPanel, DockPanel_baseTypeName, function (instance, options) {
        var i;
        if ((i = getOptionOnce(options, "lastChildFill", SENTINEL)) !== SENTINEL) {
            instance.setLastChildFill(i);
        }
    });

    setOwnSrcPropsOnDst({
        DockPanel: DockPanel
    }, window);



    var Orientation_vertical = 0;
    var Orientation_horizontal = 1;
    var Orientation_toString = ["vertical", "horizontal"];
    var Orientation_parse = Orientation_createParseTable();
    function Orientation_createParseTable() {
        var i, t;
        t = {};
        for (i = Orientation_toString.length; 0 <= --i;) {
            t[Orientation_toString[i]] = i;
        }
        return t;
    }
    function Orientation_isValid(value) {
        return isIntegralDouble_nonNegative(value) && value < Orientation_toString.length;
    }

    var StackPanel_packedData1_orientation_offset = 0;
    var StackPanel_packedData1_orientation_mask = 1;
    var StackPanel_baseTypeName = "Panel";
    var StackPanel_baseTypeCtor = window[StackPanel_baseTypeName];
    var StackPanel_baseTypeProto = StackPanel_baseTypeCtor.prototype;
    function StackPanel() {
        StackPanel_baseTypeCtor.call(this);
        this.__stackPanel_packedData1 = 0;
    }
    StackPanel.prototype = setOwnSrcPropsOnDst({

        _arrangeCore2: function (availableSize) {
            var children, i, n;
            var child;
            var child_finalRect;
            var isHoriz;
            var d1, d2;
            if (!this.getHasChildren()) return availableSize;
            children = this.getChildren();
            isHoriz = this.__getOrientation() === Orientation_horizontal;
            child_finalRect = new Rect2D();
            n = children.getCount();
            i = 0;
            d2 = isHoriz ? availableSize.getY() : availableSize.getX();
            do {
                child = children.get(0);
                if (isHoriz) {
                    d1 = child.__getDesiredSize().getX();
                    child_finalRect.setWidth(d1);
                    child_finalRect.setHeight(maxDouble(child.__getDesiredSize().getY(), d2));
                    child_finalRect.setX(child_finalRect.getX() + d1);
                } else {
                    d1 = child.__getDesiredSize().getY();
                    child_finalRect.setWidth(maxDouble(child.__getDesiredSize().getX(), d2));
                    child_finalRect.setHeight(d1);
                    child_finalRect.setY(child_finalRect.getY() + d1);
                }
                child.arrange(child_finalRect);
            } while (++i < n);
            return availableSize;
        },
        getOrientation: function () {
            return Orientation_toString[this.__getOrientation()];
        },
        __getOrientation: function() {
            return (this.__stackPanel_packedData1 & StackPanel_packedData1_orientation_mask) >> StackPanel_packedData1_orientation_offset;
        },
        _measureCore2: function (availableSize) {
            var isHoriz;
            var children, i, n;
            var child;
            var w, h;
            var child_availableSize;
            if (!this.getHasChildren()) return new Vector2();
            children = this.getChildren();
            child = children.get(0);
            child.measure(availableSize);
            w = child.__getDesiredSize().getX();
            h = child.__getDesiredSize().getY();
            n = children.getCount();
            if (1 < n) {
                isHoriz = this.__getOrientation() === Orientation_horizontal;
                i = 1;
                child_availableSize = new Vector2();
                do {
                    child = children.get(i);
                    child_availableSize.assign(availableSize);
                    if (isHoriz) {
                        child_availableSize.setX(child_availableSize.getX() - w);
                        child.measure(child_availableSize);
                        w += child.__getDesiredSize().getX();
                        h = maxDouble(h, child.__getDesiredSize().getY());
                    } else {
                        child_availableSize.setY(child_availableSize.getY() - w);
                        child.measure(child_availableSize);
                        h += child.__getDesiredSize().getY();
                        w = maxDouble(w, child.__getDesiredSize().getX());
                    }
                } while (++i < n);
            }
            return new Vector2(w, h);
        },
        setOrientation: function (value) {
            if (!hasOwnPropertyFunction.call(Orientation_parse, value)) throw Error();
            this.__setOrientation(Orientation_parse[value]);
        },
        __setOrientation: function (value) {
            if (this.__getOrientation() === value) return;
            if (!Orientation_isValid(value)) throw Error();
            this.__stackPanel_packedData1 = (this.__stackPanel_packedData & ~StackPanel_packedData1_orientation_mask)
                | (value << StackPanel_packedData1_orientation_offset);
        }
    }, Object.create(StackPanel_baseTypeProto));


    setOwnSrcPropsOnDst({
        StackPanel: StackPanel
    }, window);

    

})();