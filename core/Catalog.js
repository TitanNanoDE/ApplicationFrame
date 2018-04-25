const Catalog = {

    /**
     * @private
     * @type {Function[]}
     */
    _listeners: null,

    /**
     * Stores key value pairs and emits events when ever a pair is assigned
     *
     * @return {void}
     */
    _make() {
        this._listeners = [];

        this._make = null;
    },

    /**
     * gives the ability to register an callback as soon as a event is fired
     *
     * @param  {string} event    the event to wait for
     * @param  {Function} listener the callback function
     *
     * @return {Promise} resloves when the event fires
     */
    on(event, listener) {
        const self= this;

        return new Promise(((success) => {
            if(listener.length > 0)
                self._listeners.push({ event, listener, success });
            else
                success();
        }));
    },

    /**
     * assigns a new pair
     *
     * @param {string} key   the key for the assignment
     * @param {*} value any value can be stored
     *
     * @return {void}
     */
    add(key, value) {
        this[key]= value;

        const object= this;

        this._listeners.forEach((item) => {

            if(item.event == 'available') {
                let ready= 0;

                item.listener.forEach((item) => {
                    if(Object.keys(object).indexOf(item) > -1)
                        ready++;
                });

                if(ready == item.listener.length) {
                    item.success();
                }
            }
        });
    }
};

export default Catalog;
