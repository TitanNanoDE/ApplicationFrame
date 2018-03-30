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

    /**
     * @private
     *
     * @param  {Event} event the event to wait for
     * 
     * @return {undefined}
     */
    _apply(event) {
        event.waitUntil(pending);
    }
};

export default PendingTasks;
