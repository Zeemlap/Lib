(function () {

    var ContentControl_baseTypeName = "FrameworkElement";       
    var ContentControl_baseTypeCtor = window[ContentControl_baseTypeName];
    var ContentControl_baseTypeProto = ContentControl_baseTypeCtor.prototype;
    function ContentControl() {
        ContentControl_baseTypeCtor.call(this);
        this.__contentControl_content = null;
    }
    ContentControl.prototype = setOwnSrcPropsOnDst({
        getContent: function () {
            return this.__contentControl_content;
        },
        __onContentChanged: function (oldValue) {
            var newValue;
            if (oldValue instanceof UIElement) {
                oldValue.__setUIElementTree_parent(null);
            }
            newValue = this.__contentControl_content;
            if (newValue instanceof UIElement) {
                newValue.__setUIElementTree_parent(this);
            }
        },
        __onPropertyChanged: function (e) {
            switch (e.getPropertyName()) {
                case "content":
                    this.__onContentChanged(e.__getOldValue());
                    break;
            }
            ContentControl_baseTypeProto.__onPropertyChanged.call(this, e);
        },
        setContent: function (value) {
            var oldValue;
            if (value instanceof UIElement && value.getUIElementTree_parent() !== null) throw Error();
            oldValue = this.__contentControl_content;
            if (!function_equalityValueTypes(oldValue, value)) {
                this.__contentControl_content = value;
                this.raiseEvent("propertyChanged", new PropertyChangedEventArgs("content", oldValue, value));
            }
        }
    }, Object.create(ContentControl_baseTypeProto));


    setOwnSrcPropsOnDst({
        ContentControl: ContentControl
    }, window);

    var SENTINEL = {};
    var getOptionOnce = JsonMarkup.getOptionOnce;
    JsonMarkup.__addType("ContentControl", ContentControl, ContentControl_baseTypeName, function (instance, options) {
        var i;
        if ((i = getOptionOnce(options, "content", SENTINEL)) !== SENTINEL) {
            instance.setContent(typeof i === "string"
                ? i
                : JsonMarkup.convertToObject(i, null));
        }
    });

})();