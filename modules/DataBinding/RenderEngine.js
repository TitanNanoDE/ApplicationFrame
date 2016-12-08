/**
 * @module RenderEngine
 */

import { Make } from '../../util/make';
import TaskList from './RenderEngine/TaskList';

/** @type {Function[]} */
let preRenderHooks = [];

/** @type {Function[]} */
let postRenderHooks = [];

/** @type {module:RenderEngine.TaskList} */
let preRenderTasks = Make(TaskList)();

/** @type {module:RenderEngine.TaskList} */
let renderTasks = Make(TaskList)();

/** @type {Function[]} */
let postRenderTasks = [];

/** @type {Function[]} */
let nextPostRenderTasks = [];

/** @type {boolean} */
let active = false;

/**
 * performs all render tasks from one frame. This is one render cycle.
 *
 * @return {void}
 */
let renderCycle = function() {
    active = false;

    // run all post render hooks after a frame has been painted. So this happens
    // at the beginning of the next cycle.
    postRenderHooks.forEach(hook => {
        let startTime = window.performance ? window.performance.now() : Date.now();

        hook();

        let endTime = window.performance ? window.performance.now() : Date.now();
        let duration = endTime - startTime;

        if (duration > 100) {
            console.warn(`a pre render hook is taking too much time! ${duration.round()}ms`);
        }
    });

    let startTime = window.performance ? window.performance.now() : Date.now();

    postRenderTasks.forEach(task => {
        task();

        let endTime = window.performance ? window.performance.now() : Date.now();
        let duration = endTime - startTime;

        if (duration >= 500) {

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

    // done wait for next frame.
    scheduleNextFrame();
};

/**
 * Schedules a new render cycle in the browsers rendeing engine.
 * The cycle is performed as soon as the browser is ready to render a new frame.
 *
 * @return {void}
 */
let scheduleNextFrame = function() {
    if (!active && (postRenderHooks.length > 0 || preRenderHooks.length > 0 ||
        renderTasks.length > 0 || postRenderTasks.length > 0 || nextPostRenderTasks.length > 0)) {
            window.requestAnimationFrame(renderCycle);

            active = true;
    }
}


/**
 * RenderEngine Singleton
 *
 * @namespace
 */
let RenderEngine = {

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
export default RenderEngine;
