(function () {

    var undefined;
    var ModalDialog_baseTypeName = "ContentControl";
    var ModalDialog_baseTypeCtor = window[ModalDialog_baseTypeName];
    var ModalDialog_baseTypeProto = ModalDialog_baseTypeCtor.prototype;
    function ModalDialog() {
        ModalDialog_baseTypeCtor.call(this);
        this.__setIsLayoutIslandRoot(true);
        this.__setIsFrozenInUIElementTree(true);
        this.__setIsRootUIElementOfAPresentationSource(true);
    }
    ModalDialog.prototype = setOwnSrcPropsOnDst({
        constructor: ModalDialog,
        hide: function() {
            throw Error();                          
        },
        show: function () {
            throw Error();
        }
    }, Object.create(ModalDialog_baseTypeProto));

    setOwnSrcPropsOnDst({
        ModalDialog: ModalDialog
    }, window);

    var SENTINEL = {};
    var getOptionOnce = JsonMarkup.getOptionOnce;
    JsonMarkup.__addType("ModalDialog", ModalDialog, ModalDialog_baseTypeName, null, function (instance, options) {
        var autoShow;
        autoShow = getOptionOnce(options, "autoShow", true);
        if (typeof autoShow !== "boolean") throw Error();
        if (autoShow) {
            instance.show();
        }
    });


})();