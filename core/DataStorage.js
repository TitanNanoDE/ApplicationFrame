import EventTarget from './EventTarget';

const whenFilled = function(successCallback) {
    if (successCallback && typeof successCallback === 'function') {
        this._filledCallbacks.push({ once: false, callback: successCallback });
    }

    if (this._value) {
        successCallback(this._value);
    }
};

const whenNext = function(callback) {
    if (callback && typeof callback === 'function') {
        this._filledCallbacks.push({ once: true, callback: callback });
    }
};

const once = function(callback) {
    if (callback && typeof callback === 'function') {
        if (!this._value) {
            this._filledCallbacks.push({ once: true, callback: callback });
        } else {
            callback(this._value);
        }
    }
};

// fake then if this should be handed to something that expects a promise
whenFilled.then = whenNext.then = once.then = function(callback) {
    return (new Promise((done) => {
        this(done);
    })).then(callback);
};

// dummy catch in case someone tries to use it
whenFilled.catch = whenNext.catch = once.catch = function(callback) {
    return (new Promise((done) => {
        this(done);
    })).catch(callback);
};

const DataStorage = {
    _value: null,
    _filledCallbacks: [],

    get value() {
        return this._value;
    },

    constructor() {
        this.when = whenFilled.bind(this);
        this.whenNext = whenNext.bind(this);
        this.once = once.bind(this);
        this._filledCallbacks = [];

        return this;
    },

    fill(value) {
        this._value = value;

        this._filledCallbacks = this._filledCallbacks.filter(item => {
            item.callback(this._value);
            return !item.once;
        });
    },

    when: null,

    once: null,

    whenNext: null,

    __proto__: EventTarget,
};

export default DataStorage;
