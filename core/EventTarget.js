import async from './async';

const EventTarget = {

    /**
     * @private
     * @type {Object}
     */
    _listeners : null,

    /**
     * @return {EventTarget} [description]
     */
    constructor() {
        this._listeners = {};

        return this;
    },

    /**
     * @deprecated Do not use the make constructors
     *
     * @return {this}      [description]
     */
    _make(...args) {
        return this.constructor(...args);
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
            async(() => {
                this._listeners[type]
                    .forEach(listener => listener.apply(this, [data]));
            });
        }
    },

    /**
    * removes a previously attached listener function.
    *
    * @param  {string} type     the listener type
    * @param  {Function} listener the listener function to remove
    *
    * @return {void}
    */
    removeListener: function(type, listener) {
        if (this._listeners[type]) {
            const index = this._listeners[type].indexOf(listener);

            this._listeners[type].splice(index, 1);
        }
    },
};

export default EventTarget;
