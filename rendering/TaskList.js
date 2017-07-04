import CurrentFrameInterface from './CurrentFrameInterface';
import { allocate, release } from '../memory';

/** @lends module:RenderEngine.TaskList.prototype */
let TaskList = {

    /** @type Array */
    tasks: null,

    /** @type Array */
    registeredIds: null,

    /** @type {{ id: string, work: Function }} */
    get last() {
        return this.tasks[this.tasks.length - 1];
    },

    /** @type {number} */
    get length() {
        return this.tasks.length;
    },

    /**
     * Render TaskList to manage rendertaks and optionally track duplicates by ids.
     *
     * @constructs
     * @return {void}
     */
    constructor() {
        this.tasks = allocate(0);
        this.registeredIds = allocate(0);

        return this;
    },

    /**
     * adds a new item to the task list.
     *
     * @param  {Function} task the task to add to the list
     * @param  {string|number|null} [id] the id of this tasks. If provided no task with the same id can be added again.
     * @return {void}
     */
    push(task, id = null) {
        if (!id || this.registeredIds.indexOf(id) < 0) {
            this.tasks.push({ id: id, work: task });

            if (id) {
                this.registeredIds.push(id);
            }
        }
    },

    unshift(task, id = null) {
        if (!id || this.registeredIds.indexOf(id) < 0) {
            this.tasks.unshift({ id: id, work: task });

            if (id) {
                this.registeredIds.push(id);
            }
        }
    },

    flush() {
        this.tasks = [];
        this.registeredIds = [];
    },

    filter(callback) {
        const newList = allocate(0);

        for (let i = 0; i < this.length; i++) {
            const item = this.tasks[i];

            if (callback(item, i)) {
                newList.push(item);
            }
        }

        release(this.tasks);
        this.tasks = newList;
    },

    run(...args) {
        this.filter((task) => {
            return task.work(...args) === CurrentFrameInterface.INTERUPT_CURRENT_TASK;
        });
    },

    getAll() {
        return this.tasks;
    },
};

export default TaskList;
