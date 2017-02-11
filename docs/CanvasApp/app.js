/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 16);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/* exports provided: default */
/* exports used: default */
/*!**************************************************!*\
  !*** ./af/modules/Canvas/lib/VisualComponent.js ***!
  \**************************************************/
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__RenderManager__ = __webpack_require__(/*! ./RenderManager */ 1);


const VisualComponent = {

    _parent: null,
    _dirty: false,

    x: 0,
    y: 0,

    height: 0,
    width: 0,

    $isContainer: false,
    $isRoot: false,
    offsetX: 0,
    offsetY: 0,

    constructor(initialData = {}) {
        Object.keys(initialData).forEach(key => {

            if (key[0] === '$' || key[0] === '_') {
                return console.error('unable to overide protected property!');
            }

            if (Reflect.has(this, key)) {
                this[key] = initialData[key];
            } else {
                console.warn('Af-Canvas:', `property ${key} is not defined on this visual component!`);
            }
        });

        return this;
    },

    getProperty(propName) {
        return this[propName];
    },

    setProperty(propName, value) {
        this[propName] = value;

        if (['x', 'y'].indexOf(propName) > -1 && this._parent) {
            __WEBPACK_IMPORTED_MODULE_0__RenderManager__["a" /* default */].pushDirtyItem(this._parent, true);
        } else {
            __WEBPACK_IMPORTED_MODULE_0__RenderManager__["a" /* default */].pushDirtyItem(this);
        }
    },

    render(canvasManager) {
        const canvas = canvasManager.getCanvas(this).canvas;

        canvas.height = this.height;
        canvas.width = this.width;
    }

};

/* harmony default export */ exports["a"] = VisualComponent;


