(function () {

    var ButtonBase_baseTypeName = "ContentControl";
    var ButtonBase_baseTypeCtor = window[ButtonBase_baseTypeName];
    var ButtonBase_baseTypeProto = ButtonBase_baseTypeCtor.prototype;

    function ButtonBase() {
        ButtonBase_baseTypeCtor.call(this);
        this.__isPressed = false;
    }
    setOwnSrcPropsOnDst({
        cosntructor: ButtonBase,
        getIsPressed: function() {
            return this.__isPressed;
        },
        ___onLostMouseCapture: function () {
            this.__setIsPressed(false);
        },
        __onMouseDown: function (e) {
            var hasMouseCapture;
            if (!(e instanceof MouseButtonEventArgs)) throw Error();
            if (!e.getIsHandled() && e.getChangedButton() === 1) { // We trust internal code to not change mouse button states onmousedown.
                assert(e.getButtonState() === "pressed");
                e.setIsHandled(true);
                hasMouseCapture = this.captureMouse(e.getMouseDevice());
                assert(hasMouseCapture);
                this.__setIsPressed(true);
            }
            ButtonBase_baseTypeProto.__onMouseDown.call(this, e);
        },
        __onMouseMove: function (e) {
            var b;
            ButtonBase_baseTypeProto.__onMouseMove.call(this, e);
            if (this.getHasMouseCapture(e.getMouseDevice())) {
                e.setIsHandled(true);
                b = new Rect2D(0, 0, this.__getRenderSize().getWidth(), this.__getRenderSize().getHeight()).contains(e.getPosition(this));
                this.__setIsPressed(b);
            }
        },
        __onMouseUp: function (e) {
            var wasPressed;
            if (!(e instanceof MouseButtonEventArgs)) throw Error();
            if (!e.getIsHandled() && e.getChangedButton() === 1) {
                e.setIsHandled(true);
                wasPressed = this.getIsPressed();
                this.releaseMouseCapture(e.getMouseDevice());
                if (wasPressed) {
                    this.raiseEvent("click", new RoutedEventArgs());
                }
            }
            ButtonBase_baseTypeProto.__onMouseUp.call(this, e);
        },
        __onPropertyChanged: function (e) {
            ButtonBase_baseTypeProto.__onPropertyChanged.call(this, e);
            switch (e.getPropertyName()) {
                case "hasMouseCapture":
                    if (!this.getHasMouseCapture()) {
                        this.___onLostMouseCapture();
                    }
                    break;
            }
        },
        __setIsPressed: function (value) {
            if (typeof value !== "boolean") throw Error();
            if (value === this.__isPressed) return;
            this.__isPressed = value;
            this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("isPressed", !value, value));
        }
    }, Object.create(ButtonBase_baseTypeProto));

    setOwnSrcPropsOnDst({
        ButtonBase: ButtonBase
    }, window);
})();