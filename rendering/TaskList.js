
/** @lends module:RenderEngine.TaskList.prototype */
let TaskList = {

    /** @type Array */
    tasks: null,

    /** @type Array */
    registeredIds: null,

    /**
     * Render TaskList to manage rendertaks and optionally track duplicates by ids.
     *
     * @constructs
     * @return {void}
     */
    _make: function() {
        this.tasks = [];
        this.registeredIds = [];
    },

    /**
     * adds a new item to the task list.
     *
     * @param  {Function} task the task to add to the list
     * @param  {string} [id] the id of this tasks. If provided no task with the same id can be added again.
     * @return {void}
     */
    push: function(task, id) {
        if (!id || this.registeredIds.indexOf(id) < 0) {
            this.tasks.push(task);

            if (id) {
                this.registeredIds.push(id);
            }
        }
    },

    /** @type {number} */
    get length() {
        return this.tasks.length;
    },

    flush: function() {
        this.tasks = [];
        this.registeredIds = [];
    }
};

export default TaskList;