/***/ },
/* 1 */
/* exports provided: default */
/* exports used: default */
/*!************************************************!*\
  !*** ./af/modules/Canvas/lib/RenderManager.js ***!
  \************************************************/
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__RenderEngine__ = __webpack_require__(/*! ./RenderEngine */ 3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__RenderCanvasManager__ = __webpack_require__(/*! ./RenderCanvasManager */ 14);

//import { hasPrototype } from '../../../util/make';


const renderCanvas = document.createElement('canvas');

const RenderManager = {

    _heap: {
        renderQueue: [],
        dirtyItems: [],
        compositeRootList: [],
        componentBitmapMap: new WeakMap(),
        elementStack: [],
    },

    _running: false,

    /**
     * @param {ViewComponent} item - the dirty item to add
     * @param {boolean} noMark - should the element be marked dirty
     * @return {void}
     */
    pushDirtyItem(item, noMark = false) {
        let stack = [item];

        while(stack.length) {
            let item = stack.pop();

            if (!item) {
                continue;
            }

            // we just changed the possition. Keept it as simple as possibe
            // only add parent to the parent gets restored and we can redraw all children

            item._dirty = !noMark;
            noMark = false;

            this.addItemToQueue(item);

            if (item.$isContainer) {
                for (let i = 0; i < item._children.length; i++) {
                    if (item._children[i].$isContainer) {
                        stack.push(item._children[i]);
                    }
                }
            }
            /*
            if (item.$isContainer && !positionOnly) {
                for (let i = 0; i < item._children.length; i++) {
                    if (item.$isContainer) {
                        stack.push(item._children[i]);
                    }
                }
            }*/
        }

        this.renderCycle();
    },

    addItemToQueue(item) {
        if (this._heap.dirtyItems.indexOf(item) < 0) {
            this._heap.dirtyItems.push(item);
        }
    },

    renderCycle() {
        if (this._running && this._heap.dirtyItems.length) {
            __WEBPACK_IMPORTED_MODULE_0__RenderEngine__["a" /* default */].scheduleRenderTask(this.frame.bind(this), 'af-canvas-render-manager');
        }
    },

    frame() {
        try {
            this.checkTree();
            this.renderComponents();
            this.composite();
            this.renderCycle();
        } catch (e) {
            console.error(e);
            this._running = false;
            this._heap.renderQueue.length = 0;
            this._heap.compositeRootList = 0;
        }
    },

    renderComponents() {
        for (let i = 0; i < this._heap.renderQueue.length; i++) {
            const item = this._heap.renderQueue[i];

            renderCanvas.height = 0;
            renderCanvas.width = 0;

            const bitmap = item.render(__WEBPACK_IMPORTED_MODULE_1__RenderCanvasManager__["a" /* default */]);
            this._heap.componentBitmapMap.set(item, bitmap);
            item._dirty = false;
        }

        this._heap.renderQueue.length = 0;
    },

    checkTree() {
        for (let i = 0; i < this._heap.dirtyItems.length; i++) {
            this.checkDirtyItem(this._heap.dirtyItems[i]);
        }

        this._heap.dirtyItems.length = 0;

//        console.log(this._heap.renderQueue, this._heap.compositeRootList);
    },

    /**
     * draws all the updated components to the canvas while trying to not redraw
     * pixels which didn't change.
     *
     * @return {void}
     */
    composite() {
        const elementStack = this._heap.elementStack;
        let offsetX = 0;
        let offsetY = 0;

        // go though the deepest not dirty containers
        for (let i = 0; i < this._heap.compositeRootList.length; i++) {
            const element = this._heap.compositeRootList[i];

            elementStack.length = 0;

            // IMPORTANT: we don't use this right now, because it should be easier
            // to detect this problem when we determine the composite root
            //
            // if we are in a container we need to take care of our
            // greater siblings.
/**            if (element._parent) {
                const children = element._parent._children;
                const currentElementIndex = children.indexOf(element);

                // we push all siblings to the stack which have a higher zIndex
                // than the current element
                for (let y = children.length -1; y > currentElementIndex; y--) {
                    if (this._heap.compositeRootList.indexOf(children[y]) < 0) {
                        elementStack.push(children[y]);
                    }
                }
            } **/

            // we took care of our siblings, ready to push the current root.
            elementStack.push(element);

            // process all elements which are either dirty or required to restore a non dirty base
            while(elementStack.length) {
                const element = elementStack.pop();

                if (element._cleanUp) {
                    // we steped back into the layer, clean up time.
                    offsetX -= element.x;
                    offsetY -= element.y;
                    element._cleanUp = false;

                    continue;
                } else {
                    // add relative element offset to the absolute offset
                    offsetX = offsetX + element.x;
                    offsetY = offsetY + element.y;
                }

                // this is a container, start pushing it's chilred to the stack
                // we need to process them too.
                if (element.$isContainer) {

                    // push element back on to the stack.
                    if (element._children.length) {
                        element._cleanUp = true;
                        elementStack.push(element);
                    }

                    // push all children in reverse order, this way well will pop
                    // the lowest child first
                    for (let y = element._children.length - 1; y > -1; y--) {
                        elementStack.push(element._children[y]);
                    }
                }

                // if the current element is dirty and a container, but not the root,
                // we will backup the current image data
                if (element._dirty && element.$isContainer) {

                    // ony backup data if it's not the root
                    if (!element.$isRoot) {
                        this.backupImageData(element, offsetX, offsetY);
                    }

                    element._dirty = false;

                // this is either a not dirty container and we restore the last
                // clean image data or we just draw an updated component
                } else {
                    let bitmap = this._heap.componentBitmapMap.get(element);
                    let canvas = this.getCanvas(element);

                    // if this is not the root we should have image data for this
                    // element
                    if (!element.$isRoot) {
                        if (element.$isContainer && bitmap) {
                            this.restoreImageData(canvas, offsetX, offsetY, bitmap);
                        } else if (bitmap) {
                            this.drawToCanvas(canvas, offsetX, offsetY, bitmap);
                        }
                    }

                    if (!element._cleanUp) {
                        // we are done, role back the offset update.
                        offsetX -= element.x;
                        offsetY -= element.y;
                    }

                    element._dirty = false;
                }
            }
        }

        this._heap.compositeRootList.length = 0;
    },

    getCanvas(item) {
        while (item) {
            if (item.$isRoot) {
                return item;
            } else {
                item = item._parent;
            }
        }
    },

    backupImageData(element, offsetX, offsetY) {
        const canvas = this.getCanvas(element).element;
        const targetCanvas = __WEBPACK_IMPORTED_MODULE_1__RenderCanvasManager__["a" /* default */].getCanvas(element);

        targetCanvas.canvas.height = element.height;
        targetCanvas.canvas.width = element.width;

        targetCanvas.drawImage(canvas, 0, 0, element.width, element.height,
                                            offsetX, offsetY, element.width, element.height);

        this._heap.componentBitmapMap.set(element, targetCanvas.canvas);
    },

    restoreImageData(canvas, x, y, bitmap) {
        //canvas.drawContext.save();
        //canvas.drawContext.globalCompositeOperation = 'copy';
        //canvas.drawContext.clearRect(0, 0, bitmap.width, bitmap.height);
        canvas.drawContext.drawImage(bitmap, x, y);
        //canvas.drawContext.restore();
    },

    drawToCanvas(canvas, x, y, bitmap) {
        x *= canvas.resolution;
        y *= canvas.resolution;

        canvas.drawContext.drawImage(bitmap, x, y);

        renderCanvas.height = 0;
        renderCanvas.width = 0;
    },

    checkDirtyItem(item) {
        if (!item._parent && !item.$isRoot) {
            return;
        }

        if (item.$isContainer) {
            if (!item._dirty || item.$isRoot) {
                this._heap.compositeRootList.push(item);
            }
        } else {
            this._heap.renderQueue.push(item);
        }

        if (!item.$isRoot && item._dirty) {
            this.addItemToQueue(item._parent);
        }
    },

    start() {
        this._running = true;
        this.renderCycle();
    },

    stop() {
        this._running = false;
    },
};

/* harmony default export */ exports["a"] = RenderManager;


/***/ },
/* 2 */
/* exports provided: default */
/* exports used: default */
/*!****************************************!*\
  !*** ./af/modules/Canvas/lib/Layer.js ***!
  \****************************************/
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__RenderManager__ = __webpack_require__(/*! ./RenderManager */ 1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__VisualComponent__ = __webpack_require__(/*! ./VisualComponent */ 0);



const Layer = {

    $isContainer: true,

    _children: null,

    constructor(...args) {
        super.constructor(...args);

        this._children = [];

        return this;
    },

    /**
     * @param {ViewComponent} child - the child component to add
     * @return {void}
     */
    addChild(child) {
        this._children.push(child);

        if (child._parent) {
            child._parent.removeChild(child);
        } else {
            __WEBPACK_IMPORTED_MODULE_0__RenderManager__["a" /* default */].pushDirtyItem(child);
        }

        child._parent = this;

        __WEBPACK_IMPORTED_MODULE_0__RenderManager__["a" /* default */].pushDirtyItem(this);
    },

    /**
     * @param {ViewComponent} child - the child to remove
     * @return {void}
     */
    removeChild(child) {
        if (child._parent !== this) {
            return console.error(child, 'is not a child of', this);
        }

        let indexOfChild = this._children.indexOf(child);

        this._children.splice(indexOfChild, 1);
        __WEBPACK_IMPORTED_MODULE_0__RenderManager__["a" /* default */].pushDirtyItem(this);
    },

    __proto__: __WEBPACK_IMPORTED_MODULE_1__VisualComponent__["a" /* default */],
};

/* harmony default export */ exports["a"] = Layer;


/***/ },
/* 3 */
/* exports provided: default */
/* exports used: default */
/*!***********************************************!*\
  !*** ./af/modules/Canvas/lib/RenderEngine.js ***!
  \***********************************************/
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_make__ = __webpack_require__(/*! ../../../util/make */ 4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__RenderEngine_TaskList__ = __webpack_require__(/*! ./RenderEngine/TaskList */ 15);
/**
 * @module RenderEngine
 */




/** @type {Function[]} */
let preRenderHooks = [];

/** @type {Function[]} */
let postRenderHooks = [];

/** @type {module:RenderEngine.TaskList} */
let preRenderTasks = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__util_make__["a" /* Make */])(__WEBPACK_IMPORTED_MODULE_1__RenderEngine_TaskList__["a" /* default */])();

/** @type {module:RenderEngine.TaskList} */
let renderTasks = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__util_make__["a" /* Make */])(__WEBPACK_IMPORTED_MODULE_1__RenderEngine_TaskList__["a" /* default */])();

/** @type {Function[]} */
let postRenderTasks = [];

/** @type {Function[]} */
let nextPostRenderTasks = [];

/** @type {boolean} */
let active = false;

const getNow = function() {
    return window.performance ? window.performance.now() : Date.now();
};

