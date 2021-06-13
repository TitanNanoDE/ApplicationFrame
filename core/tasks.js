import async from './async';

/**
 * A task queue to schedule asynchrounus task to be executed on the event loop
 */
const TaskQueue = {
    PipelinePulse: 'PIPELINE_PULSE',

    queuedTasks: null,
    pipeline: null,

    constructor() {
        this.queuedTasks = [];
        this.pipeline = new MessageChannel();
        this.pipeline.port2.onmessage = this.runTask.bind(this);

        return this;
    },

    /**
     * task executer to be called by the engine when a new task can be executed.
     *
     * @param  {string} data pulse information
     */
    runTask({ data: pulse }) {
        if (pulse !== TaskQueue.PipelinePulse) {
            throw new TypeError('invalid pipeline pulse');
        }

        const task = this.queuedTasks.shift();

        try {
            const result = task.callback();

            task.resolve(result);
        } catch(e) {
            task.reject(e);
        }

        if (this.pipeline.port1.unref) {
            this.pipeline.port1.unref();
            this.pipeline.port2.unref();
        }
    },

    /**
     * adds a new task to the queued
     *
     * @param  {Function} callback
     *
     * @return {Promise}
     */
    scheduleTask(callback) {
        return new Promise((resolve, reject) => {
            const task = { resolve, reject, callback };

            this.queuedTasks.push(task);
            this.pipeline.port1.postMessage(TaskQueue.PipelinePulse);

            if (this.pipeline.port1.ref) {
                this.pipeline.port1.ref();
                this.pipeline.port2.ref();
            }
        });
    },
};

const defaultTaskQueue = Object.create(TaskQueue).constructor();

/**
 * schedule a new asynchrounus task
 *
 * @private
 *
 * @param  {Function} task
 *
 * @return {Promise}
 */
export const scheduleTask = function(task) {
    return defaultTaskQueue.scheduleTask(task);
};


/**
 * Executes the callback function as a microtask
 *
 * @private
 *
 * @param {Function} task
 *
 * @return {Promise}
 */
export const scheduleMicroTask = async;
