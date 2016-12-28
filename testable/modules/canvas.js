'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.zoomOut = exports.zoomIn = exports.fadeIn = exports.fadeOut = exports.ImageCrop = exports.HitArea = exports.TextBox = exports.CImage = exports.FilledRect = exports.Layer = exports.Canvas = undefined;

var _make = require('../util/make');

let elementMetaData = new WeakMap(); /**
                                      * @module Canvas
                                      */

let sortElements = function (element) {
    element._elements.sort((a, b) => {
        if (a.zLevel > b.zLevel) {
            return 1;
        } else if (a.zLevel < b.zLevel) {
            return -1;
        } else {
            return 0;
        }
    });
};

let layerRender = function (context, canvas) {
    sortElements(this);
    this.elements.forEach(item => item.render(context, canvas));
};

/**
 * A local render context.
 *
 * @lends Context.prototype
 */
let Context = {
    yOffset: 0,
    xOffset: 0,
    available: true,
    rendering: false,

    /**
     * the last usable render data.
     *
     * @type {RenderData}
     */
    lastRenderData: null,

    /**
     * the current dom element.
     *
     * @type {HTMLCanvasElement}
     */
    canvasDomElement: null,

    /**
     * @constructs
     *
     * @param {HTMLCanvasElement} canvasDomElement the html element of the canvas.
     *
     * @return {void}
     */
    _make: function (canvasDomElement) {
        this.canvasDomElement = canvasDomElement;
    },

    finally: function () {},

    addOffset: function (x, y) {
        this.yOffset += y;
        this.xOffset += x;
    },
    removeOffset: function (x, y) {
        this.yOffset -= y;
        this.xOffset -= x;
    }
};

/**
 * Meta data object for canvas elements
 *
 * @lends ElementMetaData.prototype
 */
let ElementMetaData = {
    /**
     * @type {RenderData}
     */
    backgroundRenderData: null,
    isRendered: false
};

/**
 * Coordinates and bitmap for a canvas image data.
 *
 * @lends RenderData
 */
let RenderData = {
    left: 0,
    top: 0,

    /**
     * @type {ImageData}
     */
    data: null,

    _make: function (x, y, data) {
        this.x = x;
        this.y = y;
        this.data = data;
    }
};

let verifyOpacity = function (n) {
    if (n > 1) return 1;else if (n < 0) return 0;else return n;
};