/**
 * performs all render tasks from one frame. This is one render cycle.
 *
 * @return {void}
 */
let renderCycle = function() {
    active = false;

    const cycleStart = getNow();

    // run all post render hooks after a frame has been painted. So this happens
    // at the beginning of the next cycle.
    postRenderHooks.forEach(hook => {
        const startTime = getNow();

        hook();

        const endTime = getNow();
        const duration = endTime - startTime;

        if (duration > 100) {
            console.warn(`a pre render hook is taking too much time! ${duration.round()}ms`);
        }
    });

    const startTime = getNow();

    postRenderTasks.forEach(task => {
        task();

        let endTime = getNow();
        let duration = endTime - startTime;

        if (duration >= 500) {
            console.warn(`a post render task is taking too much time! ${duration.round()}ms`);
        }
    });

    // init render cycle.
    // nothing at the moment.

    // run the pre render hooks before we start to do render stuff.
    preRenderHooks.forEach(hook => hook());

    // run pre render tasks
    let tasks = preRenderTasks.tasks;
    preRenderTasks.flush();
    tasks.forEach(task => task());

    //run all render tasks.
    tasks = renderTasks.tasks;
    renderTasks.flush();
    tasks.forEach(task => task());

    //finish rendering, final steps
    postRenderTasks = nextPostRenderTasks;
    nextPostRenderTasks = [];

    //create performance data
    const cycleDuration = getNow() - cycleStart;
    const frameRate = 1000 / cycleDuration;

    RenderEngine.performance.lastFrameDuration = cycleDuration;
    RenderEngine.performance.fps = frameRate;
    RenderEngine.performance.renderedFrames += 1;

    // done wait for next frame
    scheduleNextFrame();
};

/**
 * Schedules a new render cycle in the browsers rendeing engine.
 * The cycle is performed as soon as the browser is ready to render a new frame.
 *
 * @return {void}
 */
let scheduleNextFrame = function() {
    if (!active && (postRenderHooks.length > 0 || preRenderHooks.length > 0 ||
        renderTasks.length > 0 || postRenderTasks.length > 0 || nextPostRenderTasks.length > 0)) {
        window.requestAnimationFrame(renderCycle);

        active = true;
    }
};


/**
 * RenderEngine Singleton
 *
 * @namespace
 */
let RenderEngine = {

    performance: {
        fps: 0,
        lastFrameDuration: 0,
        renderedFrames: 0,
    },

    /**
     * @param {Function} f a hook function to execute before each render cycle
     * @return {Function} returns the function which has been passed in
     */
    addPreRenderHook: function(f) {
        preRenderHooks.push(f);
        scheduleNextFrame();

        return f;
    },

    /**
     * @param {Function} f - a hook function to execute after each render cycle
     * @return {Function} returns the function which has been passed in.
     */
    addPostRenderHook: function(f) {
        postRenderHooks.push(f);
        scheduleNextFrame();

        return f;
    },

    /**
     * Removes a previously added pre render hook
     *
     * @param  {Function} f - the function which was previously added
     * @return {*} - see Array.prototype.splice
     */
    removePreRenderHook: function(f) {
        return preRenderHooks.splice(preRenderHooks.indexOf(f), 1);
    },

    /**
     * Removes a previously added post render hook
     *
     * @param  {Function} f - the function which was previously added
     * @return {*} {@link Array.prototype.splice}
     */
    removePostRenderHook: function(f) {
        return postRenderHooks.splice(postRenderHooks.indexOf(f), 1);
    },

    /**
     * @param {Function} f - the task to preform in the next render cycle.
     * @param {string} [id] optional task id
     * @return {Function} the function which has been passed in.
     */
    schedulePreRenderTask: function(f, id) {
        preRenderTasks.push(f, id);
        scheduleNextFrame();

        return f;
    },

    /**
     * @param {Function} f - the task to preform in the next render cycle.
     * @param {string} [id] optional task id
     * @return {Function} the function which has been passed in.
     */
    scheduleRenderTask: function(f, id) {
        renderTasks.push(f, id);
        scheduleNextFrame();

        return f;
    },

    /**
     * @param {Function} f - the task to preform after the next render cycle.
     * @return {Function} the function which has been passed in.
     */
    schedulePostRenderTask: function(f) {
        nextPostRenderTasks.push(f);
        scheduleNextFrame();

        return f;
    },

    /**
     * Forces the engine to render a new frame even if there are no tasks
     *
     * @return {void}
     */
    renderFrame: function() {
        if(!active) {
            scheduleNextFrame();
        }
    }
};

/**
 * @member {module:RenderEngine~RenderEngine} RenderEngine
 * @static
 */
/* harmony default export */ exports["a"] = RenderEngine;


/***/ },
/* 4 */
/* exports provided: Make, hasPrototype, Mixin */
/* exports used: Make */
/*!*************************!*\
  !*** ./af/util/make.js ***!
  \*************************/
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(exports, "a", function() { return Make; });
/* unused harmony export hasPrototype */
/* unused harmony export Mixin */
/**
 * The make module consits of Make, getPrototypeOf and mixin.
 * See the documentation for each method to see what is does.
 * This module is part of the ApplicationFrame.
 * @module Make
 * @author Jovan Gerodetti
 * @copyright Jovan Gerodetti
 * @version 1.0
 */


/**
 * Internal function to apply one objects propteries to a target object.
 *
 * @param {Object} target
 * @param {Object} source
 * @inner
 */
var apply = function (target, source) {
    Object.keys(source).forEach(function(key){
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });

    return target;
};

/**
 * Creates a new object with the given prototype.
 * If two arguments are passed in, the properties of the first object will be
 * applied to the new object.
 *
 * @param {Object} object
 * @param {Object} prototype
 * @return {function}
 */
var Make = function(object, prototype) {
    if(arguments.length < 2){
        prototype = object;
        object = null;
    }

    if (object === null) {
        object = Object.create(prototype);
    } else {
        object = apply(Object.create(prototype), object);
    }

    var m = function(...args){
        var make = object.make || object._make || function(){};

        make.apply(object, args);

        return object;
    };

    m.get = function(){ return object; };

    return m;
};

/**
 * This method checks if the given prototype is in the prototype chain of
 * the given target object.
 *
 * @param {Object} object
 * @param {Object} prototype
 * @return {boolean}
 */
