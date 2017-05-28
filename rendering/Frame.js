import TaskList from './TaskList';

const Frame = {
    preRenderTasks: null,
    renderTasks: null,
    postRenderTasks: null,

    get empty() {
        return this.preRenderTasks.length === 0 &&
            this.renderTasks.length === 0 &&
            this.postRenderTasks.length === 0;
    },

    constructor() {
        this.preRenderTasks = Object.create(TaskList).constructor();
        this.renderTasks = Object.create(TaskList).constructor();
        this.postRenderTasks = Object.create(TaskList).constructor();

        return this;
    }
};

export default Frame;
