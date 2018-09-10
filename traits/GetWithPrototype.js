import Trait from '../core/Trait';

export const GetWithPrototype = {
    getWithPrototype: Function
};

Trait.impl(GetWithPrototype, [WeakMap, Map], {
    GetWithPrototype(key) {
        do {
            const value = this.get(key);

            if (!value) { continue; }

            return value;
        }  while((key = Object.getPrototypeOf(key)));
    }
});
