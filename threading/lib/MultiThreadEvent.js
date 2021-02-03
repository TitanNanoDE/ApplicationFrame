import Observable from '../../core/Observable';

const pThread = Symbol('MultiThreadEvent.thread');

export const MultiThreadEvent = {

    name: '',
    [pThread]: null,

    constructor(name, thread) {
        super.constructor();

        this[pThread] = thread;
        this.name = name;

        this[pThread].on(name, (data) => {
            super.emit(name, data);
        });

        return this;
    },

    emit(data) {
        this[pThread].emit(this.name, data);
    },

    __proto__: Observable,
};

export default MultiThreadEvent;
