/// <reference path="FormatUtil.js" />

function l(o) {
    try {
        console.log(o);
    }
    catch (e) {
    }
}

// Browser Identifier variables
var isOpera = navigator.userAgent.indexOf("Opera") > -1;
var isIE = ((navigator.userAgent.indexOf("MSIE") > 1 || navigator.userAgent.indexOf("Trident") > 1) && !isOpera);
var isIE6 = (navigator.userAgent.indexOf("MSIE 6.") > 1 && !isOpera);
var isIE7 = (navigator.userAgent.indexOf("MSIE 7.") > 1 && !isOpera);
var isIE8 = (navigator.userAgent.indexOf("MSIE 8.") > 1 && !isOpera);
var isIE9 = (navigator.userAgent.indexOf("MSIE 9.") > 1 && !isOpera);
var isMoz = (navigator.userAgent.indexOf("Mozilla/5.") == 0 && !isOpera);
var isSafari = (navigator.userAgent.indexOf("AppleWebKit") != 0 && !isOpera && !isMoz);
var isChrome = navigator.userAgent.indexOf("Chrome") > -1;

///////////////////////////////////////////////////////////////////////////////////

var KeyCodes =
{
    BACKSPACE_KEY: 8,
    TAB_KEY: 9,
    ENTER_KEY: 13,
    SHIFT_KEY: 16,
    CTRL_KEY: 17,
    ALT_KEY: 18,
    ESCAPE_KEY: 27,
    SPACE_KEY: 32,
    END_KEY: 35,
    HOME_KEY: 36,
    LEFT_KEY: 37,
    UP_KEY: 38,
    RIGHT_KEY: 39,
    DOWN_KEY: 40,
    COMMA_KEY: 44, //,
    DASH_KEY: 45, //-
    DELETE_KEY: 46,
    DOT_KEY: 46, //.
    N0_KEY: 48,
    N9_KEY: 57,
    A_KEY: 65, //a
    Z_KEY: 90, //z
    WIN_KEY: 91,
    F1_KEY: 112,
    F5_KEY: 116,
    F12_KEY: 123
};