// Classes
let Canvas = exports.Canvas = {

    cursor: 'default',
    maxFps: 60,
    fpsLock: true,
    fpsOverlay: false,
    _elements: [],
    _dom: null,
    context: null,
    renderStart: 0,
    fpsOverlay: null,
    _fps: 0,
    _frames: 0,

    _make: function (target) {
        this._dom = target;
        this._elements = [];
        this.context = target.getContext('2d');

        // set up cursor handling
        this._dom.addEventListener('mousemove', function (e) {
            let mouse = { x: e.layerX, y: e.layerY };
            let context = (0, _make.Make)(Context)();

            sortElements(this);

            for (let i = this._elements.length - 1; i >= 0; i--) {
                let element = this._elements[i].checkMouse(mouse, context);

                if (element) {
                    let style = element.cursor || this.cursor;

                    if (this.style.getPropertyValue('cursor') != style) {
                        this.style.setProperty('cursor', style);
                        break;
                    }
                }
            }
            context.finally();

            if (context.available && this.style.getPropertyValue() != this.cursor) {
                this.style.setProperty('cursor', this.cursor);
            }
        }, { passive: true });

        /**
         * suppress contextmenu
         *
         * @param {MouseEvent} event the mouse event
         *
         * @return {void}
         */
        this._dom.addEventListener('contextmenu', event => {
            event.preventDefault();
            return false;
        }, false);

        /**
         * capture clicks
         *
         * @param {MouseEvent} event the click event
         *
         * @return {void}
         */
        this._dom.addEventListener('click', event => {
            let context = (0, _make.Make)(Context)();
            let mouse = { x: event.layerX, y: event.vlayerY };

            sortElements(this);

            for (let i = this._elements.length - 1; i >= 0; i--) {
                if (this._elements[i].checkClick(mouse, context)) {
                    return;
                }
            }
        }, false);

        // create FPS overlay
        this.fpsOverlay = (0, _make.Make)(Layer)(10, this._dom.height - 60, 0);
        this.fpsOverlay.addElement((0, _make.Make)(FilledRect)(0, 0, 150, 60, '#000', 0));
        this.fpsOverlay.addElement((0, _make.Make)(TextBox)('FPS: 0', 0, 0, 1));
        this.fpsOverlay.elements(1).color = '#fff';
        this.fpsOverlay.addElement((0, _make.Make)(TextBox)('Frames: 0', 0, 15, 1));
        this.fpsOverlay.elements(2).color = '#fff';
        this.fpsOverlay.addElement((0, _make.Make)(TextBox)('FPS Lock: off', 0, 30, 1));
        this.fpsOverlay.elements(3).color = '#fff';
    },

    render: function () {
        if (this.isRunning) {
            let context = (0, _make.Make)(Context);
            let start = window.performance.now();

            this.context.save();
            this.context.clearRect(0, 0, this._dom.width, this._dom.height);
            this.context.globalAlpha = 1;
            layerRender.apply(this, [context, this.context]);

            if (this.fpsOverlay) {
                this.fpsOverlay.elements(1).content = 'FPS: ' + Math.round(this.fps);
                this.fpsOverlay.elements(2).content = 'Frames: ' + this.frames;
                this.fpsOverlay.elements(3).content = 'FPS Lock: ' + (this.fpsLock ? 'on' : 'off');
                this.fpsOverlay.render(context, this.context);
            }

            let duration = (Date.now() - this.renderStart) / 1000;
            let renderTime = (Date.now() - start) / 1000;
            this.fps = 1 / duration;
            this.frames++;

            //          fps lock
            if (this.fpsLock) {
                let timeForFrame = 1 / this.maxFps;
                if (renderTime < timeForFrame) {
                    let timeOut = (timeForFrame - renderTime) * 1000;
                    this._renderStart = window.performance.now();
                    window.setTimeout(() => window.requestAnimationFrame(this.render.bind(this)), timeOut);
                    return;
                }
            }
            this.renderStart = window.performance.now();
            window.requestAnimationFrame(this.render.bind(this));
        }
    },

    start: function () {
        this.isRunning = true;
        window.requestAnimationFrame(this.render.bind(this));
    },

    stop: function () {
        this.isRunning = false;
    },

    addElement: function (element) {
        element = (0, _make.Make)(element, Object.getPrototypeOf(element));
        Object.freeze(element);

        if (!elementMetaData.has(element)) {
            elementMetaData.set(element, (0, _make.Make)(ElementMetaData)());
        }

        this._elements.push(element);
    },

    get height() {
        return this._dom.height;
    },

    get width() {
        return this._dom.width;
    },

    get fps() {
        return this._fps;
    },

    get frames() {
        return this._frames;
    },

    measureText: function (textElement) {
        this.context.font = textElement.font;
        this.context.textAling = textElement.aling;
        this.context.fillStyle = textElement.color;
        this.context.textBaseline = 'top';
        return this.context.measureText(textElement.content);
    },

    measureTextWidth: function (textElement) {
        let lines = textElement.content.split('\n');
        let linesWidth = [];

        this.context.font = textElement.font;
        this.context.textAling = textElement.aling;
        this.context.fillStyle = textElement.color;
        this.context.textBaseline = 'top';
        lines.forEach(item => linesWidth.push(this.context.measureText(item).width));

        return Math.max.apply(Math, linesWidth);
    },

    measureTextHeight: function (text, lineHeight) {
        if (text !== '') return text.split('\n').length * lineHeight;else return 0;
    },

    elements: function (index) {
        return this._elements[index];
    }
};

/**
 * Basic canvas element.
 *
 * @lends {Element.prototype}
 */