var hasPrototype = function(object, prototype){
    var p = Object.getPrototypeOf(object);

    while(p !== null && p !== undefined){
        if(typeof prototype == 'function')
            prototype = prototype.prototype;

        if(p == prototype)
            return true;
        else
            p = Object.getPrototypeOf(p);
    }

    return false;
};

/**
 * Creates a new prototype mixing all the given prototypes. Incase two or more
 * prototypes contain the same propterty, the new prototype will return
 * the propterty of the first prototype in the list which contains it.
 *
 * @param {...Object} prototypes - the porotype object to combine
 * @return {Proxy} - the resulting proxy object
 */
var Mixin = function(...prototypes){

    return new Proxy(prototypes, MixinTrap);

};

/**
 * Internal function to find a proptery in a list of prototypes.
 *
 * @param {Object[]} prototypes
 * @param {string} key
 * @return {Object}
 */
var findProperty = function(prototypes, key) {
    for (var i = 0; i < prototypes.length; i++) {
        var item = prototypes[i];

        if (item && item[key]) {
            return item;
        }
    }

    return undefined;
};

/**
 * Traps to create a mixin.
 */
var MixinTrap = {

    'get' : function(prototypes, key) {
        var object = findProperty(prototypes, key);

        if (object && typeof object[key] === 'function') {
            return object[key].bind(object);
        }

        return (object ? object[key] : null);
    },

    'set' : function(prototypes, key, value) {
        var object = findProperty(prototypes, key);

        if (object) {
            object[key] = value;
        } else {
            prototypes[0][key] = value;
        }

        return true;
    }
};


/***/ },
/* 5 */
/* exports provided: default */
/* exports used: default */
/*!*******************************************!*\
  !*** ./af/core/prototypes/Application.js ***!
  \*******************************************/
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_make_js__ = __webpack_require__(/*! ../../util/make.js */ 4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ApplicationInternal_js__ = __webpack_require__(/*! ./ApplicationInternal.js */ 11);



let Internal = new WeakMap();

/** @lends Application.prototype */
let Application = {

    /**
    * Name of this application so other components can identify the application.
    *
    * @type {string}
    */
    name : '',

    /**
    * Some components may need to know the version of this applicaion.
    *
    * @type {string}
    */
    version : '0.0.0',

    /**
    * @type {string}
    */
    author : '',

    /**
    * @constructs
    *
    * @return {void}
    */
    _make : function(){
        Internal.set(this, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__util_make_js__["a" /* Make */])(__WEBPACK_IMPORTED_MODULE_1__ApplicationInternal_js__["a" /* default */])());
    },

    /**
    * Initializes this application, default interface for components and modules.
    *
    * @return {void}
    */
    init : function(){
        console.log(`Initialzing Application "${this.name}"!`);
    },


    /**
    * Registers a new event listener for the given event type.
    *
    * @param {string} type the event type
    * @param {function} listener the listener function
    *
    * @return {Application} this application
    */
    on : function(type, listener){
        let scope = Internal.get(this);

        if (!scope.listeners[type]) {
            scope.listeners[type] = [];
        }

        scope.listeners[type].push(listener);

        return this;
    },

    /**
    * removes a previously attached listener function.
    *
    * @param  {string} type     the listener type
    * @param  {Function} listener the listener function to remove
    *
    * @return {void}
    */
    removeListener: function(type, listener) {
        let scope = Internal.get(this);

        if (scope.listeners[type]) {
            let index = scope.listeners[type].indexOf(listener);

            scope.listeners[type].splice(index, 1);
        }
    },

    /**
    * Emmits a new event on this application.
    *
    * @param {string} type event type
    * @param {Object} data event data
    *
    * @return {void}
    */
    emit : function(type, data){
        let scope = Internal.get(this);
        let name = this.name ? `${this.name}:%c ` : '%c%c';

        if (scope.listeners[type]) {
            console.log(`%c${name}${type} event emitted`,
                'font-weight: 900; text-decoration: underline;',
                'font-weight: initial; text-decoration: initial;');

            setTimeout(() => scope.listeners[type].forEach(f => f(data)), 0);
        }
    },

    /**
    * This function will try to terminate the application by emitting the termination event.
    *
    * @param {string} reason - the reason for the termination.
    *
    * @return {void}
    */
    terminate : function(reason){
        this.emit('terminate', reason);
    }

};

/* harmony default export */ exports["a"] = Application;


/***/ },
/* 6 */
/* exports provided: default */
/* exports used: default */
/*!*********************************************!*\
  !*** ./af/modules/Canvas/Prototypes/Box.js ***!
  \*********************************************/
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__lib_VisualComponent__ = __webpack_require__(/*! ../lib/VisualComponent */ 0);


const Box = {

    color: '#fff',

    /**
     * @param {HTMLCanvasElement} canvasManager - the target canvas
     *
     * @return {ImageData} - the resulting pixel data
     */
    render(canvasManager) {
        super.render(canvasManager);

        const context = canvasManager.getCanvas(this);

        context.fillStyle = this.color;
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);

        return context.canvas;
    },

    __proto__: __WEBPACK_IMPORTED_MODULE_0__lib_VisualComponent__["a" /* default */],
};

/* harmony default export */ exports["a"] = Box;


/***/ },
/* 7 */
/* exports provided: default */
/* exports used: default */
/*!***************************************************!*\
  !*** ./af/modules/Canvas/Prototypes/TextBlock.js ***!
  \***************************************************/
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__lib_VisualComponent__ = __webpack_require__(/*! ../lib/VisualComponent */ 0);


const TextBlock = {

    text: '',
    font: 'sans-serif',
    color: '#000',
    alignment: 'left',
    fontSize: 12,

    textInBound(context, text) {
        return context.measureText(text).width <= this.width;
    },

    applyTextWrapping(context, text) {

        // first, get the actual lines.
        const actualLines = text.split('\n');

        // now check for line overflow.
        const lines = [];

        // go through every line
        actualLines.forEach(line => {
            line = line.split(' ');
            let lineContent = line.shift();

            // as long as we still have words in our source line
            while (line.length) {

                // our line didn't excede the box width so we can push more
                // words to our current line
                if (this.textInBound(context, `${lineContent} ${line[0]}`)) {
                    lineContent += ` ${line.shift()}`;

                // line is full push it to the stack of lines
                } else {
                    lines.push(lineContent);
                    lineContent = line.shift();
                }
            }

            // we are done processing the source line, get rid of the remaining line
            lines.push(lineContent);
        });

        return lines;
    },

    render(canvasManager) {
        super.render(canvasManager);

        const context = canvasManager.getCanvas(this);

        // setup context for rendering
        context.font = `${this.fontSize}px ${this.font}`;
        context.textAlign = this.alignment;
        context.fillStyle = this.color;
        context.textBaseline = 'top';

        // process the text, word wrapping and everything!
        const lines = this.applyTextWrapping(context, this.text);
        const x = (this.alignment === 'center') ? (this.x / 2) : this.x;

        lines.forEach((line, index) => {
            context.fillText(line, x, this.fontSize * index);
        });

        return context.canvas;
    },

    __proto__: __WEBPACK_IMPORTED_MODULE_0__lib_VisualComponent__["a" /* default */],
};

