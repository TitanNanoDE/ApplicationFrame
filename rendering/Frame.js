import TaskList from './TaskList';
import { allocate } from '../memory';

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
        this.preRenderTasks = allocate('TaskList', TaskList); // Object.create(TaskList).constructor();
        this.renderTasks = allocate('TaskList', TaskList); //Object.create(TaskList).constructor();
        this.postRenderTasks = allocate('TaskList', TaskList); //Object.create(TaskList).constructor();

        return this;
    }
};

export default Frame;
