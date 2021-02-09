import EventTarget from './EventTarget';
import async from './async';

const pObservers = Symbol('Observable.observers');

export const Observable = {

    /**
     * @type {object[]}
     */
    [pObservers]: null,

    constructor() {
        super.constructor();

        this[pObservers] = [];

        return this;
    },

    observe(observer) {
        return this[pObservers].push(observer);
    },

    removeObserver(observer) {
        const index = this[pObservers].findIndex(item => item === observer);

        return this[pObservers].splice(index, 1);
    },

    emit(type, data) {
        const observers = this[pObservers].filter(observer => type in observer);

        if (observers.length > 0) {
            async(() => {
                observers.forEach(observer => observer[type](data));
            });
        }

        super.emit(type, data);
    },

    __proto__: EventTarget,
};

export default Observable;