/* harmony default export */ exports["a"] = TextBlock;


/***/ },
/* 8 */
/* exports provided: default */
/* exports used: default */
/*!***********************************!*\
  !*** ./af/modules/Canvas/main.js ***!
  \***********************************/
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__lib_Canvas__ = __webpack_require__(/*! ./lib/Canvas */ 13);
/* harmony reexport (binding) */ __webpack_require__.d(exports, "a", function() { return __WEBPACK_IMPORTED_MODULE_0__lib_Canvas__["a"]; });


// Classes
/** export let CImage =  Make({
    crop : null,
    source : null,
    _width: 0,
    _height: 0,

    _make : function(source, x, y, zLevel){
        RectShapeElement._make.apply(this, [x, y, null, null, zLevel]);

        this.source = source;
    },

    render : function(context, canvas) {
        /** @type {ElementMetaData}
        let metaData = elementMetaData.get(this);

        if (!metaData.isRendered) {
            Element.render.apply(this, [context, canvas]);

            canvas.save();
            canvas.globalAlpha = verifyOpacity(canvas.globalAlpha - (1-this.opacity));
            if (this.crop) {
                let sourceX = this.crop.left;
                let sourceY = this.crop.top;
                let sourceWidth = this.source.naturalWidth - this.crop.left - this.crop.right;
                let sourceHeight = this.source.naturalHeight - this.crop.top - this.crop.bottom;
                let targetX = context.xOffset + this.x;
                let targetY = context.yOffset + this.y;
                canvas.drawImage(this.source, sourceX, sourceY, sourceWidth, sourceHeight, targetX, targetY, this.width, this.height);
            }else{
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

export let HitArea = Make({

    render : function(){}

}, RectShapeElement).get();

export let ImageCrop = {
    top : 0,
    right : 0,
    bottom : 0,
    left : 0,

    _make : function(top=0, right=0, bottom=0, left=0){
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
    }
};

// animations
export let fadeOut = function(element, time, callback){
    let timeOut = 20; // milliseconds
    time *= 1000;     //convert to milliseconds
    let updates = Math.round(time / timeOut);
    let ammount = 1 / updates;

    let update = function() {
        updates--;
        element.opacity -= ammount;

        if(updates > 0)
            window.setTimeout(update, timeOut);
        else if(callback){
            element.opacity = 0;
            callback();
        }
    };

    element.opacity = 1;
    update();
};

export let fadeIn = function(element, time, callback){
    let timeOut = 20; // milliseconds
    time *= 1000;     //convert to milliseconds
    let updates = Math.round(time / timeOut);
    let ammount = 1 / updates;

    let update= function() {
        updates--;
        element.opacity += ammount;

        if(updates > 0)
            window.setTimeout(update, timeOut);
        else if(callback){
            element.opacity= 1;
            callback();
        }
    };

    element.opacity= 0;
    update();
};

export let zoomIn = function(element, target, amount, time, callback) {
    if (!hasPrototype(element, CImage)) {
        console.error('element is not a instance of CImage');
        return false;
    }

    let topAmount = Math.round((target[1] / 100) * amount);
    let leftAmount = Math.round((target[0] / 100) * amount);
    let bottomAmount = Math.round(((element.height - target[1]) / 100) * amount);
    let rightAmount = Math.round(((element.width - target[0]) / 100) * amount);
    time *= 1000; // to milliseconds
    let timeOut = 20;
    let updates = Math.round(time / timeOut);
    let lot = 1 / updates;

    let update = function(){
        updates--;
        element.crop.top += topAmount * lot;
        element.crop.right += rightAmount * lot;
        element.crop.bottom += bottomAmount * lot;
        element.crop.left += leftAmount * lot;

        if (updates > 0) {
            window.setTimeout(update, timeOut);
        } else if(callback) {
            callback();
        }
    };

    if (!element.crop) {
        element.crop = Make(ImageCrop)();
    }
    update();
};

export let zoomOut = function(element, target, amount, time, callback) {
    if(!(element instanceof CImage)){
        console.error('element is not a instance of CImage');
        return false;
    }

    let topAmount = Math.round((target[1] / 100) * amount);
    let leftAmount = Math.round((target[0] / 100) * amount);
    let bottomAmount = Math.round(((element.height - target[1]) / 100) * amount);
    let rightAmount = Math.round(((element.width - target[0]) / 100) * amount);
    time *= 1000; // to milliseconds
    let timeOut = 20;
    let updates = Math.round(time / timeOut);
    let lot = 1 / updates;

    let update = function() {
        updates--;
        element.crop.top -= topAmount * lot;
        element.crop.right -= rightAmount * lot;
        element.crop.bottom -= bottomAmount * lot;
        element.crop.left -= leftAmount * lot;

        if (updates > 0) {
            window.setTimeout(update, timeOut);
        }else if(callback){
            element.crop = null;
            callback();
        }
    };
    if (!element.crop) {
        element.crop = Make(ImageCrop)(topAmount, rightAmount, bottomAmount, leftAmount);
    }
    update();
}; **/


/***/ },
/* 9 */
/* exports provided: BLOCK_UPPER_SPACE, BLOCK_HEIGHT, BLOCK_SIZE, default */
/* exports used: BLOCK_HEIGHT, BLOCK_UPPER_SPACE, BLOCK_SIZE, default */
/*!*******************!*\
  !*** ./assets.js ***!
  \*******************/
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__af_modules_Canvas_Prototypes_Image__ = __webpack_require__(/*! ./af/modules/Canvas/Prototypes/Image */ 12);


const ASSETS_BASE_PATH = 'assets/';