let Element = {

    /**
     * saves the image data that has been rendered before this element.
     *
     * @param  {Context} context the local render context
     * @param  {CanvasRenderingContext2D} canvas the canvas render context
     *
     * @return {void}
     */
    render: function (context, canvas) {
        /** @type {ElementMetaData} */
        let metaData = elementMetaData.get(this);

        if (metaData.backgroundRenderData) {
            let height = this.height || context.canvasDomElement.height - context.yOffset;
            let width = this.width || context.canvasDomElement.width - context.xOffset;
            let imageData = canvas.getImageData(context.xOffset, context.yOffset, width, height);

            metaData.backgroundRenderData = (0, _make.Make)(RenderData)(context.xOffset, context.yOffset, imageData);
        } else {
            canvas.putImageData(metaData.backgroundRenderData.data, metaData.backgroundRenderData.left, metaData.backgroundRenderData.top);
        }

        metaData.isRendered = true;
    }
};

let Layer = exports.Layer = (0, _make.Make)({
    x: 0,
    y: 0,
    opacity: 1,
    _elements: null,

    _make: function (x = 0, y = 0, zLevel = 0) {
        this._elements = [];
        this.zLevel = zLevel;
        this.x = x;
        this.y = y;

        this._make = null;
    },

    render: function (context, canvas) {
        /** @type {ElementMetaData} */
        let metaData = elementMetaData.get(this);

        if (!metaData.isRendered) {
            Element.render.apply(this, [context, canvas]);

            context.addOffset(this.x, this.y);
            canvas.save();
            canvas.globalAlpha = verifyOpacity(canvas.globalAlpha - (1 - this.opacity));
            layerRender.apply(this, [context, canvas]);
            context.removeOffset(this.x, this.y);
            canvas.restore();
        }
    },

    addElement: Canvas.addElement,

    checkMouse: function (mouse, context) {
        let element = null;

        context.addOffset(this.x, this.y);
        sortElements(this);

        for (let i = this._elements.length - 1; i >= 0; i--) {
            let item = this._elements[i].checkMouse(mouse, context);

            if (item) {
                element = item;
                break;
            }
        }

        context.removeOffset(this.x, this.y);
        return element;
    },

    checkClick: function (mouse, context) {
        context.addOffset(this.x, this.y);
        sortElements(this);

        for (let i = this._elements.length - 1; i >= 0; i--) {
            if (this._elements[i].checkClick(mouse, context)) {
                return true;
            }
        }

        context.removeOffset(this.x, this.y);
    },

    clear: function () {
        this._elements = [];
    }

}, Element).get();

let RectShapeElement = {
    x: 0,
    y: 0,
    zLevel: 0,
    width: 0,
    height: 0,
    opacity: 1,
    cursor: null,
    mouse: false,
    onmouseover: function () {},
    onmouseout: function () {},
    onmousemove: function () {},
    onclick: function () {},

    _make: function (x, y, zLevel, width, height) {
        this.x = x || 0;
        this.y = y || 0;
        this.zLevel = zLevel || 0;
        this.width = width || 0;
        this.height = height || 0;
    },

    checkMouse: function (mouse, context) {
        if (!this.hidden && mouse.x >= context.xOffset + this.x && mouse.x <= context.xOffset + this.x + this.width && mouse.y >= context.yOffset + this.y && mouse.y <= context.yOffset + this.y + this.height && context.available) {
            if (!this.mouse) {
                this.mouse = true;
                context.finally = function () {
                    this.onmouseover(mouse);
                    this.onmousemove(mouse);
                };
            } else {
                context.finally = function () {
                    this.onmousemove(mouse);
                };
            }
            context.available = false;
            return this;
        } else {
            if (this._mouse) {
                this._mouse = false;
                this.onmouseout(mouse);
            }
            return null;
        }
    },

    checkClick: function (mouse, context) {
        if (!this.hidden && mouse.x >= context.xOffset + this.x && mouse.x <= context.xOffset + this.x + this.width && mouse.y >= context.yOffset + this.y && mouse.y <= context.yOffset + this.y + this.height) {
            this.onclick();
            return true;
        } else {
            return false;
        }
    }
};

