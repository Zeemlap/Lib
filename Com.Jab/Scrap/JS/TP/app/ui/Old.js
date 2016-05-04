(function () {


    function FieldInputEnumInlineOption(elem, onChangeFunc) {
        this.__elem = elem;
        this.__isSelected = false;
        this.__inputTypeRadioElem = queryElements("input[type='radio']", elem).single();
        this.__inputTypeRadioElem.addEventListener("change", onChangeFunc, false);
    }
    FieldInputEnumInlineOption.prototype = {
        constructor: FieldInputEnumInlineOption,
        computeIsSelected: function () {
            return this.__inputTypeRadioElem.checked;
        },
        getIsSelected: function () {
            return this.__isSelected;
        },
        setIsSelected: function (value) {
            if (typeof value !== "boolean") throw Error();
            if (value === this.__isSelected) return;
            this.__isSelected = value;
            if (value) {
                HostElement_cssClasses_addRange(this.__elem, "is-selected");
            } else {
                HostElement_cssClasses_removeRange(this.__elem, "is-selected");
            }
        },
        clearIsSelectedDom: function () {
            this.__inputTypeRadioElem.checked = false;
        }
    };

    function FieldInputEnumInline(options) {

        this.__labelElem = null;
        this.__inputElem = null;
        var optionNames = Object.getOwnPropertyNames(options);
        var i = 0, n = optionNames.length;
        var optionValue;
        var inputSelector;
        while (i < n) {
            optionValue = options[optionNames[i]];
            switch (optionNames[i]) {
                case "labelSelector":
                    this.__labelElem = queryElements(optionValue).single();
                    break;
                case "inputSelector":
                    this.__inputElem = queryElements(optionValue).single();
                    inputSelector = optionValue;
                    break;
                default:
                    throw Error();
            }
            i++;
        }
        if (this.__labelElem === null || this.__inputElem === null) {
            throw Error();
        }
        this.__clearButtonElem = queryElements(".clear-button", this.__inputElem).singleOrDefault(null);
        var optionElements = queryElements(inputSelector + " label");
        if ((n = optionElements.length) === 0) {
            throw Error();
        }
        this.__options = new Array(n);
        this.__inputOfTypeRadioOnChangeFunc = this.__inputOfTypeRadioOnChange.bind(this);
        for (i = 0; i < n; i++) {
            this.__options[i] = new FieldInputEnumInlineOption(optionElements[i], this.__inputOfTypeRadioOnChangeFunc);
        }
        this.__onClearButtonClickedFunc = null;
        if (this.__clearButtonElem !== null) {
            this.__onClearButtonClickedFunc = this.__onClearButtonClicked.bind(this);
            this.__clearButtonElem.addEventListener("click", this.__onClearButtonClickedFunc, false);
        }
        this.__onNewSelectedIndex();
    }
    FieldInputEnumInline.prototype = {
        __inputOfTypeRadioOnChange: function () {
            if (0 <= this.__selectedIndex) {
                this.__options[this.__selectedIndex].setIsSelected(false);
            }
            this.__onNewSelectedIndex();
        },
        __onClearButtonClicked: function () {
            if (0 <= this.__selectedIndex) {
                this.__options[this.__selectedIndex].clearIsSelectedDom();
                this.__options[this.__selectedIndex].setIsSelected(false);
                this.__selectedIndex = -1;
            }
        },
        __onNewSelectedIndex: function () {
            this.__selectedIndex = this.__computedSelectedIndex();
            if (0 <= this.__selectedIndex) {
                this.__options[this.__selectedIndex].setIsSelected(true);
            }
        },
        __computedSelectedIndex: function () {
            var i, n;
            var options = this.__options;
            var j = -1;
            for (i = 0, n = options.length; i < n ; i++) {
                if (options[i].computeIsSelected()) {
                    if (0 <= j) throw Error();
                    j = i;
                }
            }
            return j;
        }
    };

    this.FieldInputEnumInline = FieldInputEnumInline;
    function ElasticTextArea(options) {
        var i, n;
        var optionNames = Object.getOwnPropertyNames(options);
        var optionValue;
        this.__elem = null;
        for (n = optionNames.length, i = 0; i < n; i++) {
            optionValue = options[optionNames[i]];
            switch (optionNames[i]) {
                case "selector":
                    if (this.__elem !== null) throw Error();
                    this.__elem = queryElements(optionValue).single();
                    break;
                case "element":
                    if (this.__elem !== null || !(optionValue instanceof Element)) {
                        throw Error();
                    }
                    this.__elem = optionValue;
                    break;
                default:
                    throw Error();
            }
        }
        if (this.__elem === null || this.__elem.tagName !== "TEXTAREA") {
            throw Error();
        }
        HostElement_cssClasses_addRange(this.__elem, "elastic-text-area");
        this.__elemOnInputFunc = this.__elemOnInput.bind(this);
        this.__elem.addEventListener("input", this.__elemOnInputFunc, false);
        this.__onNewInput();
    }
    ElasticTextArea.prototype = {
        __elemOnInput: function () {
            this.__onNewInput();
        },
        __onNewInput: function () {
            this.__elem.style.height = "auto";
            this.__elem.style.height = this.__elem.scrollHeight + "px";
        }
    };
    this.ElasticTextArea = ElasticTextArea;


    function DataGridRow(item) {
        this.__item = item;
    }
    DataGridRow.prototype = {
        getItem: function () {
            return this.__item;
        }
    };
    function DataGridCell(cellElem, row, column) {
        this.__cellElem = cellElem;
        this.__row = row;
        this.__column = column;
    }
    DataGridCell.prototype = {
        getElement: function () { return this.__cellElem; },
        getRow: function () { return this.__row; },
        getColumn: function () { return this.__column; }
    };
    function DataGridColumn(index, dataGrid) {
        this.__index = index;
        this.__dataGrid = dataGrid;
    }
    DataGridColumn.prototype = {
        getIndex: function () {
            return this.__index;
        },
        __renderCellInitially: function (row) {

        }
    };

    function DataGridTemplatedColumn(options, index, dataGrid) {
        var i, n, optionNames;
        optionNames = Object.getOwnPropertyNames(options);
        var cellTemplateElement = null;
        var onApplyTemplateFunction = null;
        for (i = 0, n = optionNames.length; i < n; i++) {
            switch (optionNames[i]) {
                case "cellTemplate":
                    cellTemplateElement = options.cellTemplate;
                    break;
                case "onApplyTemplate":
                    onApplyTemplateFunction = options.onApplyTemplate;
                    if (!isFunction(onApplyTemplateFunction)) throw Error();
                    break;
                default:
                    throw Error();
            }
        }
        if (cellTemplateElement === null || cellTemplateElement.nodeName.toUpperCase() !== "TEMPLATE") {
            throw Error();
        }
        DataGridColumn.call(this, index, dataGrid);
        this.__cellTemplateElement = cellTemplateElement;
        this.__onApplyTemplateFunction = onApplyTemplateFunction;
    }
    DataGridTemplatedColumn.prototype = Object.create(DataGridColumn.prototype);
    setOwnSrcPropsOnDst({
        __renderCellInitially: function (row, item) {
            var cellIndex = this.getIndex();
            var cell = this.__instantiateTemplate(item);
            var rightSiblingOfCellToRender = row.cells[cellIndex];
            row.insertBefore(cell, rightSiblingOfCellToRender);
        },
        __instantiateTemplate: function (item) {
            var cell = this.__cellTemplateElement.content.cloneNode(true);
            var f = this.__onApplyTemplateFunction;
            f(new DataGridCell(cell, new DataGridRow(item), this));
            return cell;
        }
    }, DataGridTemplatedColumn.prototype);

    function DataGrid(options) {
        var i, n;
        var optionNames = Object.getOwnPropertyNames(options);
        this.__tBodyElem = null;
        this.__tHeadElem = null;
        this.__columns = null;
        var templatedColumns;
        for (i = 0, n = optionNames.length; i < n; i++) {
            switch (optionNames[i]) {
                case "tBody":
                    this.__tBodyElem = options.tBody;
                    if (!isHostElement(this.__tBodyElem) || this.__tBodyElem.tagName !== "TBODY") {
                        throw Error();
                    }
                    break;
                case "templatedColumns":
                    templatedColumns = options.templatedColumns;
                    break;
                default:
                    throw Error();
            }
        }
        if (this.__tBodyElem === null) throw Error();
        var tableElem = this.__tBodyElem.parentNode;
        if (tableElem !== null && tableElem.tagName === "TABLE") {
            this.__tHeadElem = tableElem.tHead;
        }
        if (this.__tHeadElem === null || this.__tHeadElem.tagName !== "THEAD") {
            throw Error();
        }
        this.__initializeColumns(templatedColumns);
    }
    DataGrid.prototype = {
        __initializeColumns: function (templatedColumns) {
            if (!isArrayLike_nonSparse(templatedColumns)) {
                throw Error();
            }
            var i, j, n;
            var temp;
            temp = this.__tHeadElem.rows.single();
            i = 0;
            n = temp.cells.length;
            this.__columns = new Array(n);
            for (; i < n; i++) {
                this.__columns[i] = null;
            }
            for (i = 0, n = templatedColumns.length; i < n; i++) {
                temp = templatedColumns[i];
                j = getOwnProperty(temp, "index");
                if (j < 0 || this.__columns.length < j || !(j % 1) === 0) throw Error();
                temp = setOwnSrcPropsOnDst(temp, {});
                delete temp.index;
                this.__columns[j] = new DataGridTemplatedColumn(temp, j, this);
            }
            for (i = 0, n = this.__columns.length; i < n; i++) {
                if (this.__columns[i] === null) {
                    this.__columns[i] = new DataGridColumn(i, this);
                }
            }

            if (0 < this.__tBodyElem.rows.length) throw Error();
        },
        __renderRowRangeInitially: function (fromIndex, toIndex, items) {
            var rows = this.__tBodyElem.rows;
            var row, item;
            var columns = this.__columns;
            var columnCount = columns.length;
            for (var i = fromIndex; i < toIndex; i++) {
                row = rows[i];
                item = items[i - fromIndex];
                for (var j = 0; j < columnCount; j++) {
                    columns[j].__renderCellInitially(row, item);
                }
                row.style.display = "";
            }
        }
    };
    this.DataGrid = DataGrid;
})();