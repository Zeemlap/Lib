(function () {

    var nan = 0 / 0;
    var posInfDouble = 1 / 0;
    var maxDouble = Math.max;
    var minDouble = Math.min;
    var negInfDouble = -posInfDouble;

    var horizOrVertAlign_leftOrTop = 0;
    var horizOrVertAlign_center = 1;
    var horizOrVertAlign_rightOrBottom = 2;
    var horizOrVertAlign_stretch = 3;

    var horizAlign_toString = ["left", "center", "right", "stretch"];
    var horizAlign_parse = { "left": horizOrVertAlign_leftOrTop, "center": horizOrVertAlign_center, "right": horizOrVertAlign_rightOrBottom, "stretch": horizOrVertAlign_stretch };
    var vertAlign_toString = ["top", "center", "bottom", "stretch"];
    var vertAlign_parse = { "top": horizOrVertAlign_leftOrTop, "center": horizOrVertAlign_center, "bottom": horizOrVertAlign_rightOrBottom, "stretch": horizOrVertAlign_stretch };
    

    var horizOrVertAlign_all = [horizOrVertAlign_leftOrTop, horizOrVertAlign_center, horizOrVertAlign_rightOrBottom, horizOrVertAlign_stretch];
    var horizOrVertAlign_isValid = function (value) {
        var i;
        i = horizOrVertAlign_all.length;
        while (0 <= --i) {
            if (value === horizOrVertAlign_all[i]) return true;
        }
        return false;
    };
    var horizOrVertAlign_noBits = 1 + log2FloorDouble(Math.max.apply(Math, horizOrVertAlign_all));
    var horizOrVertAlign_mask = (1 << horizOrVertAlign_noBits) - 1;

    function fe_isMarginValid(value) {
        return value instanceof Thickness
            && negInfDouble < value.getLeft()
            && negInfDouble < value.getTop()
            && negInfDouble < value.getRight()
            && negInfDouble < value.getBottom();
    }
    function fe_isMaxWidthHeightValid(value) {
        return typeof value === "number" && 0 <= value;
    }
    function fe_isMinWidthHeightValid(value) {
        return typeof value === "number" && 0 <= value && value < posInfDouble;
    }
    function fe_isWidthHeightValid(value) {
        return typeof value === "number" && !(value < 0 || value === posInfDouble);
    }
    var fe_packedData1_horizAlign_offset = 0;
    var fe_packedData1_horizAlign_mask = horizOrVertAlign_mask << fe_packedData1_horizAlign_offset;
    var fe_packedData1_vertAlign_offset = horizOrVertAlign_noBits;
    var fe_packedData1_vertAlign_mask = horizOrVertAlign_mask << fe_packedData1_vertAlign_offset;
    assert(fe_packedData1_vertAlign_mask === 0xC);
    var fe_packedData1_didOverflowLayoutSlot_mask = 0x10;

    var fe_baseTypeName = "UIElement";
    var fe_baseTypeCtor = window[fe_baseTypeName];
    var fe_baseTypeProto = fe_baseTypeCtor.prototype;

    function FrameworkElement() {
        this.__fe_height = nan;
        this.__fe_maxHeight = posInfDouble;
        this.__fe_maxWidth = posInfDouble;
        this.__fe_minHeight = 0;
        this.__fe_minWidth = 0;
        this.__fe_width = nan;
        this.__fe_margin = null;
        this.__fe_packedData1 = 0;
        this.__fe_desiredSizeFromMeasureCore2IfOverflowLayoutSlot = null;
        fe_baseTypeCtor.call(this);
    }
    FrameworkElement.prototype = setOwnSrcPropsOnDst({
        constructor: FrameworkElement,

        _arrangeCore1: function (finalRect) {
            var marg;
            var marg_horiz, marg_vert;
            var maxWidth, maxHeight;
            var align_horiz, align_vert;
            var x1, x2;
            var didOverflowLayoutSlot;
            var size1X, size1Y;
            var size2X, size2Y;
            var size3X, size3Y;
            var size4X, size4Y;
            var renderSize;
            if (!(finalRect instanceof Rect2D)) throw Error();
            marg = this.__fe_margin;
            if (marg === null) {
                marg_horiz = marg_vert = 0;
            } else {
                marg_horiz = marg.getLeft() + marg.getRight();
                marg_vert = marg.getTop() + marg.getBottom();
            }
            size1X = maxDouble(finalRect.getWidth() - marg_horiz, 0);
            size1Y = maxDouble(finalRect.getHeight() - marg_vert, 0);
            didOverflowLayoutSlot = false;

            x1 = this.__fe_desiredSizeFromMeasureCore2IfOverflowLayoutSlot;
            if (x1 === null) {
                size2X = maxDouble(0, this.__getDesiredSize().getX() - marg_horiz);
                size2Y = maxDouble(this.__getDesiredSize().getY() - marg_vert);
            } else {
                size2X = x1.getX();
                size2Y = x1.getY();
            }
            if (size1X < size2X && !__areDoublesClose(size1X, size2X)) {
                didOverflowLayoutSlot = true;
                size1X = size2X;
            }
            if (size1Y < size2Y && !__areDoublesClose(size1Y, size2Y)) {
                didOverflowLayoutSlot = true;
                size1Y = size2Y;
            }
            
            align_horiz = this.__getHorizontalAlignment();
            if (align_horiz !== horizOrVertAlign_stretch) {
                size1X = size2X;
                size1Y = size2Y;
            }

            maxHeight = this.getMaxHeight();
            x1 = this.getHeight();
            x2 = x1 !== x1 ? posInfDouble : x1;
            maxHeight = maxDouble(minDouble(x1, maxHeight), this.getMinHeight());

            maxWidth = this.getMaxWidth();
            x1 = this.getWidth();
            x2 = x1 !== x1 ? posInfDouble : x1;
            maxWidth = maxDouble(minDouble(x1, maxWidth), this.getMinWidth());


            x1 = maxDouble(size2X, maxWidth);
            if (x1 < size1X && !__areDoublesClose(x1, size1X)) {
                didOverflowLayoutSlot = true;
                size1X = x1;
            }
            x1 = maxDouble(size2Y, maxHeight);
            if (x1 < size1Y && !__areDoublesClose(x1, size1Y)) {
                didOverflowLayoutSlot = true;
                size1Y = x1;
            }

            this.__setDidOverflowLayoutSlot(didOverflowLayoutSlot);
            x1 = this.getRenderSize();
            x2 = this._arrangeCore2(new Vector2(size1X, size1Y));
            renderSize = x2;

            size3X = minDouble(x1.getX(), maxWidth);
            size3Y = minDouble(x1.getY(), maxHeight);
            if ((size3X < x2.getX() && !__areDoublesClose(size3X, x2.getX()))
                || (size3Y < x2.getY() && !__areDoublesClose(size3Y, x2.getY()))) {
                didOverflowLayoutSlot = true;

            }
            size4X = maxDouble(0, finalRect.getWidth() - marg_horiz);
            size4Y = maxDouble(0, finalRect.getHeight() - marg_vert);
            if ((size4X < size3X && !__areDoublesClose(size4X, size3X))
                || (size4Y < size3Y && !__areDoublesClose(size4Y, size3Y))) {
                didOverflowLayoutSlot = true;
            }


            // compute alignment of square (size3X, size3Y) within (size4X, size4Y)
            if (align_horiz === horizOrVertAlign_stretch && size3X > size4X) {
                align_horiz = horizOrVertAlign_leftOrTop;
            }
            if (align_horiz === horizOrVertAlign_center || align_horiz === horizOrVertAlign_stretch) {
                x1 = 0.5 * (size4X - size3X);
            } else if (align_horiz === horizOrVertAlign_rightOrBottom) {
                x1 = size4X - size3X;
            } else {
                x1 = 0;
            }
            if (align_vert === horizOrVertAlign_stretch && size3Y > size4Y) {
                align_vert = horizOrVertAlign_leftOrTop;
            }
            if (align_vert === horizOrVertAlign_center || align_vert === horizOrVertAlign_stretch) {
                x2 = 0.5 * (size4Y - size3Y);
            } else if (align_vert === horizOrVertAlign_rightOrBottom) {
                x2 = size4Y - size3Y;
            } else {
                x2 = 0;
            }
            x1 += finalRect.getX();
            if (marg !== null) x1 += marg.getLeft();
            x2 += finalRect.getY();
            if (marg !== null) x2 += marg.getTop();
            this.__setDidOverflowLayoutSlot(didOverflowLayoutSlot);
            this.__setLayout(new Rect2D(x1, x2, renderSize.getX(), renderSize.getY()));
        },

        _arrangeCore2: function(finalSize) {
            if (!(finalSize instanceof Vector2)) throw Error();
            return finalSize;
        },
        __getDidOverflowLayoutSlot: function () {
            return (this.__fe_packedData1 & fe_packedData1_didOverflowLayoutSlot_mask) !== 0;
        },
        getHeight: function () {
            return this.__fe_height;
        },
        getHorizontalAlignment: function () {
            return horizAlign_toString[this.__getHorizontalAlignment()];
        },
        __getHorizontalAlignment: function () {
            return (this.__fe_packedData1 & fe_packedData1_horizAlign_mask) >> fe_packedData1_horizAlign_offset;
        },
        getMargin: function() {
            if (this.__fe_margin === null) {
                this.__fe_margin = new Thickness();
            }
            return this.__fe_margin.clone();
        },
        getMaxHeight: function () {
            return this.__fe_maxHeight;
        },
        getMaxWidth: function () {
            return this.__fe_maxWidth;
        },
        getMinHeight: function () {
            return this.__fe_minHeight;
        },
        getMinWidth: function () {
            return this.__fe_minWidth;
        },
        getVerticalAlignment: function() {
            return vertAlign_toString[this.__getVerticalAlignment()];
        },
        __getVerticalAlignment: function () {
            return (this.__fe_packedData1 & fe_packedData1_vertAlign_mask) >> fe_packedData1_vertAlign_offset;
        },
        getWidth: function () {
            return this.__fe_width;
        },

        _measureCore1: function (availableSize) {
            var marg;
            var marg_horiz, marg_vert;
            var sizeX, sizeY;
            var minWidth, maxWidth;
            var minHeight, maxHeight;
            var x1, x2;
            var didOverflowLayoutSlot;
            var desiredSizeFromMeasureCore2;
            if (!(availableSize instanceof Vector2)) throw Error();
            marg = this.__fe_margin;
            if (marg === null) {
                marg_horiz = marg_vert = 0;
            } else {
                marg_horiz = marg.getLeft() + marg.getRight();
                marg_vert = marg.getTop() + marg.getBottom();
            }
            sizeX = maxDouble(availableSize.getX() - marg_horiz, 0);
            sizeY = maxDouble(availableSize.getY() - marg_vert, 0);

            minHeight = this.getMinHeight();
            maxHeight = this.getMaxHeight();
            x1 = this.getHeight();
            x2 = x1 !== x1 ? posInfDouble : x1;
            maxHeight = maxDouble(minDouble(x2, maxHeight), minHeight);
            x2 = x1 !== x1 ? 0 : x1;
            minHeight = maxDouble(minDouble(x2, maxHeight), minHeight);

            minWidth = this.getMinWidth();
            maxWidth = this.getMaxWidth();
            x1 = this.getWidth();
            x2 = x1 !== x1 ? posInfDouble : x1;
            maxWidth = maxDouble(minDouble(x2, maxWidth), minWidth);
            x2 = x1 !== x1 ? 0 : x1;
            minWidth = maxDouble(minDouble(x2, maxWidth), minWidth);

            sizeX = maxDouble(minWidth, minDouble(sizeX, maxWidth));
            sizeY = maxDouble(minHeight, minDouble(sizeY, maxHeight));

            x1 = this._measureCore2(new Vector2(sizeX, sizeY));
            desiredSizeFromMeasureCore2 = new Vector2(x1);
            x1.setX(maxDouble(minWidth, x1.getX()));
            x1.setY(maxDouble(minHeight, x1.getY()));

            didOverflowLayoutSlot = false;
            if (maxWidth < x1.getX()) {
                x1.setX(maxWidth);
                didOverflowLayoutSlot = true;
            }
            if (maxHeight < x1.getY()) {
                x1.setY(maxHeight);
                didOverflowLayoutSlot = true;
            }

            x2 = x1.getY() + marg_vert;
            x1 = x1.getX() + marg_horiz;

            if (availableSize.getX() < x1) {
                x1 = availableSize.getX();
                didOverflowLayoutSlot = true;
            }
            if (availableSize.getY() < x2) {
                x2 = availableSize.getY();
                didOverflowLayoutSlot = true;
            }

            if (didOverflowLayoutSlot || x1 < 0 || x2 < 0) {
                this.__fe_desiredSizeFromMeasureCore2IfOverflowLayoutSlot = desiredSizeFromMeasureCore2;
            } else {
                this.__fe_desiredSizeFromMeasureCore2IfOverflowLayoutSlot = null;
            }
            return new Vector2(maxDouble(0, x1), maxDouble(0, x2));
        },
        _measureCore2: function (availableSize) {
            return new Vector2();
        },
        __onPropertyChanged: function (e) {
            fe_baseTypeProto.__onPropertyChanged.call(this, e);
            switch (e.getPropertyName()) {
                case "height":
                case "margin":
                case "maxHeight":
                case "maxWidth":
                case "minHeight":
                case "minWidth":
                case "width":
                    this.invalidateMeasure();
                    break;
                case "horizontalAlignment":
                case "verticalAlignment":
                    this.invalidateArrange();
                    break;
            }
        },
        __setDidOverflowLayoutSlot: function(value) {
            if (typeof value !== "boolean") throw Error();
            if (value) this.__fe_packedData1 |= fe_packedData1_didOverflowLayoutSlot_mask;
            else this.__fe_packedData &= ~fe_packedData1_didOverflowLayoutSlot_mask;
        },
        setHeight: function (value) {                                                 
            var oldValue;
            if (!fe_isWidthHeightValid(value)) throw Error();
            oldValue = this.__fe_height;
            if (__areDoublesEqual(oldValue, value)) return;
            this.__fe_height = value;
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("height", oldValue, value));
        },
        setHorizontalAlignment: function (value) {
            this.__setHorizontalAlignment(getOwnProperty(horizAlign_parse, value));
        },
        __setHorizontalAlignment: function (value) {
            var oldValue;
            if (!horizOrVertAlign_isValid(value)) throw Error();
            oldValue = this.__getHorizontalAlignment();
            if (oldValue === value) return;
            this.__fe_packedData1 = (this.__fe_packedData1 & ~fe_packedData1_horizAlign_mask)
                | (value << fe_packedData1_horizAlign_offset);
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("horizontalAlignment", oldValue, value));
        },
        setMargin: function (value) {
            var oldValue;
            if (!fe_isMarginValid(value)) throw Error();
            if (this.__fe_margin === null) {
                oldValue = new Thickness();
            } else {
                oldValue = this.__fe_margin.clone();
            }
            if (oldValue.isCloseTo(value)) return;
            this.__fe_margin = value.clone();
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("margin", oldValue, value.clone()));
        },
        setMaxHeight: function (value) {
            var oldValue;
            if (!fe_isMaxWidthHeightValid(value)) throw Error();
            oldValue = this.__fe_maxHeight;
            if (oldValue === value) return;
            this.__fe_maxHeight = value;
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("maxHeight", oldValue, value));
        },
        setMaxWidth: function (value) {
            var oldValue;
            if (!fe_isMaxWidthHeightValid(value)) throw Error();
            oldValue = this.__fe_maxWidth;
            if (oldValue === value) return;
            this.__fe_maxWidth = value;
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("maxWidth", oldValue, value));
        },
        setMinHeight: function (value) {
            var oldValue;
            if (!fe_isMinWidthHeightValid(value)) throw Error();
            oldValue = this.__fe_minHeight;
            if (oldValue === value) return;
            this.__fe_minHeight = value;
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("minHeight", oldValue, value));
        },
        setMinWidth: function (value) {
            var oldValue;
            if (!fe_isMinWidthHeightValid(value)) throw Error();
            oldValue = this.__fe_minWidth;
            if (oldValue === value) return;
            this.__fe_minWidth = value;
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("minWidth", oldValue, value));
        },
        setVerticalAlignment: function (value) {
            this.__setVerticalAlignment(getOwnProperty(vertAlign_parse, value));
        },
        __setVerticalAlignment: function (value) {
            var oldValue;
            if (!horizOrVertAlign_isValid(value)) throw Error();
            oldValue = this.__getVerticalAlignment();
            if (oldValue === value) return;
            this.__fe_packedData1 = (this.__fe_packedData1 & ~fe_packedData1_vertAlign_mask)
                | (value << fe_packedData1_vertAlign_offset);
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("verticalAlignment", oldValue, value));
        },
        setWidth: function (value) {
            var oldValue;
            if (!fe_isWidthHeightValid(value)) throw Error();
            oldValue = this.__fe_width;
            if (__areDoublesEqual(oldValue, value)) return;
            this.__fe_width = value;
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("width", oldValue, value));
        }

    }, Object.create(fe_baseTypeProto));
    var getOptionOnce = JsonMarkup.getOptionOnce;
    var INTERNAL_SENTINEL = horizAlign_toString
    JsonMarkup.__addType("FrameworkElement", FrameworkElement, fe_baseTypeName, function (instance, options) {
        var i;
        if ((i = getOptionOnce(instance, "height", INTERNAL_SENTINEL)) !== INTERNAL_SENTINEL) instance.setHeight(i);
        if ((i = getOptionOnce(instance, "horizontalAlignment", INTERNAL_SENTINEL)) !== INTERNAL_SENTINEL) instance.setHorizontalAlignment(i);
        if ((i = getOptionOnce(instance, "maxHeight", INTERNAL_SENTINEL)) !== INTERNAL_SENTINEL) instance.setMaxHeight(i);
        if ((i = getOptionOnce(instance, "maxWidth", INTERNAL_SENTINEL)) !== INTERNAL_SENTINEL) instance.setMaxWidth(i);
        if ((i = getOptionOnce(instance, "minHeight", INTERNAL_SENTINEL)) !== INTERNAL_SENTINEL) instance.setMinHeight(i);
        if ((i = getOptionOnce(instance, "minWidth", INTERNAL_SENTINEL)) !== INTERNAL_SENTINEL) instance.setMinWidth(i);
        if ((i = getOptionOnce(instance, "verticalAlignment", INTERNAL_SENTINEL)) !== INTERNAL_SENTINEL) instance.setVerticalAlignment(i);
        if ((i = getOptionOnce(instance, "width", INTERNAL_SENTINEL)) !== INTERNAL_SENTINEL) instance.setWidth(i);
    });


    setOwnSrcPropsOnDst({
        FrameworkElement: FrameworkElement
    }, window);

})();