let FilledRect = exports.FilledRect = (0, _make.Make)({
    color: null,
    cursor: null,

    _make: function (x, y, width, height, color, zLevel) {
        RectShapeElement._make.apply(this, [x, y, width, height, zLevel]);
        this.color = color;

        this.make = null;
    },

    render: function (context, canvas) {
        let metaData = elementMetaData.get(this);

        if (!metaData.isRendered) {
            Element.render.apply(this, [context, canvas]);

            canvas.save();
            canvas.fillStyle = this.color;
            canvas.globalAlpha = verifyOpacity(canvas.globalAlpha - (1 - this.opacity));
            canvas.fillRect(context.xOffset + this.x, context.yOffset + this.y, this.width, this.height);
            canvas.restore();
        }
    }
}, RectShapeElement).get();

let CImage = exports.CImage = (0, _make.Make)({
    crop: null,
    source: null,
    _width: 0,
    _height: 0,

    _make: function (source, x, y, zLevel) {
        RectShapeElement._make.apply(this, [x, y, null, null, zLevel]);

        this.source = source;
    },

    render: function (context, canvas) {
        /** @type {ElementMetaData} */
        let metaData = elementMetaData.get(this);

        if (!metaData.isRendered) {
            Element.render.apply(this, [context, canvas]);

            canvas.save();
            canvas.globalAlpha = verifyOpacity(canvas.globalAlpha - (1 - this.opacity));
            if (this.crop) {
                let sourceX = this.crop.left;
                let sourceY = this.crop.top;
                let sourceWidth = this.source.naturalWidth - this.crop.left - this.crop.right;
                let sourceHeight = this.source.naturalHeight - this.crop.top - this.crop.bottom;
                let targetX = context.xOffset + this.x;
                let targetY = context.yOffset + this.y;
                canvas.drawImage(this.source, sourceX, sourceY, sourceWidth, sourceHeight, targetX, targetY, this.width, this.height);
            } else {
                canvas.drawImage(this.source, context.xOffset + this.x, context.yOffset + this.y, this.width, this.height);
            }
            canvas.restore();
        }
    },

    get width() {
        return this._width || this.source.naturalWidth || 0;
    },

    set width(width) {
        this._width = width;
    },

    get height() {
        return this._height || this.source.naturalHeight || 0;
    },

    set height(height) {
        this._height = height;
    }
}, RectShapeElement).get();

let TextBox = exports.TextBox = (0, _make.Make)({
    x: 0,
    y: 0,
    content: null,
    fontFamily: 'sans-serif',
    fontSize: 12,
    fontStyle: '',
    fontWeight: 'normal',
    color: '#000',
    aling: 'left',
    opacity: 1,
    zLevel: 0,
    cursor: null,
    textBaseLine: 'top',

    _make: function (content = '', x = 0, y = 0, zLevel = 0) {
        this.x = x;
        this.y = y;
        this.content = content;
        this.zLevel = zLevel;

        this._make = null;
    },

    render: function (context, canvas) {
        /** @type {ElementMetaData} */
        let metaData = elementMetaData.get(this);

        if (!metaData.isRendered) {
            Element.render.apply(this, [context, canvas]);

            canvas.globalAlpha = verifyOpacity(canvas.globalAlpha - (1 - this.opacity));
            canvas.font = this.font;
            canvas.textAling = this.aling;
            canvas.fillStyle = this.color;
            canvas.textBaseline = 'top';

            if (this.aling == 'center') {
                let t = this;
                let lines = this.content.split('\n');
                let linesWidth = [];
                lines.forEach(item => linesWidth.push(canvas.measureText(item).width));
                let largest = Math.max.apply(Math, linesWidth);
                lines.forEach((item, i) => {
                    let dist = (largest - linesWidth[i]) / 2;
                    canvas.fillText(item, context.xOffset + dist + t.x, context.yOffset + t.lineHeight * i + t.y);
                });
            } else {
                canvas.fillText(this.content, context.xOffset + this.x, context.yOffset + this.y);
            }

            canvas.globalAlpha = verifyOpacity(canvas.globalAlpha + (1 - this.opacity));
        }
    },

    _checkMouse: function () {
        return null;
    },

    _checkClick: function () {
        return null;
    },

    get font() {
        return this.fontStyle + ' ' + this.fontWeight + ' ' + this.fontSize + 'px/' + this.lineHeight + 'px ' + this.fontFamily;
    },

    get lineHeight() {
        return this._lineHeight ? this._lineHeight : this.fontSize + 6;
    },

    set lineHeight(value) {
        this._lineHeight = value;
    }
}, Element).get();

