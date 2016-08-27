/** @lends EventTarget# */
let EventTarget = {

    /** @type {Object} */
    _listeners : null,

    /**
     * @constructs
     *
     * @return {void}
     */
    _make : function(){
        this._listeners = {};
    },

    /**
     * registers a new listener for the given event.
     *
     * @param {string} type the type of event
     * @param {function} listener callback to execute when the event fires
     *
     * @return {void}
     */
    on : function(type, listener){
        if (!this._listeners[type]) {
            this._listeners[type] = [];
        }

        this._listeners[type].push(listener);
    },

    /**
     * emmits a new event on this object
     *
     * @param {string} type the type of event
     * @param {*} data data to send to the callbacks
     *
     * @return {void}
     */
    emit : function(type, data){
        if (this._listeners[type]) {
            setTimeout(() =>
                this._listeners[type].forEach(listener =>
                    listener.apply(this, [data])
            ), 0);
        }
    }
};

export default EventTarget;