const BLOCK_UPPER_SPACE = 50;
/* harmony export (immutable) */ exports["b"] = BLOCK_UPPER_SPACE;

const BLOCK_HEIGHT = 41;
/* harmony export (immutable) */ exports["a"] = BLOCK_HEIGHT;

const BLOCK_SIZE = 80;
/* harmony export (immutable) */ exports["c"] = BLOCK_SIZE;


const asset = function(fileName) {
    return __WEBPACK_IMPORTED_MODULE_0__af_modules_Canvas_Prototypes_Image__["a" /* default */].load(`${ASSETS_BASE_PATH}${fileName}`);
};

const Assets = {
    blocks: {
        grass: asset('Grass Block.png'),
        basic: asset('Brown Block.png'),
        plain: asset('Plain Block.png'),
        wood: asset('Wood Block.png'),
        water: asset('Water Block.png'),
        dirt: asset('Dirt Block.png'),
        stone: {
            normal: asset('Stone Block.png'),
            tall: asset('Stone Block Tall.png'),
        },
        shadow: {
            east: asset('Shadow East.png'),
            northEast: asset('Shadow North East.png'),
            northWest: asset('Shadow North West.png'),
            north: asset('Shadow North.png'),
            sideWest: asset('Shadow Side West.png'),
            southEast: asset('Shadow South East.png'),
            southWest: asset('Shadow South West.png'),
            south: asset('Shadow South.png'),
            west: asset('Shadow West.png'),
        }
    },

    chars: {
        boy: asset('Character Boy.png'),
        girl: {
            pink: asset('Character Pink Girl.png'),
        }
    }
};

/* harmony default export */ exports["d"] = Assets;


/***/ },
/* 10 */
/* exports provided: default */
/* exports used: default */
/*!****************!*\
  !*** ./map.js ***!
  \****************/
/***/ function(module, exports, __webpack_require__) {

"use strict";
const Map = {

    size: [5, 8],

    data: [
        [
            [   null,    null,    null,    null, 'grass'],
            [   null,    null,    null,    null, 'grass'],
            [   null,    null,    null,    null, 'grass'],
            [   null, 'grass',    null,    null, 'grass'],
            [   null,    null,    null,    null, 'grass'],
        ],
        [
            ['grass', 'grass', 'grass', 'grass',   null, 'grass'],
            ['grass', 'grass', 'grass', 'grass',   null, 'grass'],
            ['grass', 'grass', 'grass', 'grass',   null, 'grass'],
            ['grass', 'grass', 'grass', 'grass',   null, 'grass'],
            ['grass', 'grass', 'grass', 'grass', 'dirt', 'grass'],
        ],
        [
            [  null,    null,    null,    null,    null,    null,  'dirt',  'dirt'],
            [  null,    null,    null,    null,    null,    null,  'dirt',  'dirt'],
            [  null,    null,    null,    null,    null,    null,  'dirt',  'dirt'],
            [  null,    null,    null,    null,    null,  'dirt',    null,  'dirt'],
            ['dirt',  'dirt',  'dirt',  'dirt',  'dirt',  'dirt',  'dirt',  'dirt'],
        ]
    ]
};

/* harmony default export */ exports["a"] = Map;


/***/ },
/* 11 */
/* exports provided: default */
/* exports used: default */
/*!***************************************************!*\
  !*** ./af/core/prototypes/ApplicationInternal.js ***!
  \***************************************************/
/***/ function(module, exports, __webpack_require__) {

"use strict";

/** @lends ApplicationInternal# */
let ApplicationInternal = {
    /**
     * @type {Thread}
     */
    thread : null,

    /**
     * @type {Worker[]}
     */
    workers : null,

    /**
     * @type {Function[]}
     */
    listeners : null,

    /**
     * @type {Catalog}
     */
    modules : null,

    /**
     * this prototype defines a new application scope
     *
     * @constructs
     *
     * @return {void}
     */
    _make : function(){
        this.workers= [];
        this.listeners= [];

        this._make = null;
    }
};

/* harmony default export */ exports["a"] = ApplicationInternal;


/***/ },
/* 12 */
/* exports provided: default */
/* exports used: default */
/*!***********************************************!*\
  !*** ./af/modules/Canvas/Prototypes/Image.js ***!
  \***********************************************/
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__lib_VisualComponent__ = __webpack_require__(/*! ./../lib/VisualComponent */ 0);


const Image = {

    image: null,

    /**
     * @static
     * @param {string} src - the url of the image
     *
     * @return {Promise<Image>} - a promise with the image object
     */
    load(src) {
        const file = new window.Image();
        file.src = src;

        return new Promise((success, error) => {
            file.onload = success;
            file.onerror = error;
        }).then(() => {
            return Object.create(Image).constructor({
                image: file,
                height: file.naturalHeight,
                width: file.naturalWidth,
            });
        });
    },

    render(canvasManager) {
        if (this.offsetX !== 0 || this.offsetY !== 0) {
            super.render(canvasManager);
            const context = canvasManager.getCanvas(this);

            context.drawImage(this.image, this.offsetX, this.offsetY);

            return context.canvas;
        } else {
            return this.image;
        }
    },

    __proto__: __WEBPACK_IMPORTED_MODULE_0__lib_VisualComponent__["a" /* default */],
};

/* harmony default export */ exports["a"] = Image;


/***/ },
/* 13 */
/* exports provided: default */
/* exports used: default */
/*!*****************************************!*\
  !*** ./af/modules/Canvas/lib/Canvas.js ***!
  \*****************************************/
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Layer__ = __webpack_require__(/*! ./Layer */ 2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__RenderManager__ = __webpack_require__(/*! ./RenderManager */ 1);



const Canvas = {

    drawContext: null,
    element: null,
    resolution: 1,

    get width() {
        return this.element.width;
    },

    get height() {
        return this.element.height;
    },

    $isRoot: true,

    constructor(canvasSelector, resolution = 1) {
        super.constructor({});

        this.element = document.querySelector(canvasSelector);
        this.drawContext = this.element.getContext('2d', { alpha: false });
        this.resolution = resolution;

        this.element.setAttribute('width', this.element.offsetWidth);
        this.element.setAttribute('height', this.element.offsetHeight);

        return this;
    },

    startRendering() {
        __WEBPACK_IMPORTED_MODULE_1__RenderManager__["a" /* default */].start();
    },

    stopRendering() {
        __WEBPACK_IMPORTED_MODULE_1__RenderManager__["a" /* default */].stop();
    },

    __proto__: __WEBPACK_IMPORTED_MODULE_0__Layer__["a" /* default */],
};

/* harmony default export */ exports["a"] = Canvas;


/***/ },
/* 14 */
/* exports provided: default */
/* exports used: default */
/*!******************************************************!*\
  !*** ./af/modules/Canvas/lib/RenderCanvasManager.js ***!
  \******************************************************/