let HitArea = exports.HitArea = (0, _make.Make)({

    render: function () {}

}, RectShapeElement).get();

let ImageCrop = exports.ImageCrop = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,

    _make: function (top = 0, right = 0, bottom = 0, left = 0) {
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
    }
};

// animations
let fadeOut = exports.fadeOut = function (element, time, callback) {
    let timeOut = 20; // milliseconds
    time *= 1000; //convert to milliseconds
    let updates = Math.round(time / timeOut);
    let ammount = 1 / updates;

    let update = function () {
        updates--;
        element.opacity -= ammount;

        if (updates > 0) window.setTimeout(update, timeOut);else if (callback) {
            element.opacity = 0;
            callback();
        }
    };

    element.opacity = 1;
    update();
};

let fadeIn = exports.fadeIn = function (element, time, callback) {
    let timeOut = 20; // milliseconds
    time *= 1000; //convert to milliseconds
    let updates = Math.round(time / timeOut);
    let ammount = 1 / updates;

    let update = function () {
        updates--;
        element.opacity += ammount;

        if (updates > 0) window.setTimeout(update, timeOut);else if (callback) {
            element.opacity = 1;
            callback();
        }
    };

    element.opacity = 0;
    update();
};

let zoomIn = exports.zoomIn = function (element, target, amount, time, callback) {
    if (!(0, _make.hasPrototype)(element, CImage)) {
        console.error('element is not a instance of CImage');
        return false;
    }

    let topAmount = Math.round(target[1] / 100 * amount);
    let leftAmount = Math.round(target[0] / 100 * amount);
    let bottomAmount = Math.round((element.height - target[1]) / 100 * amount);
    let rightAmount = Math.round((element.width - target[0]) / 100 * amount);
    time *= 1000; // to milliseconds
    let timeOut = 20;
    let updates = Math.round(time / timeOut);
    let lot = 1 / updates;

    let update = function () {
        updates--;
        element.crop.top += topAmount * lot;
        element.crop.right += rightAmount * lot;
        element.crop.bottom += bottomAmount * lot;
        element.crop.left += leftAmount * lot;

        if (updates > 0) {
            window.setTimeout(update, timeOut);
        } else if (callback) {
            callback();
        }
    };

    if (!element.crop) {
        element.crop = (0, _make.Make)(ImageCrop)();
    }
    update();
};

let zoomOut = exports.zoomOut = function (element, target, amount, time, callback) {
    if (!(element instanceof CImage)) {
        console.error('element is not a instance of CImage');
        return false;
    }

    let topAmount = Math.round(target[1] / 100 * amount);
    let leftAmount = Math.round(target[0] / 100 * amount);
    let bottomAmount = Math.round((element.height - target[1]) / 100 * amount);
    let rightAmount = Math.round((element.width - target[0]) / 100 * amount);
    time *= 1000; // to milliseconds
    let timeOut = 20;
    let updates = Math.round(time / timeOut);
    let lot = 1 / updates;

    let update = function () {
        updates--;
        element.crop.top -= topAmount * lot;
        element.crop.right -= rightAmount * lot;
        element.crop.bottom -= bottomAmount * lot;
        element.crop.left -= leftAmount * lot;

        if (updates > 0) {
            window.setTimeout(update, timeOut);
        } else if (callback) {
            element.crop = null;
            callback();
        }
    };
    if (!element.crop) {
        element.crop = (0, _make.Make)(ImageCrop)(topAmount, rightAmount, bottomAmount, leftAmount);
    }
    update();
};