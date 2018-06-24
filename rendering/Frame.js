import TaskList from './TaskList';
import { allocate } from '../memory';

/**
 * Internal representation of a frame.
 */
const Frame = {

    /** @type {TaskList} */
    preRenderTasks: null,

    /** @type {TaskList} */
    renderTasks: null,

    /** @type {TaskList} */
    postRenderTasks: null,

    /**
     * Is true if all task lists in the frame are empty.
     *
     * @type {boolean}
     */
    get empty() {
        return this.preRenderTasks.length === 0 &&
            this.renderTasks.length === 0 &&
            this.postRenderTasks.length === 0;
    },

    /**
     * @return {Frame}
     */
    constructor() {
        this.preRenderTasks = allocate('TaskList', TaskList);
        this.renderTasks = allocate('TaskList', TaskList);
        this.postRenderTasks = allocate('TaskList', TaskList);

        return this;
    }
};

export default Frame;
