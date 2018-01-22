const pending = [];

const PendingTasks = {

    /**
     * [push description]
     *
     * @param  {Promise} task [description]
     * @return {void}      [description]
     */
    push(task) {
        pending.push(task);
    },

    _apply(event) {
        event.waitUntil(pending);
    }
};

export default PendingTasks;