function ListItem(item, next) {
    var instance = this;

    instance.get_next = function () {
        return next;
    };
    instance.set_next = function (value) {
        if (value != null && !value instanceof ListItem) {
            throw Error("ArgumentException: value should be instance of ListItem.");
        }

        next = value;
    };
    instance.get_item = function () {
        return item;
    };
    instance.set_item = function (value) {
        item = value;
    };
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

function EventListenersCollection(listeners) {
    this._listeners = [];
    if (listeners != null) {
        for (var i in listeners) {
            this.AddAnonymousListener(listeners[i]);
        }
    }
};

EventListenersCollection.prototype.AddListener = function (name, listener) {
    this._listeners[name] = listener;
};

EventListenersCollection.prototype.AddAnonymousListener = function (listener) {
    this._listeners.push(listener);
};

EventListenersCollection.prototype.RemoveListener = function (name) {
    if (typeof (this._listeners[name]) != "undefined") this._listeners[name] = null;
};

EventListenersCollection.prototype.RemoveAnonymousListener = function (listener) {
    for (var i in this._listeners) {
        if (this._listeners[i] == listener) this._listeners[i] = null;
    }
};

EventListenersCollection.prototype.NotifyListeners = function () {
    for (var i in this._listeners) {
        if (typeof (this._listeners[i]) == "function" || typeof (this._listeners[i] = eval(this._listeners[i])) == "function") {
            this._listeners[i].apply(this, arguments);
        }
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////

DomUtils = new function () {
    /// <summary>Static class that holds DOM utility functions</summary>
    var thisRef = this;

    thisRef.iterate = function (args) {
        /// <summary>Iterates DOM element and its children and applies a task with current iteration element as a single argument.</summary>
        /// <param name="args" type="Object">Input parameters:
        /// args.node - root DOM element
        /// args.task - iteration task
        /// args.tagName - DOM tag name
        /// </param>
        if (args == null || args.node == null || args.node.childNodes == null || typeof (args.task) != "function") {
            return;
        }

        for (var i = 0, count = args.node.childNodes.length; i < count; i++) {
            var childNode = args.node.childNodes[i];

            if (args.tagName == null || childNode.tagName != null && childNode.tagName.toString().toLowerCase() == args.tagName.toString().toLowerCase()) {
                args.task(childNode);
            }

            if (args.recursive) {
                thisRef.iterate({node: childNode, tagName: args.tagName, task: args.task});
            }
        }
    };

    thisRef.insertTableCell = function (row, cell, index) {
        if (index < row.cells.length) {
            row.insertBefore(cell, row.cells[index]);
        }
        else {
            row.appendChild(cell);
        }
    };

    thisRef.enableSelection = function (target, bEnable) {
        if (typeof (target.onselectstart) != "undefined") //IE route
        {
            target.onselectstart = function () {
                return bEnable;
            };
        }
        else if (typeof (target.style.MozUserSelect) != "undefined") //Firefox route
        {
            target.style.MozUserSelect = bEnable ? "text" : "none";
        }
        else //All other route (ie: Opera) // do we use Opera? :)
        {
            target.onmousedown = function () {
                return bEnable;
            };
        }
    };

    thisRef.findUp = function (elt, params) {
        /// <summary>Finds element with specified set of parameters in the tree of specified element's parents.</summary>
        /// <param name="elt" type="HtmlDomElement">Element to proceed.</param>
        /// <param name="params" type="Object">Set of parameters:
        /// params.el - exact parent to find up.
        /// params.id - id of parent to find up.
        /// param.tag - tag of parent to find up.
        /// </param>
        if (params == null) {
            return null;
        }

        var el = params.el;
        var id = params.id;
        var tag = params.tag;
        var styles = params.styles;
        var attributes = params.attributes;
        do
        {
            if (el != null && elt == el) {
                return elt;
            }

            if (tag != null && elt.nodeName && elt.nodeName.search(tag) != -1 || id != null && elt.id && elt.id == id)
                return elt;
            if (styles != null && elt.style != null) {
                for (var st in styles) {
                    if (elt.style[st] == styles[st]) {
                        return elt;
                    }
                }
            }

            if (attributes != null && elt.attributes != null) {
                for (var st in attributes) {
                    if (elt.getAttribute(st) == attributes[st]) {
                        return elt;
                    }
                }
            }
        }
        while (elt = elt.parentNode);
        return null;
    };

    thisRef.copyAttributes = function (from, to) {
        /// <summary>Copy attributes from one node to another</summary>
        /// <param name="from">Source of the attribtues, not null</param>
        /// <param name="to">Target to copy attributes to, not null</param>
        /// <remarks>Only the following attributes are copied:
        /// id, class, style, rowspan, colspan, cellpadding, cellspacing
        /// </remarks>
        if (from.attributes) {
            for (var i = 0; i < from.attributes.length; i++) {
                var name = from.attributes[i].name;
                if (name == "id" || name == "class" || name == "style" ||
                    name == "rowspan" || name == "colspan" || name == "cellpadding" || name == "cellspacing" ||
                    name == "type" || name == "value" || name == "src" || name == "title") {
                    to.setAttribute(name, from.attributes[i].value);
                }
            }
        }
    };

    thisRef.cloneNode = function (node) {
        /// <summary>Clone node IE compatible way. All nodes are cloned. Note that not all attributes are cloned.
        /// For more information about attributes <see cref="copyAttributes"/></summary>
        /// <param name="node">Node to clone, not null</param>
        /// <returns>DOM element</returns>
        var copy = document.createElement(node.tagName);
        thisRef.copyAttributes(node, copy);
        if (node.childNodes) {
            for (var i = 0; i < node.childNodes.length; i++) {
                var child = node.childNodes[i];
                var childCopy;
                if (child.nodeName == "#text") {
                    childCopy = document.createTextNode(child.nodeValue);
                }
                else {
                    childCopy = thisRef.cloneNode(child);
                }
                copy.appendChild(childCopy);
            }
        }
        return copy;
    };

    thisRef.firstChild = function (node) {
        /// <summary>Get first real (not #text) child element of a node</summary>
        /// <param name="node">DOM node, not null</param>
        /// <returns>DOM element or null</returns>
        return thisRef.child(node, 0);
    };

    thisRef.child = function (node, childIndex) {
        /// <summary>Gets the child at the specific index ignoring #text and script nodes</summary>
        /// <param name="node">Element (not null) which child to find</param>
        /// <param name="childIndex">Index of a child element</param>
        /// <returns>DOM element or null</returns>
        var index = -1;
        if (node == null) {
            debugger;
        }
        for (var i = 0; i < node.childNodes.length; i++) {
            if (node.childNodes[i].nodeName != "#text" && node.childNodes[i].nodeName != "SCRIPT") {
                index++;
                if (index == childIndex)
                    return node.childNodes[i];
            }
        }
        return null;
    };

    thisRef.parent = function (control) {
        /// <summary>Gets the parent node of the control</summary>
        /// <param name="control">Control (DOM element or it's ID) which parent to find, not null</param>
        /// <returns>DOM element</returns>
        if (typeof (control) == "string")
            control = ge(control);
        return isIE ? control.parentElement : control.parentNode;
    };

    thisRef.isParentOf = function (parent, child) {
        /// <summary>Determines whether parent is the parent of the child</summary>
        if (child == null)
            return false;

        var p = thisRef.parent(child);
        while (p != null) {
            if (p == parent)
                return true;

            p = thisRef.parent(p);
        }

        return false;
    };

    thisRef.removeChildren = function (node) {
        /// <summary>Remove all children from a node</summary>
        /// <param name="node">Node (DOM element or it's ID) which children to remove, not null</param>
        if (typeof (node) == "string")
            node = ge(node);
        while (node.hasChildNodes()) {
            node.removeChild(node.firstChild);
        }
    };

    thisRef.clearSelect = function (select) {
        /// <summary>Remove all options from a select</summary>
        /// <param name="node">Select (DOM element or it's ID) which options to remove, not null</param>
        if (typeof (select) == "string")
            select = ge(select);
        while (select.options.length > 0)
            select.remove(0);
    };

    thisRef.fillSelect = function (select, values) {
        /// <summary>Populate select control with values</summary>
        /// <param name="select">Select control, not null</param>
        /// <param name="values">Array of values, not null</param>
        thisRef.clearSelect(select);

        for (var index = 0; index < values.length; index++) {
            var opt = document.createElement("OPTION");
            opt.text = values[index];
            if (isIE)
                select.add(opt);
            else
                select.add(opt, null);
        }
    };

    thisRef.getSelectValuesAsNumber = function (selectObject) {
        var values = [];

        for (var index = 0; index < selectObject.options.length; index++) {
            var option = selectObject.options[index];
            var val = option.value;
            var valueAsFloat = parseFloat(val);
            values.push(valueAsFloat);
        }

        return values;
    };

    thisRef.selectItem = function (selectObject, value, byValue) {
        /// <summary>Select specific item in a dropdown list</summary>
        /// <param name="selectObject">Dropdown list object (html select), not null</param>
        /// <param name="value">Value to select</param>
        /// <param name="byValue">Whether to select item by its value (true) or by text (false)</param>
        /// <returns>true if item has been found and selected</returns>
        for (var index = 0; index < selectObject.options.length; index++) {
            var option = selectObject.options[index];
            if (byValue && option.value == value || !byValue && option.innerHTML == value) {
                selectObject.selectedIndex = index;
                return true;
            }
        }
        return false;
    };

    thisRef.selectNearestItem = function (selectObject, value, byValue) {
        /// <summary>Select item in a dropdown list (html select) with value closest to specified one</summary>
        /// <param name="selectObject">Reference to html select object</param>
        /// <param name="value">Value to find closest match for</param>
        /// <param name="byValue">Whether to search item by its value of text</param>
        var diff = 1000000;
        var index = 0;
        for (var i = 0; i < selectObject.options.length; i++) {
            var option = selectObject.options[i];
            var cd = Math.abs(byValue ? (value - parseFloat(option.value)) : (value - parseFloat(option.innerHTML)));
            if (cd < diff) {
                diff = cd;
                index = i;
            }
        }
        selectObject.selectedIndex = index;

        return index;
    };

    thisRef.replaceElementIds = function (element, idBase) {
        /// <summary>Replace ids for element and all its children. Element gets idBase as its new ID, children that have ID
        /// receive new ids equal to idBase+serial, serial is incremented for each new child</summary>
        /// <param name="element">Element to process. Always receives new ID. Children receive new ID only if they had it already</param>
        /// <param name="idBase">ID for <paramref name="element"/></param>

        var serial = arguments.length == 3 ? arguments[2] : 0;
        if (serial == 0) {
            element.id = idBase;
            serial++;
        }
        else if (element.id && element.id != "") {
            element.id = idBase + serial;
            serial++;
        }
        if (element.nodeType != 1)
            return serial;
        if (element.hasChildNodes()) {
            for (var elem in element.childNodes) {
                serial = thisRef.replaceElementIds(element.childNodes[elem], idBase, serial);
            }
        }
        return serial;
    };

    thisRef.sortSelect = function (select, byValue) {
        var tmpAry = [];

        for (var i = 0; i < select.options.length; i++) {
            tmpAry[i] = [];
            var txt = select.options[i].text;
            var val = select.options[i].value;
            tmpAry[i][0] = byValue ? val : txt;
            tmpAry[i][1] = byValue ? txt : val;
        }

        tmpAry.sort();

        thisRef.clearSelect(select);

        for (var i = 0; i < tmpAry.length; i++) {
            var txt = byValue ? tmpAry[i][1] : tmpAry[i][0];
            var val = byValue ? tmpAry[i][0] : tmpAry[i][1];
            var op = new Option(txt, val);
            select.options[i] = op;
        }
    };

    thisRef.removeControl = function (control) {
        /// <summary>Remove control from DOM tree</summary>
        /// <param name="control">Control to remove, not null</param>
        var parent = thisRef.parent(control);
        if (parent != null)
            parent.removeChild(control);
    };

    thisRef.addSelectItem = function (select, value, text) {
        /// <summary>Adds element to html select item</summary>
        /// <param name="select">Reference to html select object</param>
        /// <param name="value">Value for the item</param>
        /// <param name="text">text for the items. Optional, if not specified value is used instead</param>
        var opt = document.createElement("OPTION");
        opt.text = text == null ? value : text;
        opt.value = value;
        if (isIE)
            select.add(opt);
        else
            select.add(opt, null);

        return opt;
    };

    thisRef.deselectAll = function (selectObject) {
        for (var index = 0; index < selectObject.options.length; index++) {
            var option = selectObject.options[index];
            option.selected = false;
        }
    };

    thisRef.createElement2 = function (tagName, params) {
        var el = document.createElement(tagName);
        if (params != null) {
            if (params.attributes != null) {
                for (var attr in params.attributes) {
                    el.setAttribute(attr, params.attributes[attr]);
                }
            }

            if (params.properties != null) {
                for (var prop in params.properties) {
                    el[prop] = params.properties[prop];
                }
            }

            if (params.styles != null) {
                for (var st in params.styles) {
                    el.style[st] = params.styles[st];
                }
            }

            if (params.innerHTML != null) {
                el.innerHTML = params.innerHTML;
            }

            if (params.children != null) {
                for (var i = 0, count = params.children.length; i < count; i++) {
                    var child = params.children[i];
                    if (child != null) {
                        el.appendChild(child);
                    }
                }
            }
        }

        return el;
    };

    thisRef.createElement = function (tagName, innerValue, attributes, properties, styles, children) {
        var el = document.createElement(tagName);
        if (attributes != null) {
            for (var attr in attributes) {
                el.setAttribute(attr, attributes[attr]);
            }
        }

        if (properties != null) {
            for (var prop in properties) {
                el[prop] = properties[prop];
            }
        }

        if (styles != null) {
            for (var st in styles) {
                el.style[st] = styles[st];
            }
        }

        if (innerValue != null) {
            el.innerHTML = innerValue;
        }

        if (children != null) {
            for (var i = 0, count = children.length; i < count; i++) {
                var child = children[i];
                if (child != null) {
                    el.appendChild(child);
                }
            }
        }

        return el;
    };

    thisRef.createInput = function (type, value, properties, styles, attributes) {
        var el = document.createElement("input");
        if (attributes != null) {
            for (var attr in attributes) {
                el.setAttribute(attr, attributes[attr]);
            }
        }

        if (properties != null) {
            for (var prop in properties) {
                el[prop] = properties[prop];
            }
        }

        if (styles != null) {
            for (var st in styles) {
                el.style[st] = styles[st];
            }
        }

        el.value = value;
        el.type = type;

        return el;
    };

    thisRef.insertFirst = function (container, element) {
        var first = container.firstChild;
        if (first != null) {
            container.insertBefore(element, first);
        }
        else {
            container.appendChild(element);
        }
    };

    thisRef.insertAfter = function (container, element, after) {
        var next = after.nextSibling;
        if (next == null) {
            container.appendChild(element);
        }
        else {
            container.insertBefore(element, next);
        }
    };

    thisRef.absolutePosition = function (elt) {
        var ex = 0, ey = 0;
        do
        {
            var curStyle = isIE ? elt.currentStyle : window.getComputedStyle(elt, '');
            if (curStyle.position == 'fixed') {
                ex += parseInt(curStyle.left, 10);
                ey += parseInt(curStyle.top, 10);
                ex += document.body.scrollLeft;
                ey += document.body.scrollTop;
                break;
            }
            else {
                ex += elt.offsetLeft;
                ey += elt.offsetTop;
            }
        }
        while (elt = elt.offsetParent);

        return {x: ex, y: ey};
    };

    thisRef.scroll = function (el, x, y) {
        if (Math.abs(x * 1) > 0) {
            el.scrollTop += x;
        }

        if (Math.abs(y * 1) > 0) {
            el.scrollLeft += y;
        }
    };

    thisRef.smoothScroll = function (el, steptime, x, speedx, axelx, y, speedy, axely, onScrollEnd) {
        /// <summary>Scrolls inside specified element on a specified amount with specified speed and axelerations</summary>
        /// <param name="el" type="HTMLElement">Element to scroll</param>
        /// <param name="steptime" type="Integer">Time for step (in ms)</param>
        /// <param name="x" type="Integer">Absolute value of amount to scroll by X</param>
        /// <param name="speedx" type="Integer">Step value to increase (decrease) from amount to scroll in a step time by X</param>
        /// <param name="axelx" type="Integer">Axeleration value (multiplier for speed at each step) for X</param>
        /// <param name="y" type="Integer">Absolute value of amount to scroll by Y</param>
        /// <param name="speedy" type="Integer">Step value to increase (decrease) from amount to scroll in a step time by Y</param>
        /// <param name="axely" type="Integer">Axeleration value (multiplier for speed at each step) for Y</param>
        /// <param name="onScrollEnd" type="delegate">Callback function to be executed after scroll is done.</param>

        if (x != null && x > 0 || y != null && y > 0) {
            var change = Math.min(x, Math.abs(speedx)).toFixed(0);
            el.scrollTop += change * (speedx > 0 ? 1 : -1);
            x = Math.max(0, x - change);
            change = Math.min(y, Math.abs(speedy)).toFixed(0);
            el.scrollLeft += change * (speedy > 0 ? 1 : -1);
            y = Math.max(0, y - change);
            speedx *= axelx;
            speedy *= axely;
            setTimeout(function () {
                thisRef.smoothScroll(el, steptime, x, speedx, axelx, y, speedy, axely, onScrollEnd);
            }, steptime);
        }
        else if (typeof (onScrollEnd == "function")) {
            onScrollEnd();
        }
    };

    thisRef.toggleClassName = function (element, className, remove) {
        if (!element || !element.className || element.className.constructor != String || !className || className.constructor != String)
            return;
        var existClasses = ArrayHelper.where(element.className.split(' '), function (item) {
            return item.length > 0;
        });
        var newClasses = remove
            ? ArrayHelper.subtraction(existClasses, [className])
            : ArrayHelper.concatWithoutDuplicate(existClasses, [className]);
        element.className = newClasses.join(' ');
    };

    thisRef.createTableRow = function (t) {
        /// <summary>
        /// Adds new row to given table and returns it.
        /// </summary>
        var tr;
        if (isIE) {
            tr = t.insertRow();
        }
        else {
            tr = document.createElement("tr");
            t.appendChild(tr);
        }
        return tr;
    };
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////

function ge(id) {
    return document.getElementById(id);
}

function getCaretPos(input) {
    var pos = -1;

    if (isIE) {
        var rg = document.selection.createRange().duplicate();
        rg.moveStart('textedit', -1);
        pos = rg.text.length;
    }
    else
        pos = input.selectionStart;

    return pos;
}

function setCaretPos(input, pos) {
    setSelection(input, pos);
}

function setSelection(input, selectionStart, selectionEnd) {
    selectionEnd = selectionEnd || selectionStart;
    if (isIE) {
        var selectionLength = selectionEnd - selectionStart;
        var selectionRange = input.createTextRange();
        selectionRange.collapse(true);
        selectionRange.moveStart("character", selectionStart);
        selectionRange.moveEnd("character", selectionLength);
        selectionRange.select();
    }
    else
        input.setSelectionRange(selectionStart, selectionEnd);
}

function isStringEmpty(str) {
    if (str == null || str == "")
        return true;

    return false;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

EventHelper = new function () {
    var thisRef = this;

    thisRef.getEventTarget = function (event) {
        if (isIE) {
            return window.event.srcElement;
        }
        else {
            return event.target;
        }
    };
    thisRef.fireEvent = function (element, event) {
        if (document.createEventObject) {
            // dispatch for IE
            var evt = document.createEventObject();
            return element.fireEvent('on' + event, evt);
        }
        else {
            // dispatch for firefox + others
            var evt = document.createEvent("HTMLEvents");
            evt.initEvent(event, true, true); // event type,bubbling,cancelable
            return !element.dispatchEvent(evt);
        }
    };
    thisRef.add = function ($obj, $eventName, $function) {
        if ($obj && $obj.attachEvent)
            $obj.attachEvent("on" + $eventName, $function);
        else if ($obj && $obj.addEventListener)
            $obj.addEventListener($eventName, $function, true);
    };

    thisRef.remove = function ($obj, $eventName, $function) {
        if ($obj && $obj.detachEvent)
            $obj.detachEvent('on' + $eventName, $function);
        else if ($obj && $obj.removeEventListener)
            $obj.removeEventListener($eventName, $function, true);
    };

    thisRef.cancel = function (evt) {
        if (evt == null) {
            return;
        }
        if (isIE) {
            evt.cancelBubble = true;
            evt.returnValue = false;
        }
        else {
            if (evt.stopPropagation) evt.stopPropagation();
            if (evt.preventDefault) evt.preventDefault();
        }
    };

    thisRef.eventPosition = function (event) {
        var x, y;
        if (isIE) {
            x = window.event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
            y = window.event.clientY + document.documentElement.scrollTop + document.body.scrollTop;
            return {x: x, y: y};
        }
        return {x: event.pageX, y: event.pageY};
    };
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////

function Point(x, y) {
    this.x = x;
    this.y = y;
}

SizeHelper = new function () {
    var __getLocation;
    var thisRef = this;

    if (isIE) {
        __getLocation = function (element) {
            if (element.self || element.nodeType === 9)
                return new Point(0, 0);
            var clientRect;
            try {
                clientRect = element.getBoundingClientRect();
            }
            catch (e) {
                clientRect = {top: element.offsetTop, left: element.offsetLeft};
            }
            if (!clientRect) {
                return new Point(0, 0);
            }

            var documentElement = element.ownerDocument.documentElement;
            //offset - html border fix for IE v6,7
            var offset = (isIE6 || isIE7 ? 2 : 0);
            var offsetX = clientRect.left - offset + documentElement.scrollLeft;
            var offsetY = clientRect.top - offset + documentElement.scrollTop;

            try {
                var f = element.ownerDocument.parentWindow.frameElement || null;
                if (f) {
                    offset = (f.frameBorder === "0" || f.frameBorder === "no") ? 2 : 0;
                    offsetX += offset;
                    offsetY += offset;
                }
            }
            catch (ex) {
            }

            return new Point(offsetX, offsetY);
        };
    }
    else if (isSafari) {
        __getLocation = function (element) {
            if ((element.window && (element.window === element)) || element.nodeType === 9)
                return new Point(0, 0);
            var offsetX = 0;
            var offsetY = 0;
            var previous = null;
            var previousStyle = null;
            var currentStyle;
            for (var parent = element; parent; previous = parent, previousStyle = currentStyle, parent = parent.offsetParent) {
                currentStyle = __getCurrentStyle(parent);
                var tagName = parent.tagName ? parent.tagName.toUpperCase() : null;
                if ((parent.offsetLeft || parent.offsetTop) &&
                    ((tagName !== "BODY") || (!previousStyle || previousStyle.position !== "absolute"))) {
                    offsetX += parent.offsetLeft;
                    offsetY += parent.offsetTop;
                }
            }
            currentStyle = __getCurrentStyle(element);
            var elementPosition = currentStyle ? currentStyle.position : null;
            if (!elementPosition || (elementPosition !== "absolute")) {
                for (var parent = element.parentNode; parent; parent = parent.parentNode) {
                    tagName = parent.tagName ? parent.tagName.toUpperCase() : null;
                    if ((tagName !== "BODY") && (tagName !== "HTML") && (parent.scrollLeft || parent.scrollTop)) {
                        offsetX -= (parent.scrollLeft || 0);
                        offsetY -= (parent.scrollTop || 0);
                    }
                    currentStyle = __getCurrentStyle(parent);
                    var parentPosition = currentStyle ? currentStyle.position : null;
                    if (parentPosition && (parentPosition === "absolute")) break;
                }
            }
            return new Point(offsetX, offsetY);
        };
    }
    else if (isOpera) {
        __getLocation = function (element) {
            if ((element.window && (element.window === element)) || element.nodeType === 9)
                return new Point(0, 0);
            var offsetX = 0;
            var offsetY = 0;
            var previous = null;
            for (var parent = element; parent; previous = parent, parent = parent.offsetParent) {
                var tagName = parent.tagName;
                offsetX += parent.offsetLeft || 0;
                offsetY += parent.offsetTop || 0;
            }
            var elementPosition = element.style.position;
            var elementPositioned = elementPosition && (elementPosition !== "static");
            for (var parent = element.parentNode; parent; parent = parent.parentNode) {
                tagName = parent.tagName ? parent.tagName.toUpperCase() : null;
                if ((tagName !== "BODY") && (tagName !== "HTML") && (parent.scrollLeft || parent.scrollTop) &&
                    ((elementPositioned &&
                    ((parent.style.overflow === "scroll") || (parent.style.overflow === "auto"))))) {
                    offsetX -= (parent.scrollLeft || 0);
                    offsetY -= (parent.scrollTop || 0);
                }
                var parentPosition = (parent && parent.style) ? parent.style.position : null;
                elementPositioned = elementPositioned || (parentPosition && (parentPosition !== "static"));
            }
            return new Point(offsetX, offsetY);
        };
    }
    else {
        __getLocation = function (element) {
            if ((element.window && (element.window === element)) || element.nodeType === 9)
                return new Point(0, 0);
            var offsetX = 0;
            var offsetY = 0;
            var previous = null;
            var previousStyle = null;
            var currentStyle = null;
            for (var parent = element; parent; previous = parent, previousStyle = currentStyle, parent = parent.offsetParent) {
                var tagName = parent.tagName ? parent.tagName.toUpperCase() : null;
                currentStyle = __getCurrentStyle(parent);
                if ((parent.offsetLeft || parent.offsetTop) && !((tagName === "BODY") &&
                    (!previousStyle || previousStyle.position !== "absolute"))) {
                    offsetX += parent.offsetLeft;
                    offsetY += parent.offsetTop;
                }
                if (previous !== null && currentStyle) {
                    if ((tagName !== "TABLE") && (tagName !== "TD") && (tagName !== "HTML")) {
                        offsetX += parseInt(currentStyle.borderLeftWidth, 10) || 0;
                        offsetY += parseInt(currentStyle.borderTopWidth, 10) || 0;
                    }
                    if (tagName === "TABLE" &&
                        (currentStyle.position === "relative" || currentStyle.position === "absolute")) {
                        offsetX += parseInt(currentStyle.marginLeft, 10) || 0;
                        offsetY += parseInt(currentStyle.marginTop, 10) || 0;
                    }
                }
            }
            currentStyle = __getCurrentStyle(element);
            var elementPosition = currentStyle ? currentStyle.position : null;
            if (!elementPosition || (elementPosition !== "absolute")) {
                for (var parent = element.parentNode; parent; parent = parent.parentNode) {
                    tagName = parent.tagName ? parent.tagName.toUpperCase() : null;
                    if ((tagName !== "BODY") && (tagName !== "HTML") && (parent.scrollLeft || parent.scrollTop)) {
                        offsetX -= (parent.scrollLeft || 0);
                        offsetY -= (parent.scrollTop || 0);
                        currentStyle = __getCurrentStyle(parent);
                        if (currentStyle) {
                            offsetX += parseInt(currentStyle.borderLeftWidth, 10) || 0;
                            offsetY += parseInt(currentStyle.borderTopWidth, 10) || 0;
                        }
                    }
                }
            }
            return new Point(offsetX, offsetY);
        };
    }


    __getWindow = function (element) {
        var doc = element.ownerDocument || element.document || element;
        return doc.defaultView || doc.parentWindow;
    };


    __getCurrentStyle = function (element) {
        if (element.nodeType === 3)
            return null;
        var w = __getWindow(element);
        if (element.documentElement)
            element = element.documentElement;
        var computedStyle = (w && (element !== w) && w.getComputedStyle) ?
            w.getComputedStyle(element, null) :
        element.currentStyle || element.style;

        if (!computedStyle && isSafari && element.style) {
            var oldDisplay = element.style.display;
            var oldPosition = element.style.position;
            element.style.position = 'absolute';
            element.style.display = 'block';
            var style = w.getComputedStyle(element, null);
            element.style.display = oldDisplay;
            element.style.position = oldPosition;
            computedStyle = {};
            for (var n in style) {
                computedStyle[n] = style[n];
            }
            computedStyle.display = 'none';
        }
        return computedStyle;
    };

    thisRef.left = function (elem) {
        if (typeof (elem) == "string")
            elem = ge(elem);
        var loc = __getLocation(elem);
        return loc.x;
    };

    thisRef.top = function (elem) {
        if (typeof (elem) == "string")
            elem = ge(elem);
        var loc = __getLocation(elem);
        return loc.y;
    };

    thisRef.height = function (elem) {
        if (typeof (elem) == "string")
            elem = ge(elem);
        return elem.offsetHeight;
    };

    thisRef.width = function (elem) {
        if (typeof (elem) == "string")
            elem = ge(elem);
        return elem.offsetWidth;
    };

    thisRef.position = function (elem) {
        /// <summary>Gets the position of the element. Result contains fields: left, top, width, height</summary>
        return {
            left: thisRef.left(elem),
            top: thisRef.top(elem),
            width: thisRef.width(elem),
            height: thisRef.height(elem)
        };
    };
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////

String.prototype.format = function () {
    var str = new String(this);
    for (var i = 0; i < arguments.length; i++) {
        str = str.replace('{' + i + '}', arguments[i]);
    }
    return str;
};

String.prototype.ensureStrEnd = function (end) {
    var str = this;
    return (str.lastIndexOf(end) != str.length - end.length) ? (str + end) : (str + "");
};

String.ensureStrEnd = function (str, end) {
    return (str.lastIndexOf(end) != str.length - end.length) ? (str + end) : (str + "");
};

String.prototype.endsWith = function (end) {
    if (isStringEmpty(end))
        return true;

    end = String(end);
    var str = this;

    if (this.length < end.length)
        return false;

    return (str.lastIndexOf(end) - (this.length - end.length)) == 0;
};

String.prototype.trim = function () {
    return this.replace(/^\s*/, "").replace(/\s*$/, "");
};

String.prototype.pad = function (padString, length) {
    var str = this;
    var absLength = Math.abs(length);
    if (length > 0) {
        while (str.length < absLength)
            str = padString + str;
    }
    else {
        while (str.length < absLength)
            str = str + padString;
    }

    return str;
};

String.prototype.htmlDecode = function () {
    var str = this;
    str = str.replace(/\&amp;/g, '&');
    str = str.replace(/\&lt;/g, '<');
    str.replace(/\&gt;/g, '>');
    return str;
};

String.isNullOrEmpty = function (str) {
    return !str;
};

String.isNullOrWhiteSpace = function (str) {
    return (str || "").trim() == "";
};

if (window.Node && window.Node.__defineGetter__) {
    Node.prototype.__defineGetter__('innerText', function () {
        if (this.nodeType == 3)
            return this.nodeValue;
        else {
            var result = '';
            for (var child = this.firstChild; child; child = child.nextSibling)
                result += child.innerText;
            return result;
        }
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

CallHandlers = function () {
    var handlers = [];
    var instance = this;

    instance.dirty = function () {
        return handlers.length > 0;
    };

    instance.clear = function () {
        handlers = [];
    };

    instance.addHandler = function (handler, state) {
        if (typeof (handler) == "function") {
            handlers.push({handler: handler, state: state});
        }
    };

    instance.removeHandler = function (handler, state) {
        var newHandlers = [];
        var tempHandler;
        var removed;
        for (var i = 0, count = handlers.length; i < count; i++) {
            if ((tempHandler = handlers[i]).handler === handler && removed == null && (state == null || tempHandler.state === state)) {
                removed = tempHandler.handler;
            }
            else {
                newHandlers.push(tempHandler);
            }
        }

        handlers = newHandlers;
        return removed;
    };

    instance.call = function (source, args, stateCondition) {
        var callArgs = args instanceof Array ? args : [];
        var statePos = callArgs.length;
        callArgs.push(null);
        var tempHnd;
        for (var i = 0, count = handlers.length; i < count; i++) {
            var state = (tempHnd = handlers[i]).state;
            if (typeof (stateCondition) == "function" && !stateCondition(state)) {
                continue;
            }

            callArgs[statePos] = state;
            tempHnd.handler.apply(source, callArgs);
        }
    };

    //debugger;
    if (window.isDebugMode) {
        instance.get_handlers = function () {
            return handlers;
        };
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////

ArrayHelper = new function () {
    var thisRef = this;

    thisRef.groupBy = function (array, member) {
        var result = {};
        var item;
        var bag;
        for (var i = 0, length = array.length; i < length; i++) {
            item = array[i];
            key = item[member];
            bag = result[key];
            if (bag == null) {
                bag = result[key] = [];
            }

            bag.push(item);
        }

        return result;
    };

    thisRef.clone = function (source) {
        var result = {};
        if (source instanceof Array) {
            result = [];
            if (source != null) {
                for (var i = 0; i < source.length; i++)
                    result[i] = source[i];
            }
        }
        else {
            if (source != null) {
                for (var i in source)
                    result[i] = source[i];
            }
        }
        return result;
    };

    thisRef.search = function (array, qualifier) {
        if (array == null || array.length == null || !(array.length > 0) || typeof (qualifier) != "function") {
            return -1;
        }

        for (var i = 0, length = array.length; i < length; i++) {
            if (qualifier(array[i])) {
                return i;
            }
        }
        return -1;
    };

    thisRef.indexOf = function (array, element, comparer) {
        if (arguments.length <= 1 || element == null || array == null || !((array) instanceof (Array)) || array.length <= 0) {
            return -1;
        }

        var length = array.length;
        if (typeof (comparer) != "function") {
            comparer = function (a, b) {
                return a === b;
            };
        }

        for (var i = 0; i < length; i++) {
            if (comparer(array[i], element)) {
                return i;
            }
        }

        return -1;
    };

    thisRef.contains = function (array, element, comparer) {
        return (thisRef.indexOf(array, element, comparer) != -1);
    };

    thisRef.remove = function (array, obj) {
        var a = [];
        for (var i = 0; i < array.length; i++) {
            if (array[i] != obj) {
                a.push(array[i]);
            }
        }
        return a;
    };

    thisRef.pushWithoutDuplicate = function (array, element) {
        if (arguments.length <= 1 || element == null || array == null || !((array) instanceof (Array)) || thisRef.contains(array, element)) {
            return false;
        }

        try {
            array.push(element);
            return true;
        }
        catch (er) {
            return false;
        }
    };

    thisRef.getWithoutDuplicate = function (array) {
        var result = [];
        for (var i = 0; i < array.length; i++) {
            var item = array[i];
            if (!thisRef.contains(result, item))
                result.push(item);
        }
        return result;
    };

    thisRef.concat = function (array1, array2) {
        var result = [];
        for (var i = 0; i < array1.length; i++) {
            result.push(array1[i]);
        }
        for (var i = 0; i < array2.length; i++) {
            result.push(array2[i]);
        }
        return result;
    };

    thisRef.concatWithoutDuplicate = function (array1, array2) {
        var result = [];
        for (var i = 0; i < array1.length; i++) {
            var item = array1[i];
            if (!thisRef.contains(result, item))
                result.push(item);
        }
        for (var i = 0; i < array2.length; i++) {
            var item = array2[i];
            if (!thisRef.contains(result, item))
                result.push(item);
        }
        return result;
    };

    thisRef.where = function (array, predicate) {
        var result = [];
        var item;
        for (var i = 0, length = array.length; i < length; i++) {
            if (predicate(item = array[i])) {
                result.push(item);
            }
        }

        return result;
    };

    thisRef.indexesWhere = function (array, predicate) {
        var result = [];
        for (var i = 0, length = array.length; i < length; i++) {
            if (predicate(array[i])) {
                result.push(i);
            }
        }

        return result;
    };
    thisRef.select = function (array, selector) {
        var result = [];
        for (var i = 0, length = array.length; i < length; i++) {
            result.push(selector(array[i]));
        }

        return result;
    };

    thisRef.max = function (array, selector) {
        if (selector == null || typeof (selector) != "function") {
            selector = function (i) {
                return i;
            };
        }
        var result = selector(array[0]);
        var temp;
        for (var i = 1, length = array.length; i < length; i++) {
            if (result < (temp = selector(array[i]))) {
                result = temp;
            }
        }

        return result;
    };

    thisRef.min = function (array, selector) {
        if (selector == null || typeof (selector) != "function") {
            selector = function (i) {
                return i;
            };
        }
        var result = selector(array[0]);
        var temp;
        for (var i = 1, length = array.length; i < length; i++) {
            if (result > (temp = selector(array[i]))) {
                result = temp;
            }
        }

        return result;
    };

    thisRef.getCount = function (array, item) {
        var cnt = 0;
        for (var i = 0; i < array.length; i++) {
            if (array[i] == item)
                cnt++;
        }
        return cnt;
    };

    thisRef.distinct = function (array, comparer) {
        if (typeof (comparer) != "function") {
            comparer = function (a, b) {
                return a == b;
            };
        }

        var result = [];
        for (var i = 0, count = array.length; i < count; i++) {
            var found = false;
            var el = array[i];
            for (var j = 0, jCount = result.length; j < jCount; j++) {
                if (comparer(el, result[j])) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                result.push(el);
            }
        }

        return result;
    };

    thisRef.applyAction = function (array, action) {
        if (typeof (action) != "function") {
            return;
        }

        for (var i = 0, count = array.length; i < count; i++) {
            action(array[i], i);
        }
    };

    thisRef.instancesOfType = function (array, type) {
        var result = [];
        var element;
        for (var i = 0, count = array.length; i < count; i++) {
            if ((element = array[i]) instanceof (type)) {
                result.push(element);
            }
        }

        return result;
    };

    thisRef.subtraction = function (array1, array2) {
        var result = [];
        for (var i in array1) {
            var a1 = array1[i];
            if (thisRef.indexOf(array2, a1) == -1) {
                result.push(a1);
            }
        }
        return result;
    };

    thisRef.limit = function (array, min, max) {
        /// <summary>Bounds given number array from min to max</summary>
        var result = [];
        for (var i in array) {
            var item = array[i];
            if (item >= min && item <= max)
                result.push(item);
        }
        return result;
    };

    thisRef.getNearestItem = function (array, value) {
        /// <summary>Gets item from array with value closest to specified one</summary>
        var diff = 1000000;
        var index = 0;

        for (var i = 0; i < array.length; i++) {
            var item = array[i];
            var cd = Math.abs(value - item);
            if (cd < diff) {
                diff = cd;
                index = i;
            }
        }

        return array[index];
    };

    thisRef.equals = function (array1, array2, comparer) {
        if (!(array1 instanceof Array) || !(array2 instanceof Array)) {
            return false;
        }

        if (array1.length != array2.length) {
            return false;
        }

        if (typeof (comparer) != 'function') {
            comparer = function (a, b) {
                return a === b;
            };
        }

        for (var i = 0; i < array1.length; ++i) {
            if (!comparer(array1[i], array2[i]))
                return false;
        }

        return true;
    };

    thisRef.count = function (array, condition) {
        if (array == null || typeof (condition) != "function") {
            return 0;
        }

        var result = 0;
        for (var i = 0, count = array.length; i < count; i++) {
            if (condition(array[i])) {
                result++;
            }
        }

        return result;
    };

    thisRef.toCircleList = function (array) {
        /// <summary>Converts simple array into linked list with the end element nexting to the first.</summary>
        /// <param name="array" type="Array">Source array</param>
        /// <returns type="ListItem">First linked item.</returns>

        if (array == null || !array.length) {
            return undefined;
        }

        var first;
        var item;
        for (var i = 0; i < array.length; i++) {
            var element = array[i];
            var next = new ListItem(element);
            if (item == null) {
                first = item = next;
            }
            else {
                item.set_next(next);
                item = next;
            }
        }

        item.set_next(first);
        return first;
    };
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////

TimeoutHelper = function (timeoutInterval, callbackFunction) {
    var _timeout = null;
    var _callback = ((callbackFunction) instanceof (Function)) ? callbackFunction : function () {
    };
    var _timeoutInterval = isNaN(timeoutInterval) ? 500 : timeoutInterval;
    var instance = this;
    instance.inCall = false;

    instance.set_timeoutInterval = function (value) {
        if (!isNaN(value)) {
            _timeoutInterval = value;
        }
    };

    instance.set_callback = function (value) {
        if ((value) instanceof (Function)) {
            _callback = value;
        }
    };

    instance.call = function () {
        instance.inCall = true;
        if (!isNaN(_timeout)) {
            clearTimeout(_timeout);
        }

        var callThis = this;
        var callParameters = arguments;
        _timeout = setTimeout(function () {
            _callback.apply(callThis, callParameters);
            instance.inCall = false;
        }, _timeoutInterval);
    };
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////

Cookies = {
    aliases: {},

    alias: function (alias, name, defaultValue) {
        Cookies.aliases[alias] = name;
        Cookies[alias] = function (value, days) {
            if (value == null)
                return Cookies.get(name, defaultValue);
            else
                Cookies.set(name, value, days);
        };
    },

    set: function (name, value, days) {
        name = Cookies.aliases[name] || name;

        var expires = '';

        if (!isNaN(days)) {
            var date = new Date();
            date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
            expires = "; expires=" + date.toGMTString();
        }

        document.cookie = name + "=" + escape(value) + expires + "; path=/";
    },

    get: function (name, defaultValue) {
        name = Cookies.aliases[name] || name;

        var regex = new RegExp(name + "s*=s*(.*?)(;|$)");
        var cookies = document.cookie.toString();
        var match = cookies.match(regex);

        if (match)
            return unescape(match[1]);

        return defaultValue;
    },

    erase: function (name) {
        Cookies.set(name, '', -1);
    }
};

var delete_cookie = function(name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////

DateHelper =
{
    offset: 8,

    formatCurrentTime: function () {
        var now = new Date();
        now.setHours(now.getHours() - this.offset);
        var hour = now.getHours();
        var minutes = now.getMinutes();
        return "{0}:{1} {2} ET".format(hour == 0 ? 12 : hour > 12 ? hour - 12 : hour, minutes < 10 ? ("0" + minutes) : minutes, hour < 12 ? "AM" : "PM");
    },

    timeToClose: function () {
        var now = new Date();
        now.setHours(now.getHours() - this.offset);

        var close = new Date();
        close.setHours(19, 0, 0, 0);

        var ticks = close - now;
        var h = Math.floor(ticks / (1000 * 60 * 60));
        var m = Math.floor((ticks - h * 1000 * 60 * 60) / (1000 * 60));
        var s = Math.floor((ticks - h * 1000 * 60 * 60 - m * 1000 * 60) / 1000);
        return "{0}:{1}:{2}".format(h, (m < 10) ? ("0" + m) : m, (s < 10) ? ("0" + s) : s);
    },

    formatCurrentDate: function () {
        var now = new Date();
        now.setHours(now.getHours() - this.offset);
        var hour = now.getHours();
        var minutes = now.getMinutes();
        return "{0}/{1}/{2} {3}:{4} {5} ET".format(
            now.getUTCMonth() + 1,
            now.getUTCDate(),
            now.getUTCFullYear(),
            hour == 0 ? 12 : hour > 12 ? hour - 12 : hour,
            minutes < 10 ? ("0" + minutes) : minutes,
            hour < 12 ? "AM" : "PM");
    },

    getCurrentDateTime: function () {
        var now = new Date();
        now.setHours(now.getHours() - this.offset);
        return now;
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////

var SortDirection =
{
    Ascending: 0,
    Descending: 1
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////

QueryStringHelper = new function () {
    var thisRef = this;
    var params = [];

    thisRef.getParam = function (paramName) {
        paramName = paramName.toLowerCase();
        var p = params[paramName];
        if (typeof (p) == "undefined")
            return null;
        return p;
    };

    thisRef.getParamFromString = function (url, paramName) {
        paramName = paramName.toLowerCase();
        var localParams = [];
        var arr = url.split("&");

        for (var i = 0; i < arr.length; i++) {
            var pair = arr[i] + "";
            if (!isStringEmpty(pair)) {
                var pairArray = pair.split("=");
                var key = pairArray[0] + "";
                var value = pairArray[1] + "";

                if (!isStringEmpty(key) && !isStringEmpty(value))
                    localParams[key.toLowerCase()] = value;
            }
        }

        var p = localParams[paramName];
        if (typeof (p) == "undefined")
            return null;
        return p;
    };

    function init() {
        var s = document.location.search;
        s = s.replace("?", "");
        var arr = s.split("&");
        for (var i = 0; i < arr.length; i++) {
            var pair = arr[i] + "";
            if (!isStringEmpty(pair)) {
                var pairArray = pair.split("=");
                var key = pairArray[0] + "";
                var value = pairArray[1] + "";

                if (!isStringEmpty(key) && !isStringEmpty(value))
                    params[key.toLowerCase()] = value;
            }
        }
    }

    init();
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////

ObjectsHelper = new function () {
    var thisRef = this;

    thisRef.areObjectsEqual = function (o1, o2) {
        if (o1 == null && o2 == null)
            return true;

        if ((o1 != null && o2 == null) || (o1 == null && o2 != null))
            return false;

        for (var i in o1) {
            var value1 = o1[i];
            var value2 = o2[i];

            if (value1 != value2)
                return false;
        }

        return true;
    };

    thisRef.merge = function (o1, o2) {
        if (!o1)
            o1 = {};

        for (var i in o2) {
            if (o1[i] == null)
                o1[i] = o2[i];
        }

        return o1;
    };
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////


/*
 http://www.JSON.org/json2.js
 2011-02-23

 Public Domain.

 NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

 See http://www.JSON.org/js.html


 This code should be minified before deployment.
 See http://javascript.crockford.com/jsmin.html

 USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
 NOT CONTROL.


 This file creates a global JSON object containing two methods: stringify
 and parse.

 JSON.stringify(value, replacer, space)
 value       any JavaScript value, usually an object or array.

 replacer    an optional parameter that determines how object
 values are stringified for objects. It can be a
 function or an array of strings.

 space       an optional parameter that specifies the indentation
 of nested structures. If it is omitted, the text will
 be packed without extra whitespace. If it is a number,
 it will specify the number of spaces to indent at each
 level. If it is a string (such as '\t' or '&nbsp;'),
 it contains the characters used to indent at each level.

 This method produces a JSON text from a JavaScript value.

 When an object value is found, if the object contains a toJSON
 method, its toJSON method will be called and the result will be
 stringified. A toJSON method does not serialize: it returns the
 value represented by the name/value pair that should be serialized,
 or undefined if nothing should be serialized. The toJSON method
 will be passed the key associated with the value, and this will be
 bound to the value

 For example, this would serialize Dates as ISO strings.

 Date.prototype.toJSON = function (key) {
 function f(n) {
 // Format integers to have at least two digits.
 return n < 10 ? '0' + n : n;
 }

 return this.getUTCFullYear()   + '-' +
 f(this.getUTCMonth() + 1) + '-' +
 f(this.getUTCDate())      + 'T' +
 f(this.getUTCHours())     + ':' +
 f(this.getUTCMinutes())   + ':' +
 f(this.getUTCSeconds())   + 'Z';
 };

 You can provide an optional replacer method. It will be passed the
 key and value of each member, with this bound to the containing
 object. The value that is returned from your method will be
 serialized. If your method returns undefined, then the member will
 be excluded from the serialization.

 If the replacer parameter is an array of strings, then it will be
 used to select the members to be serialized. It filters the results
 such that only members with keys listed in the replacer array are
 stringified.

 Values that do not have JSON representations, such as undefined or
 functions, will not be serialized. Such values in objects will be
 dropped; in arrays they will be replaced with null. You can use
 a replacer function to replace those with JSON values.
 JSON.stringify(undefined) returns undefined.

 The optional space parameter produces a stringification of the
 value that is filled with line breaks and indentation to make it
 easier to read.

 If the space parameter is a non-empty string, then that string will
 be used for indentation. If the space parameter is a number, then
 the indentation will be that many spaces.

 Example:

 text = JSON.stringify(['e', {pluribus: 'unum'}]);
 // text is '["e",{"pluribus":"unum"}]'


 text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
 // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

 text = JSON.stringify([new Date()], function (key, value) {
 return this[key] instanceof Date ?
 'Date(' + this[key] + ')' : value;
 });
 // text is '["Date(---current time---)"]'


 JSON.parse(text, reviver)
 This method parses a JSON text to produce an object or array.
 It can throw a SyntaxError exception.

 The optional reviver parameter is a function that can filter and
 transform the results. It receives each of the keys and values,
 and its return value is used instead of the original value.
 If it returns what it received, then the structure is not modified.
 If it returns undefined then the member is deleted.

 Example:

 // Parse the text. Values that look like ISO date strings will
 // be converted to Date objects.

 myData = JSON.parse(text, function (key, value) {
 var a;
 if (typeof value === 'string') {
 a =
 /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
 if (a) {
 return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
 +a[5], +a[6]));
 }
 }
 return value;
 });

 myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
 var d;
 if (typeof value === 'string' &&
 value.slice(0, 5) === 'Date(' &&
 value.slice(-1) === ')') {
 d = new Date(value.slice(5, -1));
 if (d) {
 return d;
 }
 }
 return value;
 });


 This is a reference implementation. You are free to copy, modify, or
 redistribute.
 */

/*jslint evil: true, strict: false, regexp: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
 call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
 getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
 lastIndex, length, parse, prototype, push, replace, slice, stringify,
 test, toJSON, toString, valueOf
 */


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    "use strict";

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
            this.getUTCFullYear() + '-' +
            f(this.getUTCMonth() + 1) + '-' +
            f(this.getUTCDate()) + 'T' +
            f(this.getUTCHours()) + ':' +
            f(this.getUTCMinutes()) + ':' +
            f(this.getUTCSeconds()) + 'Z' : null;
        };

        String.prototype.toJSON =
            Number.prototype.toJSON =
                Boolean.prototype.toJSON = function (key) {
                    return this.valueOf();
                };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

        // If the string contains no control characters, no quote characters, and no
        // backslash characters, then we can safely slap some quotes around it.
        // Otherwise we must also replace the offending characters with safe escape
        // sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c :
            '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

        // Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

        // If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
            typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

        // If we were called with a replacer function, then call the replacer to
        // obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

        // What happens next depends on the value's type.

        switch (typeof value) {
            case 'string':
                return quote(value);

            case 'number':

                // JSON numbers must be finite. Encode non-finite numbers as null.

                return isFinite(value) ? String(value) : 'null';

            case 'boolean':
            case 'null':

                // If the value is a boolean or null, convert it to a string. Note:
                // typeof null does not produce 'null'. The case is included here in
                // the remote chance that this gets fixed someday.

                return String(value);

            // If the type is 'object', we might be dealing with an object or an array or
            // null.

            case 'object':

                // Due to a specification blunder in ECMAScript, typeof null is 'object',
                // so watch out for that case.

                if (!value) {
                    return 'null';
                }

                // Make an array to hold the partial results of stringifying this object value.

                gap += indent;
                partial = [];

                // Is the value an array?

                if (Object.prototype.toString.apply(value) === '[object Array]') {

                    // The value is an array. Stringify every element. Use null as a placeholder
                    // for non-JSON values.

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }

                    // Join all of the elements together, separated with commas, and wrap them in
                    // brackets.

                    v = partial.length === 0 ? '[]' : gap ?
                    '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                    '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }

                // If the replacer is an array, use it to select the members to be stringified.

                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === 'string') {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {

                    // Otherwise, iterate through all of the keys in the object.

                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }

                // Join all of the member texts together, separated with commas,
                // and wrap them in braces.

                v = partial.length === 0 ? '{}' : gap ?
                '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
                '{' + partial.join(',') + '}';
                gap = mind;
                return v;
        }
    }

    // If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

            // The stringify method takes a value and an optional replacer, and an optional
            // space parameter, and returns a JSON text. The replacer can be a function
            // that can replace values, or an array of strings that will select the keys.
            // A default replacer method can be provided. Use of the space parameter can
            // produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

            // If the space parameter is a number, make an indent string containing that
            // many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

                // If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

            // If there is a replacer, it must be a function or an array.
            // Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                (typeof replacer !== 'object' ||
                typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

            // Make a fake root object containing our value under the key of ''.
            // Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


    // If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

            // The parse method takes a text and an optional reviver function, and returns
            // a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

                // The walk method is used to recursively walk the resulting structure so
                // that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


            // Parsing happens in four stages. In the first stage, we replace certain
            // Unicode characters with escape sequences. JavaScript handles many characters
            // incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

            // In the second stage, we run the text against regular expressions that look
            // for non-JSON patterns. We are especially concerned with '()' and 'new'
            // because they can cause invocation, and '=' because it can cause mutation.
            // But just to be safe, we want to reject all unexpected forms.

            // We split the second stage into 4 regexp operations in order to work around
            // crippling inefficiencies in IE's and Safari's regexp engines. First we
            // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
            // replace all simple value tokens with ']' characters. Third, we delete all
            // open brackets that follow a colon or comma or that begin the text. Finally,
            // we look to see that the remaining characters are only whitespace or ']' or
            // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

                // In the third stage we use the eval function to compile the text into a
                // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
                // in JavaScript: it can begin a block or an object literal. We wrap the text
                // in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

                // In the optional fourth stage, we recursively walk the new structure, passing
                // each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

            // If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
