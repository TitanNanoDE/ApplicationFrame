import CurrentFrameInterface from './CurrentFrameInterface';
import { allocate, release } from '../memory';

const TaskList = {

    /** @type {{ id: *, work: Function }[]} */
    tasks: null,

    /** @type {Array} */
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
     * @return {TaskList}
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
     * @param  {*} [id] the id of this tasks. If provided no task with the same id can be added again.
     *
     * @return {undefined}
     */
    push(task, id = null) {
        if (!id || this.registeredIds.indexOf(id) < 0) {
            this.tasks.push({ id, work: task });

            if (id) {
                this.registeredIds.push(id);
            }
        }
    },

    /**
     * adds a new task to the beginning of the list
     *
     * @param  {Function}} task      [description]
     * @param  {*} [id=null] [description]
     *
     * @return {undefined}           [description]
     */
    unshift(task, id = null) {
        if (!id || this.registeredIds.indexOf(id) < 0) {
            this.tasks.unshift({ id, work: task });

            if (id) {
                this.registeredIds.push(id);
            }
        }
    },

    /**
     * clears the task list
     *
     * @return {undefined}
     */
    flush() {
        this.tasks = [];
        this.registeredIds = [];
    },


    /**
     * Filters out tasks that do not satisfy the condition.
     *
     * @param  {Function} callback
     *
     * @return {undefined}
     */
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

    /**
     * Runs all tasks but keeps tasks, which didn't complete, in the list.
     * @param  {...*} args arguments for the task execution
     *
     * @return {undefined}
     */
    run(...args) {
        this.filter((task) => {
            return task.work(...args) === CurrentFrameInterface.INTERUPT_CURRENT_TASK;
        });
    },

    /**
     * @return {{ id: *, work: Function }[]}
     */
    getAll() {
        return this.tasks;
    },
};

export default TaskList;