/***/ function(module, exports, __webpack_require__) {

"use strict";
const canvasMap = new WeakMap();

const RenderCanvasManager = {
    getCanvas(object) {
        let canvas = canvasMap.get(object);

        if (!canvas) {
            canvas = document.createElement('canvas').getContext('2d');

            canvasMap.set(object, canvas);
        }

        return canvas;
    }
};

/* harmony default export */ exports["a"] = RenderCanvasManager;


/***/ },
/* 15 */
/* exports provided: default */
/* exports used: default */
/*!********************************************************!*\
  !*** ./af/modules/Canvas/lib/RenderEngine/TaskList.js ***!
  \********************************************************/
/***/ function(module, exports, __webpack_require__) {

"use strict";

/** @lends module:RenderEngine.TaskList.prototype */
let TaskList = {

    /** @type Array */
    tasks: null,

    /** @type Array */
    registeredIds: null,

    /**
     * Render TaskList to manage rendertaks and optionally track duplicates by ids.
     *
     * @constructs
     * @return {void}
     */
    _make: function() {
        this.tasks = [];
        this.registeredIds = [];
    },

    /**
     * adds a new item to the task list.
     *
     * @param  {Function} task the task to add to the list
     * @param  {string} [id] the id of this tasks. If provided no task with the same id can be added again.
     * @return {void}
     */
    push: function(task, id) {
        if (!id || this.registeredIds.indexOf(id) < 0) {
            this.tasks.push(task);

            if (id) {
                this.registeredIds.push(id);
            }
        }
    },

    /** @type {number} */
    get length() {
        return this.tasks.length;
    },

    flush: function() {
        this.tasks = [];
        this.registeredIds = [];
    }
};

/* harmony default export */ exports["a"] = TaskList;


/***/ },
/* 16 */
/* unknown exports provided */
/* all exports used */
/*!*****************!*\
  !*** ./main.js ***!
  \*****************/
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__af_core_prototypes_Application__ = __webpack_require__(/*! ./af/core/prototypes/Application */ 5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__af_modules_Canvas__ = __webpack_require__(/*! ./af/modules/Canvas */ 8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__af_modules_Canvas_Prototypes_Box__ = __webpack_require__(/*! ./af/modules/Canvas/Prototypes/Box */ 6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__af_modules_Canvas_lib_Layer__ = __webpack_require__(/*! ./af/modules/Canvas/lib/Layer */ 2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__af_modules_Canvas_Prototypes_TextBlock__ = __webpack_require__(/*! ./af/modules/Canvas/Prototypes/TextBlock */ 7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__af_modules_Canvas_lib_RenderEngine__ = __webpack_require__(/*! ./af/modules/Canvas/lib/RenderEngine */ 3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__assets__ = __webpack_require__(/*! ./assets */ 9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__map__ = __webpack_require__(/*! ./map */ 10);









const CHAR_PADDING = -35;

const App = {

    canvas: null,

    init([GrassBlock, DirtBlock, ShadowEast, ShadowWest, ShadowNorth, ShadowSouth, CharBoy]) {
        this.canvas = Object.create(__WEBPACK_IMPORTED_MODULE_1__af_modules_Canvas__["a" /* default */]).constructor('#canvas');

        const randomGuy = Object.create(CharBoy);
        const currentMapLevel = 1;
        const heightLevel = (currentMapLevel * __WEBPACK_IMPORTED_MODULE_6__assets__["a" /* BLOCK_HEIGHT */]);

        randomGuy.offsetY = CHAR_PADDING;
        randomGuy.setProperty('y', heightLevel);

        const walkableMap = Object.create(__WEBPACK_IMPORTED_MODULE_3__af_modules_Canvas_lib_Layer__["a" /* default */]).constructor({
            x: 0,
            y: 0,
            height: __WEBPACK_IMPORTED_MODULE_6__assets__["b" /* BLOCK_UPPER_SPACE */] + (__WEBPACK_IMPORTED_MODULE_6__assets__["c" /* BLOCK_SIZE */] * 4),
            width: GrassBlock.width * 4,
        });

        walkableMap.addChild(randomGuy);

        const layer2 = Object.create(__WEBPACK_IMPORTED_MODULE_3__af_modules_Canvas_lib_Layer__["a" /* default */]).constructor({
            x: 50,
            y: 50,
            height: 50,
            width: 150,
        });

        const someText = Object.create(__WEBPACK_IMPORTED_MODULE_4__af_modules_Canvas_Prototypes_TextBlock__["a" /* default */]).constructor({
            height: 50,
            width: 150,
            text: ''
        });

        layer2.addChild(someText);

        this.canvas.addChild(Object.create(__WEBPACK_IMPORTED_MODULE_2__af_modules_Canvas_Prototypes_Box__["a" /* default */]).constructor({ width: this.canvas.width, height: this.canvas.height }));
        this.buildMap(__WEBPACK_IMPORTED_MODULE_7__map__["a" /* default */], DirtBlock, ShadowWest, GrassBlock, ShadowEast, ShadowNorth, ShadowSouth);

        walkableMap.addChild(layer2);
        this.canvas.addChild(walkableMap);
        this.canvas.startRendering();

        setInterval(() => {
            const heightLevel = (currentMapLevel * __WEBPACK_IMPORTED_MODULE_6__assets__["a" /* BLOCK_HEIGHT */]);

            if (randomGuy.x === GrassBlock.width * 3 && randomGuy.y < heightLevel + __WEBPACK_IMPORTED_MODULE_6__assets__["c" /* BLOCK_SIZE */]) {
                randomGuy.setProperty('y', randomGuy.y + 1);
            } else if (randomGuy.x > 0 && randomGuy.y === heightLevel + __WEBPACK_IMPORTED_MODULE_6__assets__["c" /* BLOCK_SIZE */]){
                randomGuy.setProperty('x', randomGuy.x - 1);
            } else if (randomGuy.x === 0 && randomGuy.y > heightLevel) {
                randomGuy.setProperty('y', randomGuy.y - 1);
            } else {
                randomGuy.setProperty('x', randomGuy.x + 1);
            }

            const fps = Math.round(__WEBPACK_IMPORTED_MODULE_5__af_modules_Canvas_lib_RenderEngine__["a" /* default */].performance.fps);
            const frames = Math.round(__WEBPACK_IMPORTED_MODULE_5__af_modules_Canvas_lib_RenderEngine__["a" /* default */].performance.renderedFrames);
            const duration = Math.round(__WEBPACK_IMPORTED_MODULE_5__af_modules_Canvas_lib_RenderEngine__["a" /* default */].performance.lastFrameDuration);

            someText.setProperty('text', `FPS: ${fps}\nRenderedFrames: ${frames}\nFrameDuration: ${duration}ms`);
        }, 10);
    },

    buildMap(map, DirtBlock, ShadowWest, GrassBlock, ShadowEast, ShadowNorth, ShadowSouth) {
        let { size: mapSize } = map;
        map = map.data;

        const mapContainer = Object.create(__WEBPACK_IMPORTED_MODULE_3__af_modules_Canvas_lib_Layer__["a" /* default */]).constructor({
            height: __WEBPACK_IMPORTED_MODULE_6__assets__["b" /* BLOCK_UPPER_SPACE */] + (__WEBPACK_IMPORTED_MODULE_6__assets__["c" /* BLOCK_SIZE */] * mapSize[0]) + __WEBPACK_IMPORTED_MODULE_6__assets__["a" /* BLOCK_HEIGHT */],
            width: GrassBlock.width * mapSize[1],
        });

        const mapping = {
            'grass': GrassBlock,
            'dirt': DirtBlock,
        };

        for (let i = map.length-1; i > -1; i--) {
            const layer = map[i];
            const container = Object.create(__WEBPACK_IMPORTED_MODULE_3__af_modules_Canvas_lib_Layer__["a" /* default */]).constructor({
                y: __WEBPACK_IMPORTED_MODULE_6__assets__["a" /* BLOCK_HEIGHT */] * i,
                height: __WEBPACK_IMPORTED_MODULE_6__assets__["b" /* BLOCK_UPPER_SPACE */] + (__WEBPACK_IMPORTED_MODULE_6__assets__["c" /* BLOCK_SIZE */] * layer.length) + __WEBPACK_IMPORTED_MODULE_6__assets__["a" /* BLOCK_HEIGHT */],
                width: GrassBlock.width * Math.max(...layer.map(item => item.length)),
            });

            for (let r = 0; r < layer.length; r++) {
                const blockRow = layer[r];

                for (let b = 0; b < blockRow.length; b++) {
                    const blockType = blockRow[b];

                    if (blockType) {
                        const block = Object.create(mapping[blockType]);

                        block.setProperty('x', GrassBlock.width * b);
                        block.setProperty('y', __WEBPACK_IMPORTED_MODULE_6__assets__["c" /* BLOCK_SIZE */] * r);

                        if (map[i+1] && map[i+1][r-1] && map[i+1][r-1][b] && !map[i][r-1][b]) {
                            const shadow = Object.create(ShadowSouth);

                            shadow.setProperty('y', __WEBPACK_IMPORTED_MODULE_6__assets__["c" /* BLOCK_SIZE */] * (r-1) + __WEBPACK_IMPORTED_MODULE_6__assets__["a" /* BLOCK_HEIGHT */]);
                            shadow.setProperty('x', GrassBlock.width * b);
                            container.addChild(shadow);
                        }

                        container.addChild(block);

                        // if there is a block one layer lower and one to the left, but
                        // no block on the same layer and one to the left
                        if (map[i+1] && map[i+1][r][b-1] && !map[i][r][b-1]) {
                            const shadow = Object.create(ShadowEast);

                            shadow.setProperty('y', (__WEBPACK_IMPORTED_MODULE_6__assets__["c" /* BLOCK_SIZE */] * r) + __WEBPACK_IMPORTED_MODULE_6__assets__["a" /* BLOCK_HEIGHT */]);
                            shadow.setProperty('x', GrassBlock.width * (b-1));

                            container.addChild(shadow);
                        }

                        if (map[i+1] && map[i+1][r][b+1] && !map[i][r][b+1]) {
                            const shadow = Object.create(ShadowWest);

                            shadow.setProperty('y', (__WEBPACK_IMPORTED_MODULE_6__assets__["c" /* BLOCK_SIZE */] * r) + __WEBPACK_IMPORTED_MODULE_6__assets__["a" /* BLOCK_HEIGHT */]);
                            shadow.setProperty('x', GrassBlock.width * (b+1));
                            container.addChild(shadow);
                        }

                        if (map[i+1] && map[i+1][r+1] && map[i+1][r+1][b] && !map[i][r+1][b]) {
                            const shadow = Object.create(ShadowNorth);

                            shadow.setProperty('y', __WEBPACK_IMPORTED_MODULE_6__assets__["c" /* BLOCK_SIZE */] * (r+1) + __WEBPACK_IMPORTED_MODULE_6__assets__["a" /* BLOCK_HEIGHT */]);
                            shadow.setProperty('x', GrassBlock.width * b);
                            container.addChild(shadow);
                        }
                    }
                }
            }

            mapContainer.addChild(container);
        }

        this.canvas.addChild(mapContainer);
    },

    __proto__: __WEBPACK_IMPORTED_MODULE_0__af_core_prototypes_Application__["a" /* default */],
};

Promise.all([
    __WEBPACK_IMPORTED_MODULE_6__assets__["d" /* default */].blocks.grass,
    __WEBPACK_IMPORTED_MODULE_6__assets__["d" /* default */].blocks.dirt,
    __WEBPACK_IMPORTED_MODULE_6__assets__["d" /* default */].blocks.shadow.east,
    __WEBPACK_IMPORTED_MODULE_6__assets__["d" /* default */].blocks.shadow.west,
    __WEBPACK_IMPORTED_MODULE_6__assets__["d" /* default */].blocks.shadow.north,
    __WEBPACK_IMPORTED_MODULE_6__assets__["d" /* default */].blocks.shadow.south,
    __WEBPACK_IMPORTED_MODULE_6__assets__["d" /* default */].chars.boy,
]).then(App.init.bind(App));


/***/ }
/******/ ]);
//# sourceMappingURL=app.js.map