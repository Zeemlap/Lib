(function () {
                    
    var SUBMENU_SHOW_HIDE_DELAY = 400;
    var undefined;
    var hasOwnPropertyFunction = Object.prototype.hasOwnProperty;
    var Menu_packedData_isInMenuMode_mask = 0x0000001;
    var Menu_packedData_shouldOpenOnMouseEnter_mask = 0x0000002;

    // This implementation is incompatible with multiple mouses, although supported by the input and UIElement API.

    var Menu_baseTypeName = "FrameworkElement";
    var Menu_baseTypeCtor = window[Menu_baseTypeName];
    var Menu_baseTypeProto = Menu_baseTypeCtor.prototype;

    function Menu() {
        this.__menu_panel = null;
        Menu_baseTypeCtor.call(this);
        this.__menu_items = null;
        this.__menu_currentSelection = null;
        this.__menu_packedData = 0;
        this.__menu_panel = new Panel();
        this.__menu_panel.__setUIElementTree_parent(this);
    }
    Menu.prototype = setOwnSrcPropsOnDst({
        constructor: Menu,
        __getCurrentSelection: function () {
            return this.__menu_currentSelection;
        },
        __getHasItems: function() {
            return this.__menu_items !== null && 0 < this.__menu_items.getCount();
        },
        __getIsInMenuMode: function () {
            return (this.__menu_packedData & Menu_packedData_isInMenuMode_mask) !== 0;
        },
        getItems: function () {
            if (this.__menu_items === null) {
                this.__menu_items = new CommonMenuItemList();
                this.__menu_items.__addEventHandler("listChanged", this.__onItemsChanged, this);
            }
            return this.__menu_items;
        },
        __getShouldOpenOnMouseEnter: function() {
            return (this.__menu_packedData & Menu_packedData_shouldOpenOnMouseEnter_mask) !== 0;
        },
        __getUIElementTree_children_count: function() {
            return this.__menu_panel !== null ? 1 : 0;
        },
        __handleMouseDownUp: function (e) {
            var e_src;
            if (e.getIsHandled()) return;
            if (e.getChangedButton() !== 1 && e.getChangedButton() !== 3) return;
            e_src = e.getSource();
            if (e_src !== this) return;
            this.__setIsInMenuMode(false);
            e.setIsHandled(true);
        },
        __handleMouseDownUpOutsideCaptureUIElement: function (e) {
            if (e.getIsHandled()) return;
            if (e.getChangedButton() !== 1 && e.getChangedButton() !== 3) {
                return;
            }
            this.__setIsInMenuMode(false);
        },
        _onClick: function (e) {
            var r, e_src;
            e_src = e.getSource();
            if (e_src instanceof MenuItem && !e_src.getShouldStayOpenOnClick()) {
                r = e_src.__getRole();
                if ((r & MenuItemRole_type_mask) === MenuItemRole_type_item) {
                    this.__setIsInMenuMode(false);
                }
            }
        },
        __onItemIsSelectedChanged: function (MenuItem) {
            var cs;
            cs = this.__getCurrentSelection();
            if (MenuItem.__getIsSelected()) {
                if (cs !== MenuItem) {
                    if (cs !== null) {
                        cs.setIsSubmenuOpen(false);
                    }
                    this.__setCurrentSelection(MenuItem);
                }
            } else {
                if (cs === MenuItem) {
                    this.__setCurrentSelection(null);
                }
            }
        },
        __onItemsChanged: function (sender, e) {
            MenuOrMenuItem_onItemsChanged(this, e);
        },
        __onLostMouseCapture: function (e) {
            var md, cUIElem, flag;
            if (e.getIsHandled()) return;
            md = e.getMouseDevice();
            if (md !== MouseDevice.getPrimary()) return;
            cUIElem = md.getCaptureUIElement();
            assert(this !== e.getSource() || cUIElem !== this);
            if (this === e.getSource()) {
                if (cUIElem === null || !cUIElem.uiElementTree_isAncestorOf(this)) {
                    // If the lost mouse capture event was raised because this Menu lost 
                    // mouse capture and this Menu is not a descendant of the UI element 
                    // with capture then exit Menu mode.
                    this.__setIsInMenuMode(false);
                }
            } else if (this.uiElementTree_isAncestorOf(e.getSource())) {
                // If the lost mouse capture event was raised because a descendent lost
                // mouse capture then we attempt to recapture the mouse.
                if (this.__getIsInMenuMode() && cUIElem === null && !md.getIsCaptureNotKnownByScriptEnvironment()) {
                    flag = md.setCaptureUIElement(this, "uiElementSubtree");
                    assert(flag);
                    e.setIsHandled(true);
                    return;
                }
            } else {
                this.__setIsInMenuMode(false);
            }

        },
        __onMouseDown: function (e) {
            this.__handleMouseDownUp(e);
        },
        __onMouseUp: function (e) {
            this.__handleMouseDownUp(e);
        },
        __onPreviewMouseDownOutsideCaptureUIElement: function (e) {
            assert(this.getHasMouseCapture(e.getMouseDevice()));
            this.__handleMouseDownUpOutsideCaptureUIElement(e);
        },
        __onPreviewMouseUpOutsideCaptureUIElement: function (e) {
            assert(this.getHasMouseCapture(e.getMouseDevice()));
            this.__handleMouseDownUpOutsideCaptureUIElement(e);
        },
        __setCurrentSelection: function(value) {
            var cs;
            if (value !== null && (!(value instanceof MenuItem) || value.__getLogicalParent() !== this)) throw Error();
            // TODO TRANSFER ANY KEYBOARD FOCUS TO THE NEW ELEMENT!
            cs = this.__getCurrentSelection();
            if (cs !== null) {
                cs.__setIsSelected(false);
            }
            this.__menu_currentSelection = value;
            if (value !== null) {
                value.__setIsSelected(true);
            }
        },
        __setIsInMenuMode: function (value) {
            var mouseDevice_primary, i;
            if (value === this.__getIsInMenuMode()) return;
            if (typeof value !== "boolean") throw Error();
            if (value) {
                this.__menu_packedData |= Menu_packedData_isInMenuMode_mask;
                mouseDevice_primary = MouseDevice.getPrimary();
                i = mouseDevice_primary.getCaptureUIElement();
                if ((i === null || (this !== i && !this.uiElementTree_isAncestorOf(i)))
                    && !this.captureMouse(mouseDevice_primary, "uiElementSubtree")) {
                    value = false;
                } 
            }
            if (!value) {
                this.__menu_packedData &= ~Menu_packedData_isInMenuMode_mask;
                // Not implemented.
                i = this.__getCurrentSelection();
                if (i !== null) {
                    i.setIsSubmenuOpen(false);
                    this.__setCurrentSelection(null);
                }
                this.releaseMouseCapture();
            }
            this.__setShouldOpenOnMouseEnter(value);
        },
        __setShouldOpenOnMouseEnter: function (value) {
            if (typeof value !== "boolean") throw Error();
            this.__menu_packedData = value
                ? (this.__menu_packedData | Menu_packedData_shouldOpenOnMouseEnter_mask)
                : (this.__menu_packedData & ~Menu_packedData_shouldOpenOnMouseEnter_mask);
        },
        __uiElementTree_children_get: function (i) {
            if (this.__menu_panel === null || i !== 0) throw Error();
            return this.__menu_panel;
        }
    }, Object.create(Menu_baseTypeProto));

    
    var getOptionOnce = JsonMarkup.getOptionOnce;
    var INTERNAL_SENTINEL = __MenuItemRole_isValid;
    JsonMarkup.__addType("Menu", Menu, Menu_baseTypeName, function (instance, options) {
        var i;
        if ((i = getOptionOnce(options, "items", INTERNAL_SENTINEL)) !== INTERNAL_SENTINEL) {
            MenuOrMenuItem_createAndAppendCommonMenuItems_fromCommonMenuItemOptionList(instance, i);
        }
    });



    var MenuItemRole_topLevelItem = 0;
    var MenuItemRole_topLevelHeader = 1;
    var MenuItemRole_submenuItem = 2;
    var MenuItemRole_submenuHeader = 3;

    var MenuItemRole_isNotTopLevel_mask = 2;
    var MenuItemRole_type_mask = 1;
    var MenuItemRole_type_header = 1;
    var MenuItemRole_type_item = 0;
    var MenuItemRole_mask = 3;
    var MenuItemRole_toString = [ "topLevelItem", "topLevelHeader", "submenuItem", "submenuHeader" ];
    var __MenuItemRole_isValid = function (value) {
        switch (value) {
            case MenuItemRole_topLevelItem:
            case MenuItemRole_topLevelHeader:
            case MenuItemRole_submenuItem:
            case MenuItemRole_submenuHeader:
                return true;
        }
        return false;
    };

    var MenuItem_packedData_isSubmenuOpen_mask = 0x0000001;
    var MenuItem_packedData_hasOwner_mask = 0x0000002;
    var MenuItem_packedData_isCheckable_mask = 0x0000004;
    var MenuItem_packedData_isChecked_mask = 0x0000008;
    var MenuItem_packedData_shouldStayOpenOnClick_mask = 0x000010;
    var MenuItem_packedData_isSelected_mask = 0x0000020;
    var MenuItem_packedData_isHighlighted_mask = 0x0000040;
    var MenuItem_packedData_isPressed_mask = 0x0000080;
    var MenuItem_packedData_role_offset = 8;
    var MenuItem_packedData_role_mask = MenuItemRole_mask << MenuItem_packedData_role_offset;
                      
    var MenuItem_baseTypeName = "FrameworkElement";
    var MenuItem_baseTypeCtor = window[MenuItem_baseTypeName];
    var MenuItem_baseTypeProto = MenuItem_baseTypeCtor.prototype;

    function MenuItem() {
        MenuItem_baseTypeCtor.call(this);
        this.__menuItem_packedData = 0;
        this.__menuItem_items = null;
        this.__menuItem_header = null;
        this.__menuItem_currentSelection = null;
        this.__menuItem_uiElemSubmenu = null;
        this.__menuItem_openSubmenuIfThisRoleTypeIsHeader_task = null;
        this.__menuItem_closeSubmenu_task = null;
    }
    MenuItem.prototype = setOwnSrcPropsOnDst({
        constructor: MenuItem,
        __clickHeader: function () {
            var lp;
            this.__focusOrSelect();
            if (this.getIsSubmenuOpen()) {
                if (this.__getRole() === MenuItemRole_topLevelHeader) {
                    lp = this.__getLogicalParent();
                    assert(lp instanceof Menu);
                    lp.__setIsInMenuMode(false);
                    return;
                }
            } else {
                this.__openSubmenu();
            }
        },
        __clickItem: function () {
            var uiElements;
            uiElements = this.getUIElementTree_selfAndAncestors();
            this.raiseEvent("click", new RoutedEventArgs());
        },
        __closeSubmenu_timer_onTick: function () {
            this.__menuItem_closeSubmenu_task = null;
            this.__setIsSelected(false);
        },
        __closeSubmenu_timer_set: function () {
            if (this.__menuItem_closeSubmenu_task !== null) {
                this.__menuItem_closeSubmenu_task.dispose();
            }
            this.__menuItem_closeSubmenu_task = Dispatcher
                .getInstance()
                .runAtMillisecondsRelativeToNow(SUBMENU_SHOW_HIDE_DELAY, this.__closeSubmenu_timer_onTick, this);
        },
        __closeSubmenu_timer_stop: function() {
            if (this.__menuItem_closeSubmenu_task !== null) {
                this.__menuItem_closeSubmenu_task.dispose();
                this.__menuItem_closeSubmenu_task = null;
            }
        },
        __focusOrSelect: function() {
            this.__setIsSelected(true);
            this.__setIsHighlighted(true);
        },
        __getCurrentSelection: function() {
            return this.__menuItem_currentSelection;
        },
        __getCurrentSibling: function () {
            var lp, lp_curSel;
            lp = this.__getLogicalParent();
            if ((lp instanceof MenuItem || lp instanceof Menu)
                && (lp_curSel = lp.__getCurrentSelection()) !== this) {
                return lp_curSel;
            }
            return null;
        },
        __getHasItems: function() {
            var i;
            i = this.__menuItem_items;
            return i !== null && 0 < i.getCount();
        },
        __getHasOwner: function() {
            return (this.__menuItem_packedData & MenuItem_packedData_hasOwner_mask) !== 0;
        },
        getHeader: function () {
            return this.__menuItem_header;
        },
        getIsCheckable: function() {
            return (this.__menuItem_packedData & MenuItem_packedData_isCheckable_mask) !== 0;
        },
        getIsChecked: function () {
            return (this.__menuItem_packedData & MenuItem_packedData_isChecked_mask) !== 0;
        },
        getIsHighlighted: function() {
            return (this.__menuItem_packedData & MenuItem_packedData_isHighlighted_mask) !== 0;
        },
        getIsPressed: function() {
            return (this.__menuItem_packedData & MenuItem_packedData_isPressed_mask) !== 0;
        },
        getIsSubmenuOpen: function() {
            return (this.__menuItem_packedData & MenuItem_packedData_isSubmenuOpen_mask) !== 0;
        },
        __getIsSelected: function() {
            return (this.__menuItem_packedData & MenuItem_packedData_isSelected_mask) !== 0;
        },
        getItems: function () {
            if (this.__menuItem_items === null) {
                this.__menuItem_items = new CommonMenuItemList();
                this.__menuItem_items.__addEventHandler("listChanged", this.__onItemsChanged, this);
            }
            return this.__menuItem_items;
        },
        __getLogicalParent: function() {
            var lp;
            lp = this.getUIElementTree_parent();
            if (lp !== null && !(lp instanceof MenuItem || lp instanceof Menu)) {
                lp = lp.getUIElementTree_parent();
            }
            return lp;
        },
        getRole: function() {
            return MenuItemRole_toString[this.__getRole()];
        },
        __getRole: function () {
            return (this.__menuItem_packedData & MenuItem_packedData_role_mask) >> MenuItem_packedData_role_offset;
        },
        getShouldStayOpenOnClick: function() {
            return (this.__menuItem_packedData & MenuItem_packedData_shouldStayOpenOnClick_mask) !== 0;
        },
        __getUIElementTree_children_count: function () {
            var i;
            i = 0;
            if (this.__menuItem_uiElemSubmenu !== null) i += 1;
            return i;
        },
        _onClick: function (e) {
            if (this.getIsCheckable() && !e.getIsHandled()) {
                this.setIsChecked(!this.getIsChecked());
                e.setIsHandled(true);
            } 
        },
        __onIsSubmenuOpenChanged: function () {
            var logicalParent, cs, role;
            this.__openSubmenuIfThisRoleTypeIsHeader_timer_stop();
            this.__closeSubmenu_timer_stop();
            if (this.getIsSubmenuOpen()) {
                role = this.__getRole();
                if (role === MenuItemRole_topLevelHeader) {
                    logicalParent = this.__getLogicalParent();
                    if (logicalParent instanceof Menu) {
                        logicalParent.__setIsInMenuMode(true);
                    }                
                }
                this.__setCurrentSelection(null);
            } else {
                cs = this.__getCurrentSelection();
                if (cs !== null) {
                    cs.setIsSubmenuOpen(false);
                }
                this.__setCurrentSelection(null);
            }
        },
        __onItemIsSelectedChanged: function (menuItem) {
            var cs;
            cs = this.__getCurrentSelection();
            if (menuItem.__getIsSelected()) {
                if (cs === menuItem) {
                    this.__closeSubmenu_timer_stop();
                }
                if (cs !== menuItem) {
                    if (cs !== null) {
                        cs.setIsSubmenuOpen(false);
                    }
                    this.__setCurrentSelection(menuItem);
                }
            } else {
                if (cs === menuItem) {
                    this.__setCurrentSelection(null);
                }
            }
        },
        __onItemsChanged: function (sender, e) {
            switch (e.getType()) {
                case "reset": throw Error();
                case "insert":
                    if (this.__menuItem_uiElemSubmenu === null) {
                        this.__menuItem_uiElemSubmenu = new Panel();
                        this.__menuItem_uiElemSubmenu.__setUIElementTree_parent(this);
                    }
                    break;
                case "remove":
                    if (this.__menuItem_items.getCount() === 0) {
                        return;
                    }
                    break;
                case "insertFollowedByRemove": break;
                default:
                    throw Error(); 
            }
            MenuOrMenuItem_onItemsChanged(this, e);
            this.__updateRole();
        },    
        __onMouseDown: function (e) {
            if (e.getIsHandled()) return;
            if (new Rect2D(0, 0, this.__getRenderSize().getX(), this.__getRenderSize().getY()).contains(e.getPosition(this))
                && e.getChangedButton() === 1) {
                this.__clickHeader();
            }
            e.setIsHandled(true);
            if (e.getChangedButton() === 1) {
                this.__updateIsPressed();
            }
        },
        __onMouseEnter: function() {
            var lp, lp_isMenu, role, curSibling;
            assert(this.getIsMouseOver());
            lp = this.__getLogicalParent();
            lp_isMenu = false;
            if (lp === null
                || (((lp_isMenu = (lp instanceof Menu)) || lp instanceof MenuItem)
                    && !MenuOrMenuItem_getShouldIgnoreMouseEvents(lp))) {
                role = this.__getRole();
                if (((role & MenuItemRole_isNotTopLevel_mask) === 0
                        && lp_isMenu && lp.__getShouldOpenOnMouseEnter())
                    || (role & MenuItemRole_isNotTopLevel_mask) !== 0) {
                    switch (role) {
                        case MenuItemRole_topLevelHeader:
                        case MenuItemRole_topLevelItem:
                            if (!this.getIsSubmenuOpen()) {
                                this.__openSubmenuIfRoleTypeIsHeader(role);
                            }
                            break;
                        case MenuItemRole_submenuHeader:
                        case MenuItemRole_submenuItem:
                            curSibling = this.__getCurrentSibling();
                            if (curSibling === null || !curSibling.getIsSubmenuOpen()) {
                                if (!this.getIsSubmenuOpen()) {
                                    this.__focusOrSelect();
                                } else {
                                    this.__setIsHighlighted(true);
                                }
                            } else {
                                curSibling.__setIsHighlighted(false);
                                this.__setIsHighlighted(true);
                            }
                            if (!this.__getIsSelected() || !this.getIsSubmenuOpen()) {
                                this.__openSubmenuIfThisRoleTypeIsHeader_timer_set();
                            }
                            break;
                        default:
                            throw Error();
                    }
                    this.__closeSubmenu_timer_stop();
                } else {
                    this.__setIsSelected(true);
                }
                this.__updateIsPressed();
                return;
            }
            // TODO add mouseEnterOnMouseMove
        },
        __onMouseLeave: function () {
            var lp, role;
            lp = this.__getLogicalParent();
            role = this.__getRole();
            if (((role & MenuItemRole_isNotTopLevel_mask) === 0 && lp instanceof Menu && lp.__getIsInMenuMode())
                || (role & MenuItemRole_isNotTopLevel_mask) !== 0) {
                if ((role & MenuItemRole_isNotTopLevel_mask) !== 0) {
                    if (!this.getIsSubmenuOpen()) {
                        if (this.__getIsSelected()) {
                            this.__setIsSelected(false);
                        } else {
                            this.__setIsHighlighted(false);
                        }
                    } else if (this.__onMouseLeave_getIsMouseOverSibling()) {
                        this.__closeSubmenu_timer_set();
                    }
                }
                this.__openSubmenuIfThisRoleTypeIsHeader_timer_stop();
            } else {
                assert(!this.getIsMouseOver());
                this.__setIsSelected(false);
            }
            this.__updateIsPressed();
        },
        __onMouseLeave_getIsMouseOverSibling: function () {
            var lp, dirOverUIElem, i;
            // We may assume the submenu of this item is opened.
            // Let m either be a Menu or MenuItem.
            // Of all MenuItems that are a logical child of m, there 
            // can only be one with its submenu open.
            // From this it follows that for all MenuItem siblings s of this, 
            // if s.getIsMouseOver() is true then the mouse is not over the 
            // submenu of s. Note that we cannot use s.getIsMouseOver() here, 
            // since it will not have been updated yet. The only property we can 
            // use to decide if s.getIsMouseOver() will be set to true 
            // within the parent call to MouseDevice.setDirectlyOverUIElement is 
            // MouseDevice.getDirectlyOverUIElement.
            // Thus we have to compute whether MouseDevice.getDirectlyOverUIElement() is 
            // within the logical parent (which must be a MenuItem or Menu) of this
            // and if it is (within) a sibling s. 
            // Why does mouse capture not make this algorithm incorrect?
            lp = this.__getLogicalParent();
            if (!(lp instanceof Menu || lp instanceof MenuItem)) throw Error();
            dirOverUIElem = MouseDevice.getPrimary().getDirectlyOverUIElement();
            if (lp === dirOverUIElem || null === dirOverUIElem) return false;
            if (!lp.uiElementTree_isAncestorOf(dirOverUIElem)) return false;
            i = dirOverUIElem;
            do {
                if (i instanceof MenuItem) {
                    assert(i !== this);
                    if (i.__getLogicalParent() === lp) {
                        return true;
                    }
                }
            } while ((i = i.getUIElementTree_parent()) !== lp);
            return false;
        },
        __onMouseUp: function (e) {
            var role, lp;
            if (e.getIsHandled()) return;
            if (e.getChangedButton() === 1) {
                this.__updateIsPressed();
            }
            if (new Rect2D(0, 0,
                    this.__getRenderSize().getX(),
                    this.__getRenderSize().getY()).contains(e.getPosition_viewport(this))
                && e.getChangedButton() === 1) {
                role = this.__getRole();
                if ((role & MenuItemRole_type_mask) === MenuItemRole_type_item) {
                    try {
                        this.__clickItem();
                    } catch (e) {
                        throw e;
                    } finally {
                        if (role === MenuItemRole_topLevelItem && !this.getShouldStayOpenOnClick()) {
                            lp = this.__getLogicalParent();
                            if (lp instanceof Menu) lp.__setIsInMenuMode(false);
                        }
                    }
                }
            }
            if (e.getChangedButton() === 1) {
                e.setIsHandled(true);
            }
        },
        __onPropertyChanged: function (e) {
            MenuItem_baseTypeProto.__onPropertyChanged.call(this, e);
            switch (e.getPropertyName()) {
                case "isCheckable":
                    this.__updateRole();
                    break;
                case "isSubmenuOpen":
                    this.__onIsSubmenuOpenChanged();
                    break;
                case "uiElementTree_parent":
                    this.__updateRole();
                    break;
            }
        },
        __openSubmenu: function () {
            var thisLogicalParent = this.__getLogicalParent();
            if (thisLogicalParent instanceof MenuItem
                || thisLogicalParent instanceof Menu) {
                this.setIsSubmenuOpen(true);
            }
        },
        __openSubmenuIfRoleTypeIsHeader: function (role) {
            this.__focusOrSelect();
            if ((role & MenuItemRole_type_mask) === MenuItemRole_type_header) {
                this.__openSubmenu();
            }
        },
        __openSubmenuIfThisRoleTypeIsHeader_timer_onTick: function () {
            this.__menuItem_openSubmenuIfThisRoleTypeIsHeader_task = null;
            this.__openSubmenuIfRoleTypeIsHeader(this.__getRole());
        },
        __openSubmenuIfThisRoleTypeIsHeader_timer_set: function () {
            if (this.__menuItem_openSubmenuIfThisRoleTypeIsHeader_task !== null) {
                this.__menuItem_openSubmenuIfThisRoleTypeIsHeader_task.dispose();
            }
            this.__menuItem_openSubmenuIfThisRoleTypeIsHeader_task = Dispatcher
                .getInstance()
                .runAtMillisecondsRelativeToNow(SUBMENU_SHOW_HIDE_DELAY, this.__openSubmenuIfThisRoleTypeIsHeader_timer_onTick, this);
        },
        __openSubmenuIfThisRoleTypeIsHeader_timer_stop: function () {
            if (this.__menuItem_openSubmenuIfThisRoleTypeIsHeader_task !== null) {
                this.__menuItem_openSubmenuIfThisRoleTypeIsHeader_task.dispose();
                this.__menuItem_openSubmenuIfThisRoleTypeIsHeader_task = null;
            }
        },
        __setCurrentSelection: function (value) {
            if (value !== null && (!(value instanceof MenuItem) || value.__getLogicalParent() !== this)) throw Error();
            if (this.__menuItem_currentSelection === value) return;
            if (this.__menuItem_currentSelection !== null) {
                this.__menuItem_currentSelection.__setIsSelected(false);
            }
            this.__menuItem_currentSelection = value;
            if (this.__menuItem_currentSelection !== null) {
                this.__menuItem_currentSelection.__setIsSelected(true);
            }
        },
        __setHasOwner: function (value) {
            if (typeof value !== "boolean") throw Error();
            this.__menuItem_packedData = value
                ? (this.__menuItem_packedData | MenuItem_packedData_hasOwner_mask)
                : (this.__menuItem_packedData & ~MenuItem_packedData_hasOwner_mask);
        },
        setHeader: function (value) {
            var oldValue;
            if (value !== null && typeof value !== "string") throw Error();
            oldValue = this.__menuItem_header;
            if (oldValue === value) return;
            this.__menuItem_header = value;
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("header", oldValue, value));
        },
        setIsCheckable: function (value) {
            if (this.getIsCheckable() === value) return;
            if (typeof value !== "boolean") throw Error();
            this.__menuItem_packedData = value
                ? (this.__menuItem_packedData | MenuItem_packedData_isCheckable_mask)
                : (this.__menuItem_packedData & ~MenuItem_packedData_isCheckable_mask);
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("isCheckable", !value, value));
        },
        setIsChecked: function (value) {
            if (this.getIsChecked() === value) return;
            if (typeof value !== "boolean") throw Error();
            this.__menuItem_packedData = value
                ? (this.__menuItem_packedData | MenuItem_packedData_isChecked_mask)
                : (this.__menuItem_packedData & ~MenuItem_packedData_isChecked_mask);
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("isChecked", !value, value));
        },
        __setIsHighlighted: function (value) {
            if (this.getIsHighlighted() === value) return;
            if (typeof value !== "boolean") throw Error();
            this.__menuItem_packedData = value
                ? (this.__menuItem_packedData | MenuItem_packedData_isHighlighted_mask)
                : (this.__menuItem_packedData & ~MenuItem_packedData_isHighlighted_mask);
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("isHighlighted", !value, value));
        },
        __setIsPressed: function(value) {
            if (typeof value !== "boolean") throw Error();
            if (value === this.getIsPressed()) return;
            this.__menuItem_packedData = value
                ? (this.__menuItem_packedData | MenuItem_packedData_isPressed_mask)
                : (this.__menuItem_packedData & ~MenuItem_packedData_isPressed_mask);
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("isPressed", !value, value));
        },
        setIsSubmenuOpen: function (value) {
            if (this.getIsSubmenuOpen() === value) return;
            if (typeof value !== "boolean") throw Error();
            this.__menuItem_packedData = value
                ? (this.__menuItem_packedData | MenuItem_packedData_isSubmenuOpen_mask) 
                : (this.__menuItem_packedData & ~MenuItem_packedData_isSubmenuOpen_mask);
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("isSubmenuOpen", !value, value));
        },
        __setIsSelected: function (value) {
            var lp;
            if (typeof value !== "boolean") throw Error();
            if (value === this.__getIsSelected()) return;
            this.__menuItem_packedData = value
                ? (this.__menuItem_packedData | MenuItem_packedData_isSelected_mask)
                : (this.__menuItem_packedData & ~MenuItem_packedData_isSelected_mask);
            this.__setIsHighlighted(value);
            if (!value) {
                this.setIsSubmenuOpen(false);
                this.__closeSubmenu_timer_stop();
                this.__openSubmenuIfThisRoleTypeIsHeader_timer_stop();
            }
            lp = this.__getLogicalParent();
            if (lp instanceof Menu || lp instanceof MenuItem) {
                lp.__onItemIsSelectedChanged(this);
            }
        },
        setShouldStayOpenOnClick: function (value) {
            if (value === this.getShouldStayOpenOnClick()) return;
            if (typeof value !== "boolean") throw Error();
            this.__menuItem_packedData = value
                ? (this.__menuItem_packedData | MenuItem_packedData_shouldStayOpenOnClick_mask)
                : (this.__menuItem_packedData & ~MenuItem_packedData_shouldStayOpenOnClick_mask);
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("shouldStayOpenOnClick", !value, value));
        },
        __uiElementTree_children_get: function (i) {
            if (this.__menuItem_uiElemSubmenu === null || i !== 0) throw Error();
            return this.__menuItem_uiElemSubmenu;
        },
        __updateIsPressed: function () {
            var md;
            md = MouseDevice.getPrimary();
            this.__setIsPressed(
                md.getLeftButtonState() === "pressed"
                && this.getIsMouseOver()
                && new Rect2D(0, 0,
                this.__getRenderSize().getWidth(),
                this.__getRenderSize().getHeight()).contains(md.getPosition(this)));
        },
        __updateRole: function () {
            var i, role1, role2;
            i = this.__getLogicalParent() instanceof Menu;
            if (this.__getHasItems() && !this.getIsCheckable()) {
                if (i) {
                    role1 = MenuItemRole_topLevelHeader;
                } else {
                    role1 = MenuItemRole_submenuHeader;
                }
            } else {
                if (i) {
                    role1 = MenuItemRole_topLevelItem;
                } else {
                    role1 = MenuItemRole_submenuItem;
                }
            }
            role2 = this.__getRole();
            if (role2 === role1) return;
            this.__menuItem_packedData = (this.__menuItem_packedData & ~MenuItem_packedData_role_mask) | (role1 << MenuItem_packedData_role_offset);
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("role", MenuItemRole_toString[role2], MenuItemRole_toString[role1]));
        }
    }, Object.create(MenuItem_baseTypeProto));
    JsonMarkup.__addType("MenuItem", MenuItem, MenuItem_baseTypeName, function (instance, options) {
        var i;
        if ((i = getOptionOnce(options, "header", INTERNAL_SENTINEL)) !== INTERNAL_SENTINEL) instance.setHeader(i);
        if ((i = getOptionOnce(options, "isCheckable", INTERNAL_SENTINEL)) !== INTERNAL_SENTINEL) instance.setIsCheckable(i);
        if ((i = getOptionOnce(options, "isChecked", INTERNAL_SENTINEL)) !== INTERNAL_SENTINEL) instance.setIsChecked(i);
        if ((i = getOptionOnce(options, "shouldStayOpenOnClick", INTERNAL_SENTINEL)) !== INTERNAL_SENTINEL) instance.setShouldStayOpenOnClick(i);
        if ((i = getOptionOnce(options, "items", INTERNAL_SENTINEL)) !== INTERNAL_SENTINEL) {
            MenuOrMenuItem_createAndAppendCommonMenuItems_fromCommonMenuItemOptionList(instance, i);
        }
    }, function (instance, options) {
        var i;
        if ((i = getOptionOnce(options, "command", INTERNAL_SENTINEL)) !== INTERNAL_SENTINEL) {
            if (!isFunction(i)) throw Error();
            instance.addEventHandler("click", i);
        }
    });

    function Separator() {
        UIElement.call(this);
        this.__separator_hasOwner = false;
    }
    Separator.prototype = setOwnSrcPropsOnDst({
        constructor: Separator
    }, UIElement.prototype);
    JsonMarkup.__addType("Separator", Separator, "UIElement");

    function commonMenuItem_isValid(value) {
        if (value instanceof MenuItem) {
            // This should be changed to test for non-recursive submenu's!
            return !value.__getHasOwner();
        }
        if (value instanceof Separator) {
            return !value.__separator_hasOwner;
        }
        return false;
    }
                                            
    function MenuOrMenuItem_getShouldIgnoreMouseEvents(menuOrMenuItem) {
        return false;
    }

    function MenuOrMenuItem_onItemsChanged(menuOrMenuItem, e) {
        var i, n;
        var newItems, newIndex;
        var itemsHostUIElem;
        if (menuOrMenuItem instanceof Menu) {
            itemsHostUIElem = menuOrMenuItem.__menu_panel;
        } else {
            itemsHostUIElem = menuOrMenuItem.__menuItem_uiElemSubmenu;
        }
        i = e.getOldIndex();
        if (0 <= i) {
            n = e.getOldItems_count();
            itemsHostUIElem.getChildren().removeRange(i, n);
        }
        newIndex = e.getNewIndex();
        if (0 <= newIndex) {
            newItems = e.__newItems;
            itemsHostUIElem.getChildren().insertRange(newItems, newIndex);
        }
    }

    JsonMarkup.__addType("__CommonMenuItem", null, null, function (options) {
        var key;
        var aliasedTypeName;
        for (key in options) if (hasOwnPropertyFunction.call(options, key)) {
            switch (key) {
                case "header":
                case "command":
                case "isCheckable":
                case "isChecked":
                case "items":
                case "shouldStayOpenOnClick":
                    aliasedTypeName = "MenuItem";
                    break;
                // add cases for which to use separator
            }
        }
        if (aliasedTypeName === undefined) {
            aliasedTypeName = "Separator";
        }
        return aliasedTypeName;
    }, null, true);

    function MenuOrMenuItem_createAndAppendCommonMenuItems_fromCommonMenuItemOptionList(menuOrMenuItem, commonMenuItemOptionList) {
        var i, n;
        var commonMenuItem;
        var commonMenuItemOption;
        if (!isArrayLike_nonSparse(commonMenuItemOptionList)) throw Error();
        for (i = 0, n = commonMenuItemOptionList.length; i < n; i++) {
            commonMenuItemOption = commonMenuItemOptionList[i];
            commonMenuItem = JsonMarkup.convertToObject(commonMenuItemOption, "__CommonMenuItem");
            menuOrMenuItem.getItems().add(commonMenuItem);
        }
    }

    function commonMenuItem_setHasOwner(item, value) {
        if (item instanceof MenuItem) {
            item.__setHasOwner(value);
        } else if (item instanceof Separator) {
            item.__separator_hasOwner = value;
        } else {
            throw Error();
        }
    }

    function CommonMenuItemList() {
        List.call(this, {
            isItemValid: commonMenuItem_isValid,
            canUseResetListChangeType: false
        });
    }
    CommonMenuItemList.prototype = setOwnSrcPropsOnDst({
        constructor: CommonMenuItemList,
        __onListChanged: function (e) {
            var items, i, n;
            if (0 <= e.getOldIndex()) {
                items = e.__oldItems;
                for (n = items.length, i = 0; i < n; i++) {
                    commonMenuItem_setHasOwner(items[i], false);
                }
            }
            if (0 <= e.getNewIndex()) {
                items = e.__newItems;
                for (n = items.length, i = 0; i < n; i++) {
                    commonMenuItem_setHasOwner(items[i], true);
                }
            }
        }
    }, Object.create(List.prototype));




    setOwnSrcPropsOnDst({
        Menu: Menu,
        MenuItem: MenuItem,
        Separator: Separator
    }, window);

})();