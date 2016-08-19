import { Make } from '../../util/make';
import TaskList from './RenderEngine/TaskList';

/**
 * @module RednerEngine
 * @memberof DataBinding
 */

let preRenderHooks = [];
let postRenderHooks = [];
let renderTasks = Make(TaskList)();
let postRenderTasks = [];
let nextPostRenderTasks = [];
let active = false;

let renderCycle = function() {
    active = false;

    // run all post render hooks after a frame has been painted. So this happens
    // at the beginning of the next cycle.
    postRenderHooks.forEach(hook => hook());
    postRenderTasks.forEach(task => task());

    // init render cycle.
    // nothing at the moment.

    // run the pre render hooks before we start to do render stuff.
    preRenderHooks.forEach(hook => hook());

    //run all render tasks.
    let tasks = renderTasks.tasks;
    renderTasks.flush();
    tasks.forEach(task => task());

    //finish rendering, final steps
    postRenderTasks = nextPostRenderTasks;
    nextPostRenderTasks = [];

    // done wait for next frame.
    scheduleNextFrame();
};

let scheduleNextFrame = function() {
    if (!active && (postRenderHooks.length > 0 || preRenderHooks.length > 0 ||
        renderTasks.length > 0 || postRenderTasks.length > 0 || nextPostRenderTasks.length > 0)) {
            window.requestAnimationFrame(renderCycle);

            active = true;
    }
}


let RenderEngine = {

    /**
     * @param {Function} f - a hook function to execute before each render cycle
     * @return {Function} - returns the function which has been passed in
     */
    addPreRenderHook: function(f) {
        preRenderHooks.push(f);
        scheduleNextFrame();

        return f;
    },

    /**
     * @param {Function} f - a hook function to execute after each render cycle
     * @return {Function} - returns the function which has been passed in.
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
     * @return {*}   see Array.prototype.splice
     */
    removePostRenderHook: function(f) {
        return postRenderHooks.splice(postRenderHooks.indexOf(f), 1);
    },

    /**
     * @param {Function} f - the task to preform in the next render cycle.
     * @param {string} [id] optional task id
     * @return {Function} - the function which has been passed in.
     */
    scheduleRenderTask: function(f, id) {
        renderTasks.push(f, id);
        scheduleNextFrame();

        return f;
    },

    /**
     * @param {Function} f - the task to preform after the next render cycle.
     * @return {Function} - the function which has been passed in.
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

export default RenderEngine;
