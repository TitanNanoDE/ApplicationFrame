/**
 * @module RenderEngine
 */

import { allocate, release } from '../memory';
import Frame from './Frame';
import CurrentFrameInterface from './CurrentFrameInterface';

/** @type {Function[]} */
let preRenderHooks = [];

/** @type {Function[]} */
let postRenderHooks = [];

const frameBuffer = [];

frameBuffer.last = function() { return this[this.length-1]; };

/** @type {boolean} */
let active = false;

const getNow = function() {
    return window.performance ? window.performance.now() : Date.now();
};

const renderConfig = {
    lightray: false,
};

/**
 * performs all render tasks from one frame. This is one render cycle.
 *
 * @param {number} startTime - the time the render cycle started
 *
 * @return {void}
 */
let renderCycle = function(startTime) {
    active = false;

    // run all post render hooks after a frame has been painted. So this happens
    // at the beginning of the next cycle.
    postRenderHooks.forEach(hook => {
        hook();
    });

    frameBuffer[0].postRenderTasks.filter(task => {
        task();
    });

    // init render cycle START
    const frame = frameBuffer[1];

    // migrate remaining tasks to this Frame
    frameBuffer[0].preRenderTasks.getAll().forEach((task) => {
        frame.preRenderTasks.unshift(task.work, task.id);
    });

    frameBuffer[0].renderTasks.getAll().forEach((task) => {
        frame.renderTasks.unshift(task.work, task.id);
    });

    frameBuffer[0].postRenderTasks.getAll().forEach((task) => {
        frame.postRenderTasks.unshift(task.work, task.id);
    });

    const oldFrame = frameBuffer.shift();
    release(oldFrame);

    if (frameBuffer.length < 2) {
        frameBuffer.push(allocate('Frame', Frame));
//        frameBuffer.push(Object.create(Frame).constructor());
    }

    const currentFrameInterface = allocate('CurrentFrameInterface', CurrentFrameInterface);

    currentFrameInterface._startTime = startTime;
    currentFrameInterface._maxFrameDuration = renderConfig.lightray ? (1000 / 60) : (1000 / 30);

     /*Object.create(CurrentFrameInterface)
        .constructor({
            startTime: startTime,
            maxFrameDuration: renderConfig.lightray ? (1000 / 60) : (1000 / 30),
        });*/

    // init render cycle END

    // run the pre render hooks before we start to do render stuff.
    preRenderHooks.forEach(hook => hook(currentFrameInterface));

    // run pre render tasks
    frame.preRenderTasks.run(currentFrameInterface);

    //run all render tasks.
    frame.renderTasks.run(currentFrameInterface);
    //create performance data
    const cycleDuration = getNow() - startTime;
    const frameRate = 1000 / cycleDuration;

    RenderEngine.performance.lastFrameDuration = cycleDuration;
    RenderEngine.performance.fps = frameRate;
    RenderEngine.performance.renderedFrames += 1;

    // done wait for next frame
    scheduleNextFrame();
};

/**
 * Schedules a new render cycle in the browsers rendering engine.
 * The cycle is performed as soon as the browser is ready to render a new frame.
 *
 * @return {void}
 */
let scheduleNextFrame = function() {
    if (!active && frameBuffer.length > 0) {

        if (frameBuffer.length === 2 && frameBuffer[0].emtpy && frameBuffer[1].empty) {
            return;
        }

        window.requestAnimationFrame(renderCycle);

        active = true;
    }
};


/**
 * RenderEngine Singleton
 *
 * @namespace
 */
const RenderEngine = {

    _currentFrame: 1,

    get lightray() {
        return renderConfig.lightray;
    },

    set lightray(value) {
        return renderConfig.lightray = value;
    },

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
        frameBuffer[this._currentFrame].preRenderTasks.push(f, id);
        scheduleNextFrame();

        return f;
    },

    /**
     * @param {Function} f - the task to preform in the next render cycle.
     * @param {string} [id] optional task id
     * @return {Function} the function which has been passed in.
     */
    scheduleRenderTask: function(f, id) {
        frameBuffer[this._currentFrame].renderTasks.push(f, id);
        scheduleNextFrame();

        return f;
    },

    /**
     * @param {Function} f - the task to preform after the next render cycle.
     * @return {Function} the function which has been passed in.
     */
    schedulePostRenderTask: function(f) {
        frameBuffer[this._currentFrame].postRenderTasks.push(f);
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
    },

    skipFrame() {
        const frameIndex = this._currentFrame + 1;

        if (!frameBuffer[frameIndex]) {
            frameBuffer.push(allocate('Frame', Frame));
//            frameBuffer.push(Object.create(Frame).constructor());
        }

        return { _currentFrame: frameIndex, __proto__: RenderEngine };
    }
};

// init zero frame
frameBuffer.push(allocate('Frame', Frame));
frameBuffer.push(allocate('Frame', Frame));
//frameBuffer.push(Object.create(Frame).constructor());
//frameBuffer.push(Object.create(Frame).constructor());

/**
 * @member {module:RenderEngine~RenderEngine} RenderEngine
 * @static
 */
export { RenderEngine };
