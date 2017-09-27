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

const whenNext = function(target) {
    let f = function(callback) {
        if (callback && typeof callback === 'function') {
            this._filledCallbacks.push({ once: true, callback: callback });
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
                this._filledCallbacks.push({ once: true, callback: callback });
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
    _value: null,
    _filledCallbacks: [],

    get value() {
        return this._value;
    },

    constructor() {
        super.constructor();

        this.when = whenFilled(this);
        this.whenNext = whenNext(this);
        this.once = once(this);
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
