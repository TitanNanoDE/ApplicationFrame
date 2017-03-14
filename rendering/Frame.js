import TaskList from './TaskList';

const Frame = {
    preRenderTasks: null,
    renderTasks: null,
    postRenderTasks: null,

    constructor() {
        this.preRenderTasks = Object.create(TaskList).constructor();
        this.renderTasks = Object.create(TaskList).constructor();
        this.postRenderTasks = Object.create(TaskList).constructor();

        return this;
    },
};

export default Frame;
