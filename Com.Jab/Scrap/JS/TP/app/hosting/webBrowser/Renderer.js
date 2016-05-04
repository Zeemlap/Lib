(function () {
    


    var UIElement_DOM_UI_ELEMENT_PROPERTY = DependencyProperty.registerAttached({
        defaultValue: null,
        nameQualifiedByOwnerTypeName: "DomUIElement.value",
        ownerTypeConstructor: DomUIElement,
        isValidValue: function(value) {
            return value === null || value instanceof DomUIElement;
        }
    });
    function __DomUIElement_getDomUIElement(uiElement) {
        return uiElement.__getValue(UIElement_DOM_UI_ELEMENT_PROPERTY);
    }
    function __DomUIElement_setDomUIElement(uiElement, value) {
        uiElement.__setValue(UIElement_DOM_UI_ELEMENT_PROPERTY, value);
    }

    function __DomUIElement_getOrCreateForUIElement(uiElement) {
        var domUIElem;
        if (!(uiElement instanceof UIElement)) throw Error();
        if (uiElement.getIsDisposed()) return null;
        domUIElem = __DomUIElement_getDomUIElement(uiElement);
        if (domUIElem !== null) return domUIElem;
        if (uiElement instanceof ButtonBase) return new DomButtonBase(uiElement);
        if (uiElement instanceof ModalDialog) return new DomModalDialog(uiElement);
        if (uiElement instanceof ContentControl) return new DomContentControl(uiElement);         

        if (uiElement instanceof Menu) return new DomMenu(uiElement);
        if (uiElement instanceof MenuItem) return new DomMenuItem(uiElement);

        // For now we don't create a class for any panel subclass, but rather use the common subtype.
        if (uiElement instanceof Panel) return new DomPanel(uiElement);

        if (uiElement instanceof FrameworkElement) return new DomFrameworkElement(uiElement);
        return new DomUIElement(uiElement);
    }
    function __DomUIElement_getOrCreateForUIElementList(uiElemList) {
        var i, n, array;
        if (!isArrayLike_nonSparse(uiElemList)) throw Error();
        n = uiElemList.length;
        array = new Array(n);
        for (i = 0; i < n; i++) {
            array[i] = __DomUIElement_getOrCreateForUIElement(uiElemList[i]);
        }
        return array;
    }

    function DomUIElement(uiElem) {
        var d;
        if (!(uiElem instanceof UIElement)
            || uiElem.getIsDisposed()
            || __DomUIElement_getDomUIElement(uiElem) !== null) throw Error();
        this.__uiElem = uiElem;
        this.__rootHostElem = document.createElement("div");
        this.__rootHostElem_offsetFromVisualTransform = new Vector2();
        d = hostObject_initializeData(this.__rootHostElem);
        d.uiElement = this;
        uiElem.addEventHandler("propertyChanged", this.__uiElem_onPropertyChanged, this);
        uiElem.addEventHandler("layoutUpdated", this.__uiElem_onLayoutUpdated, this);
        uiElem.addEventHandler("disposed", this.__uiElem_onDisposed, this);
        setOwnSrcPropsOnDst({
            position: "absolute",
            boxSizing: "content-box"
        }, this.__rootHostElem.style);
        __DomUIElement_setDomUIElement(uiElem, this);
        this.__pushVisibilityToDom("visible", uiElem.getVisibility());
        this.__initializeCssClasses();
        this.__pushLayoutToDom(uiElem.__getRenderSize(), uiElem.__getVisualOffset(), null, uiElem._getVisualTransform());
        if (uiElem.getUIElementTree_parent() !== null) {
            this.__pushUIElementTreeParentToDom(null, uiElem.getUIElementTree_parent());
        }
    }
    DomUIElement.prototype = {
        _getUIElement: function () {
            if (this.__uiElem === null) throw Error();
            return this.__uiElem;
        },
        _getRootHostElement: function() {
            return this.__rootHostElem;
        },
        _getChildContainerHostElement: function() {
            return this._getRootHostElement();
        },
        __initializeCssClasses: function () {
            var rhe, cssClasses, i;
            var uiElem;
            rhe = this._getRootHostElement();
            uiElem = this._getUIElement();
            cssClasses = [];
            i = 0;
            cssClasses[i++] = "ui";
            if (uiElem.getIsMouseOver()) cssClasses[i++] = "mouse-over";
            if (uiElem.getIsMouseDirectlyOver()) cssClasses[i++] = "mouse-dir-over";
            if (uiElem.getHasMouseCapture()) cssClasses[i++] = "mouse-capture";
            HostElement_cssClasses_addRange(rhe, cssClasses);
        },
        __pushLayoutToDom: function (newRenderSize, newVisualOffset, oldVisualTransform, newVisualTransform) {
            var rhe_s;
            var didVisualTransformChange;
            didVisualTransformChange = oldVisualTransform !== newVisualTransform;
            if (didVisualTransformChange) {
                if (oldVisualTransform !== null) {
                    oldVisualTransform.removeEventHandler("changed", this.__uiElem_onVisualTransformChanged, this);
                }
                if (newVisualTransform !== null) {
                    newVisualTransform.addEventHandler("changed", this.__uiElem_onVisualTransformChanged, this);
                }
                this.__pushVisualTransformAndOffsetToDom(newVisualOffset === null 
                    ? this._getUIElement().__getVisualOffset()
                    : newVisualOffset,
                    newVisualTransform);
            }
            rhe_s = this._getRootHostElement().style;
            if (newRenderSize !== null) {
                rhe_s.width = formatCssLength(newRenderSize.getX(), "px");
                rhe_s.height = formatCssLength(newRenderSize.getY(), "px");
            }
            if (!didVisualTransformChange && newVisualOffset !== null) {
                rhe_s.left = formatCssLength(newVisualOffset.getX() + this.__rootHostElem_offsetFromVisualTransform.getX(), "px");
                rhe_s.top = formatCssLength(newVisualOffset.getY() + this.__rootHostElem_offsetFromVisualTransform.getY(), "px");
            }
        },
        __pushUIElementTreeParentToDom: function (oldValue, newValue) {
            var cche;
            var domUIElement_parent;
            assert((oldValue !== null) || (newValue !== null));
            cche = domUIElement_parent._getChildContainerHostElement();
            if (newValue !== null) {
                domUIElement_parent = __DomUIElement_getOrCreateForUIElement(newValue);
                cche.appendChild(newValue._getRootHostElement());
            } else {
                domUIElement_parent = __DomUIElement_getDomUIElement(oldValue);
                cche.removeChild(this._getRootHostElement());
            }
        },
        __pushVisibilityToDom: function (oldValue, newValue) {
            var rhe_s;
            rhe_s = this._getRootHostElement().style;
            switch (oldValue) {
                case "visible": break;
                case "hidden": rhe_s.visibility = ""; break;
                case "collapsed": rhe_s.display = ""; break;
                default: throw Error();
            }
            switch (newValue) {
                case "visible": break;
                case "hidden": rhe_s.visibility = "hidden"; break;
                case "collapsed": rhe_s.display = "none"; break;
                default: throw Error();
            }
        },
        __pushVisualOffsetAndTransformToDom: function (visualOffset, visualTransform) {
            var rhe, rhe_s;
            var visualTransformMatrix;
            var v, x, y;
            if (visualTransform === null || visualTransform.getIsIdentity()) {
                visualTransformMatrix = null;
            } else {
                visualTransformMatrix = visualTransform.toMatrix();
            }
            rhe = this._getRootHostElement();
            this.__rootHostElem_offsetFromVisualTransform = v = HostElement_setTransform(rhe, visualTransformMatrix);
            rhe_s = rhe.style;
            if (v === null) x = y = 0;
            else {
                x = v.getX();
                y = v.getY();
            }
            rhe_s.left = formatCssLength(offset.getX() + x, "px");
            rhe_s.top = formatCssLength(offset.getY() + y, "px");
        },
        __uiElem_onDisposed: function (sender, e) {
            this.__uiElem.removeEventHandler("propertyChanged", this.__uiElem_onPropertyChanged, this);
            HostElement_setParentToNull(this._getRootHostElement());
            hostObject_deleteData(this._getRootHostElement());
            this.__rootHostElem = null;
            __DomUIElement_setDomUIElement(this.__uiElem, null);
            this.__uiElem = null;
        },
        __uiElem_onLayoutUpdated: function(sender, e) {
            this.__pushLayoutToDom(e.__getNewRenderSize(), e.__getNewVisualOffset(), e.getOldVisualTransform(), e.getNewVisualTransform());
        },
        __uiElem_onPropertyChanged: function (sender, e) {
            switch (e.getPropertyName()) {
                case "hasMouseCapture":
                    HostElement_setHasCssClass(this._getRootHostElement(), "mouse-capture", e.__getNewValue());
                    break;
                case "isMouseDirectlyOver":
                    HostElement_setHasCssClass(this._getRootHostElement(), "mouse-dir-over", e.__getNewValue());
                    break;
                case "isMouseOver":
                    HostElement_setHasCssClass(this._getRootHostElement(), "mouse-over", e.__getNewValue());
                    break;
                case "uiElementTree_parent":
                    this.__pushUIElementTreeParentToDom(e.__getOldValue(), e.__getNewValue());
                    break;
                case "visibility":
                    this.__pushVisibilityToDom(e.__getOldValue(), e.__getNewValue());
                    break;
            }                                                     
        },
        __uiElem_onVisualTransformChanged: function (sender, e) {
            var v, uiElem;
            uiElem = this._getUIElement();
            v = uiElem._getVisualTransform();
            this.__pushVisualOffsetAndTransformToDom(uiElem.__getVisualOffset(), v);
        }
    };
    DomUIElement.__getDomUIElement = __DomUIElement_getDomUIElement;

    var DomFrameworkElement_baseTypeCtor = DomUIElement;
    var DomFrameworkElement_baseTypeProto = DomFrameworkElement_baseTypeCtor.prototype;
    function DomFrameworkElement(frameworkElement) {
        if (!(frameworkElement instanceof FrameworkElement)) throw Error();
        DomFrameworkElement_baseTypeCtor.call(this, frameworkElement);
        HostElement_cssClasses_addRange(this._getRootHostElement(), "fr");
    }
    DomFrameworkElement.prototype = setOwnSrcPropsOnDst({
    }, Object.create(DomFrameworkElement_baseTypeProto));


    function DomContentControl_pushContentOrHeaderToDom(cche, oldValue, newValue) {
        var tn;
        if (oldValue !== null && !(oldValue instanceof UIElement)) {
            tn = cche.firstChild;
            assert(cche.lastChild === tn && tn.nodeType === 3);
        }
        if ((newValue === null || newValue instanceof UIElement) && tn !== undefined) {
            cche.removeChild(tn);
        }
        if (newValue instanceof UIElement) {
            __DomUIElement_getOrCreateForUIElement(newValue);
        } else if (newValue !== null) {
            if (tn === undefined) {
                assert(cche.firstChild === null);
                cche.appendChild(document.createTextNode(newValue + ""));
            } else {
                tn.nodeValue = newValue + "";
            }
        }
    }

    var DomContentControl_baseTypeCtor = DomFrameworkElement;
    var DomContentControl_baseTypeProto = DomContentControl_baseTypeCtor.prototype;
    function DomContentControl(contentControl) {
        if (!(contentControl instanceof ContentControl)) throw Error();
        DomContentControl_baseTypeCtor.call(this, contentControl);
        HostElement_cssClasses_addRange(this._getRootHostElement(), "cc");
        DomContentControl_pushContentOrHeaderToDom(this._getChildContainerHostElement(), null, contentControl.getContent());
    }
    DomContentControl.prototype = setOwnSrcPropsOnDst({
        __uiElem_onPropertyChanged: function (sender, e) {
            DomContentControl_baseTypeProto.__uiElem_onPropertyChanged.call(this, sender, e);
            switch (e.getPropertyName()) {
                case "content":
                    DomContentControl_pushContentOrHeaderToDom(this._getChildContainerHostElement(), e.__getOldValue(), e.__getNewValue());
                    break;
            }
        },
        __pushContentToDom: function (oldValue, newValue) {
        }
    }, Object.create(DomContentControl_baseTypeProto));


    var DomButtonBase_baseTypeCtor = DomContentControl;
    var DomButtonBase_baseTypeProto = DomButtonBase_baseTypeCtor.prototype;
    function DomButtonBase(buttonBase) {
        if (!(buttonBase instanceof ButtonBase)) throw Error();
        DomButtonBase_baseTypeCtor.call(this, buttonBase);
        HostElement_cssClasses_addRange(this._getRootHostElement(), "bb");
        if (buttonBase.getIsPressed()) HostElement_cssClasses_addRange(this._getRootHostElement(), "pressed");
    }
    DomButtonBase.prototype = setOwnSrcPropsOnDst({
        __uiElem_onPropertyChanged: function (sender, e) {
            DomButtonBase_baseTypeProto.__uiElem_onPropertyChanged.call(this, sender, e);
            switch (e.getPropertyName()) {
                case "isPressed":
                    HostElement_setHasCssClass(this._getRootHostElement(), "pressed", e.getNewValue());
                    break;
            }
        }
    }, Object.create(DomButtonBase_baseTypeProto));


    var DomPanel_baseTypeCtor = DomFrameworkElement;
    var DomPanel_baseTypeProto = DomPanel_baseTypeCtor.prototype;
    function DomPanel(panel) {
        if (!(panel instanceof Panel)) throw Error();
        DomPanel_baseTypeCtor.call(this, panel);
        HostElement_cssClasses_addRange(this._getRootHostElement(), "panel");
        panel.getChildren().addEventHandler("listChanged", this.__panel_onChildrenChanged, this);
        __DomUIElement_getOrCreateForUIElementList(panel.getChildren().__items);
    }
    DomPanel.prototype = setOwnSrcPropsOnDst({
        __panel_onChildrenChanged: function (sender, e) {
            if (0 <= e.getNewIndex()) {
                __DomUIElement_getOrCreateForUIElementList(e.__newItems);
            }
        },
        __uiElem_onDisposed: function (sender, e) {
            this._getUIElement().getChildren().removeEventHandler("listChanged", this.__panel_onChildrenChanged, this);
            DomPanel_baseTypeProto.__uiElem_onDisposed.call(this, sender, e);
        }
    }, Object.create(DomPanel_baseTypeProto));

    var DomMenu_baseTypeCtor = DomFrameworkElement;
    var DomMenu_baseTypeProto = DomMenu_baseTypeCtor.prototype;
    function DomMenu(menu) {
        if (!(menu instanceof Menu)) throw Error();
        DomMenu_baseTypeCtor.call(this, menu);
        HostElement_cssClasses_addRange(this._getRootHostElement(), "menu");
        __DomUIElement_getOrCreateForUIElement(menu.__menu_panel);
    }
    DomMenu.prototype = setOwnSrcPropsOnDst({
    }, Object.create(DomMenu_baseTypeProto));


    var MenuItemRole_toCssClass = {
        "topLevelItem": "top-level-item",
        "topLevelHeader": "top-level-header",
        "submenuItem": "submenu-item",
        "submenuHeader": "submenu-header"
    };
    var DomMenuItem_baseTypeCtor = DomFrameworkElement;
    var DomMenuItem_baseTypeProto = DomMenuItem_baseTypeCtor.prototype;
    function DomMenuItem(menuItem) {
        var items;
        if (!(menuItem instanceof MenuItem)) throw Error();
        this.__headerHostElem = null;
        DomMenuItem_baseTypeCtor.call(this, menuItem);
        this.__menuItem_initializeDom();
        items = menuItem.getItems();
        items.addEventHandler("listChanged", this.__itemsControl_itemsChanged, this);
        __DomUIElement_getOrCreateForUIElementList(items.__items);    
        this.__menuItem_initializeCssClasses();
        DomContentControl_pushContentOrHeaderToDom(this._getChildContainerHostElement(), null, menuItem.getHeader());
    }
    DomMenuItem.prototype = setOwnSrcPropsOnDst({
        __itemsControl_itemsChanged: function (sender, e) {
            if (0 <= e.getNewIndex()) {
                __DomUIElement_getOrCreateForUIElementList(e.__newItems);
            }
        },
        _getChildContainerHostElement: function() {
            return this.__headerHostElem;
        },
        __menuItem_initializeCssClasses: function () {
            var cssClasses, i;
            var menuItem;
            menuItem = this._getUIElement();
            cssClasses = [];
            i = 0;
            cssClasses[i++] = "mi";
            if (menuItem.getIsCheckable()) cssClasses[i++] = "checkable";
            if (menuItem.getIsChecked()) cssClasses[i++] = "checked";
            if (menuItem.getIsHighlighted()) cssClasses[i++] = "highlighted";
            if (menuItem.getIsSubmenuOpen()) cssClasses[i++] = "submenu-open";
            cssClasses[i++] = MenuItemRole_toCssClass[menuItem.getRole()];
            HostElement_cssClasses_addRange(this._getRootHostElement(), cssClasses);
        },
        __menuItem_initializeDom: function () {
            var i, rhe;
            rhe = this._getRootHostElement();

            i = document.createElement("span");
            HostElement_cssClasses_addRange(i, "mi-check");
            rhe.appendChild(i);

            this.__headerHostElem = document.createElement("span");
            HostElement_cssClasses_addRange(this.__headerHostElem, "mi-header");
            rhe.appendChild(this.__headerHostElem);

            i = document.createElement("span");
            HostElement_cssClasses_addRange(i, "mi-arrow");
            rhe.appendChild(i);
        },
        __submenu_initializeDom: function() {
            var outerList, innerList, shadow;
            var items, i, n;
            var hostUtilities, docNode;
            hostUtilities = HostUtilities.fromHostContext(window);
            docNode = hostUtilities.getDocNode();
            outerList = HostElement_cssClasses_addRange(docNode.createElement("div"), "menu-item-list-outer");
            shadow = HostElement_cssClasses_addRange(docNode.createElement("div"), "menu-item-list-shadow");
            outerList.appendChild(shadow);
            innerList = HostElement_cssClasses_addRange(docNode.createElement("div"), "menu-item-list-inner");
            items = this.__menuItem_items;
            assert(items !== null);
            for (i = 0, n = items.getCount() ; i < n; i++) {
                innerList.appendChild(commonMenuItem_getHostElement(items.get(i)));
            }
            outerList.appendChild(innerList);
            this.__menuItem_hostElemInnerSubmenu = innerList;
            this.__menuItem_hostElemOuterSubmenu = outerList;
            outerList.style.visibility = "hidden";
            hostObject_initializeData(outerList).uiElement = this.__menuItem_uiElemSubmenu;
            hostUtilities.getBodyElem().appendChild(outerList);
        },
        __uiElem_onDisposed: function (sender, e) {
            var uiElem;
            uiElem = this._getUIElement();
            uiElem.getItems().removeEventHandler("listChanged", this.__itemsControl_itemsChanged, this);
            DomMenuItem_baseTypeProto.__uiElem_onDisposed.call(this, sender, e);
        },

        __uiElem_onPropertyChanged: function (sender, e) {
            var rhe;
            DomMenuItem_baseTypeProto.__uiElem_onPropertyChanged.call(this, sender, e);
            switch (e.getPropertyName()) {
                case "header":
                    DomContentControl_pushContentOrHeaderToDom(this._getChildContainerHostElement(), e.__getOldValue(), e.__getNewValue());
                    break;
                case "highlighted":
                    HostElement_setHasCssClass(this._getRootHostElement(), "highlighted", e.getNewValue());
                    break;
                case "isCheckable":
                    HostElement_setHasCssClass(this._getRootHostElement(), "checkable", e.getNewValue());
                    break;
                case "isChecked":
                    HostElement_setHasCssClass(this._getRootHostElement(), "checked", e.getNewValue());
                    break;
                case "isSubmenuOpened":
                    HostElement_setHasCssClass(this._getRootHostElement(), "submenu-opened", e.getNewValue());
                    break;
                case "role":
                    rhe = this._getRootHostElement();
                    HostElement_cssClasses_removeRange(rhe, MenuItemRole_toCssClass[e.__getOldValue()]);
                    HostElement_cssClasses_addRange(rhe, MenuItemRole_toCssClass[e.__getNewValue()]);
                    break;
                case "selected":
                    HostElement_setHasCssClass(this._getRootHostElement(), "selected", e.getNewValue());
                    break;                                                              
            }
        }
    }, Object.create(DomMenuItem_baseTypeProto));


    var DomPopup_baseTypeCtor = DomFrameworkElement;
    var DomPopup_baseTypeProto = DomPopup_baseTypeCtor.prototype;
    function DomPopup(popup) {
        if (!(popup instanceof Popup)) throw Error();
        DomFrameworkElement.call(this, popup);
    }
    DomPopup.prototype = setOwnSrcPropsOnDst({
        __uiElem_onPropertyChanged: function (sender, e) {
            var pt_uiElem;
            var pt_rootUIElem;
            var pt_rootDomUIElem;
            var this_he;
            DomPopup_baseTypeProto.__uiElem_onPropertyChanged.call(this, sender, e);
            switch (e.getPropertyName()) {
                case "child":
                    __DomUIElement_getOrCreateForUIElement(e.__getNewValue());
                    break;
                case "horizontalOffset":
                case "placement":
                case "placementTarget":
                case "verticalOffset":
                    this.__update();
                    break;
            }
        },
        __update: function () {
            var placementTarget_uiElem;
            var placementTarget_hostElem;
            var placementTarget_hostElem_vpRect;
            var popup;
            popup = this._getUIElement();
            placementTarget_uiElem = popup.getPlacementTarget();
            if (placementTarget_uiElem === null) return;
            placementTarget_hostElem = __DomUIElement_getDomUIElement(placementTarget_uiElem)._getRootHostElement();
            placementTarget_hostElem_vpRect = HostElement_getBoundingRect_viewport(placementTarget_hostElem);

            menuPlacement_heRelToHoriz_vpRect = HostElement_getRect_viewport(heItem);
            menuPlacement_heRelToVert_vpRect = menuPlacement_heRelToVert === menuPlacement_heRelToHoriz
                ? menuPlacement_heRelToHoriz_vpRect
                : HostElement_getRect_viewport(menuPlacement_heRelToVewrt);

            var heSubmenu, heSubmenu_vpRect, vpSize;
            heSubmenu = this.__menuItem_hostElemOuterSubmenu;
            assert(heSubmenu !== null);
            heSubmenu_vpRect = new Rect2D(0, 0, heSubmenu.offsetWidth, heSubmenu.offsetHeight);
            hostUtilities = HostUtilities.fromHostElement(heItem);
            vpSize = hostUtilities.getSize_viewport();
            if (menuPlacement === "right") {
                heSubmenu_vpRect.setX(menuPlacement_heRelToHoriz_vpRect.getRight() + menuPlacement_offsetX);
                if (vpSize.getX() < heSubmenu_vpRect.getRight()) {
                    // The menu is too far to the right, try placing it on the left instead.
                    heSubmenu_vpRect.setX(menuPlacement_heRelToHoriz_vpRect.getX() - heSubmenu_vpRect.getWidth());
                }
                heSubmenu_vpRect.setY(menuPlacement_heRelToVert_vpRect.getY());
                if (vpSize.getY() < heSubmenu_vpRect.getBottom()) {
                    // The menu is too far to the bottom, align its bottom with the bottom of the viewport.
                    heSubmenu_vpRect.setY(vpSize.getY() - heSubmenu_vpRect.getHeight());
                }
            } else if (menuPlacement === "bottom") {
                heSubmenu_vpRect.setY(menuPlacement_heRelToVert_vpRect.getBottom() + menuPlacement_offsetY);
                if (vpSize.getY() < heSubmenu_vpRect.getBottom()) {
                    heSubmenu_vpRect.setY(menuPlacement_heRelToVert_vpRect.getY() - heSubmenu_vpRect.getHeight());
                }
                heSubmenu_vpRect.setX(menuPlacement_heRelToHoriz_vpRect.getX());
                if (vpSize.getX() < heSubmenu_vpRect.getRight()) {
                    heSubmenu_vpRect.setX(vpSize.getX() - heSubmenu_vpRect.getWidth());
                }
            } else {
                throw Error();
            }
            var v = heSubmenu_vpRect.getTopLeft();
            hostUtilities.transform_viewportToViewportContent(v);
            hostUtilities.transform_viewportContentToBodyElemContent(v);
            heSubmenu.style.left = v.getX() + "px";
            heSubmenu.style.top = v.getY() + "px";
        }

    }, Object.create(DomPopup_baseTypeProto));


    function DomModalDialog() {
        this.__hostElem = document.createElement("div");
    }
    DomModalDialog.prototype = {
        __ensurePopupLayerHostElem: function () {
            throw Error();
        }
    };
    setOwnSrcPropsOnDst({                                
        DomUIElement: DomUIElement,
        DomFrameworkElement: DomFrameworkElement,
        DomContentControl: DomContentControl,
        DomModalDialog: DomModalDialog,
        DomButtonBase: DomButtonBase,
        DomMenu: DomMenu,
        DomMenuItem: DomMenuItem
    }, window);


    var DomRootUIElement_baseTypeCtor = DomContentControl;
    var DomRootUIElement_baseTypeProto = DomRootUIElement_baseTypeCtor.prototype;
    function DomRootUIElement() {
        var rootUIElem, hostUtil;
        rootUIElem = RootUIElement.getInstance();
        hostUtil = rootUIElem.__getHostUtilities();
        DomRootUIElement_baseTypeCtor.call(this, rootUIElem);
        hostUtil.getBodyElem().appendChild(this._getRootHostElement());
        this.__popupLayerHostElem = null;
        hostUtil.addEventHandler("propertyChanged", this.__hostUtil_propChanged, this);
        this.__arrange(hostUtil.getSize_viewport());
    }
    DomRootUIElement.prototype = setOwnSrcPropsOnDst({
        __arrange: function (v) {
            this._getUIElement().arrange(new Rect2D(0, 0, v.getX(), v.getY()));
        },
        __ensurePopupLayerHostElem: function (fCreate) {
            var he;
            he = this.__popupLayerHostElem;
            if (he !== null) return he;
            he = this.__popupLayerHostElem = document.createElement("div");
            setOwnSrcPropsOnDst({
                position: "fixed",
                width: "100%",
                height: "100%"
            }, he.style);
            this._getChildContainerHostElement().appendChild(he);
            return he;
        },
        __getPopupLayerHostElem: function () {
            return this.__popupLayerHostElem;
        },
        __hostUtil_propChanged: function (sender, e) {
            switch (e.getPropertyName()) {
                case "size_viewport":
                    this.__arrange(e.__getNewValue());
                    break;
            }
        }
    }, Object.create(DomRootUIElement_baseTypeProto));

    new DomRootUIElement();
})();
