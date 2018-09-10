import * as Trait from '../core/Trait';
import async from '../core/async';

export const EventTarget = {
    on: Function,
    emit: Function,
};

const listeners = new WeakMap();

Trait.impl(EventTarget, Object, {
    on(event, callback) {
        if (!listeners.has(this)) {
            listeners.push(this, new Map());
        }

        if (!listeners.get(this).get(event)) {
            listeners.get(this).set(event, []);
        }

        listeners.get(this).get(event).push(callback);
    },

    emit(event, data) {
        if (!listeners.has(this)) {
            return;
        }

        if (!listeners.get(this).has(event)) {
            return;
        }

        async(() => {
            listeners.get(this)
                .get(event).forEach(listener => listener(data));
        });
    }
});
