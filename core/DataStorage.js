import EventTarget from './EventTarget';

// fake then if this should be handed to something that expects a promise
const thenHandler = function(callback) {
    return (new Promise((done) => {
        this(done);
    })).then(callback);
};

// dummy catch in case someone tries to use it
const catchHandler = function(callback) {
    return (new Promise((done) => {
        this(done);
    })).catch(callback);
};

const whenFilled = function(target) {
    let f = function(successCallback) {
        if (successCallback && typeof successCallback === 'function') {
            this._filledCallbacks.push({ once: false, callback: successCallback });
        }

        if (this._value) {
            successCallback(this._value);
        }
    };

    f = f.bind(target);
    f.then = thenHandler;
    f.catch = catchHandler;

    return f;
};

const whenNext = function(target) {
    let f = function(callback) {
        if (callback && typeof callback === 'function') {
            this._filledCallbacks.push({ once: true, callback });
        }
    };

    f = f.bind(target);
    f.then = thenHandler;
    f.catch = catchHandler;

    return f;
};

const once = function(target) {
    let f = function(callback) {
        if (callback && typeof callback === 'function') {
            if (!this._value) {
                this._filledCallbacks.push({ once: true, callback });
            } else {
                callback(this._value);
            }
        }
    };

    f = f.bind(target);
    f.then = thenHandler;
    f.catch = catchHandler;

    return f;
};

const DataStorage = {
    /**
     * @private
     * @type {*}
     */
    _value: null,

    /**
     * @private
     * @type {Function[]}
     */
    _filledCallbacks: [],

    /**
     * @type {*}
     */
    get value() {
        return this._value;
    },

    /**
     * @return {DataStorage}
     */
    new() {
        const instance = super.new();

        instance.when = whenFilled(instance);
        instance.whenNext = whenNext(instance);
        instance.once = once(instance);
        instance._filledCallbacks = [];

        return instance;
    },

    /**
     * stores a value inside the DataStorage and triggers callbacks.
     *
     * @param  {*} value any value can be stored
     *
     * @return {undefined}
     */
    fill(value) {
        this._value = value;

        this._filledCallbacks = this._filledCallbacks.filter(item => {
            item.callback(this._value);

            return !item.once;
        });
    },

    /**
     * Registers a callback which is executed everytime a value is filled into the DataStorage.
     * If the DataStorage is already filled at the point of callback registration, the callback is invoced.
     *
     * @param {Function} callback
     *
     * @return {undefined}
     */
    when: null,

    /**
     * Registers a one time callback which is executed as soon as the DataStorage has been filled.
     *
     * @param {Function} callback
     *
     * @return {undefined}
     */
    once: null,

    /**
     * Registers a one time callback for the next time the DataStorage is filled.
     * This is usefull when waiting for an update.
     *
     * @param {Function} callback
     *
     * @return {undefined}
     */
    whenNext: null,

    __proto__: EventTarget,
};

export default DataStorage;
