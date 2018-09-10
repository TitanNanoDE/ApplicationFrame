const TypeImplementations = new WeakMap();
const GenericImplementations = new WeakMap();

const typeToString = function(type) {
    if (typeof type === 'string') {
        return type;
    }

    if (typeof type === 'function') {
        return type.name.toLowerCase();
    }

    return type.toString().toLowerCase();
};

/**
 * Validates if an object satifies a certain trait.
 *
 * @param  {Object} target the object to Validate
 * @param  {Object} trait  the trait which has to be satified
 *
 * @return {boolean}
 */
export const has = function(trait, target) {
    return Object.keys(trait).reduce((state, property) => {
        if (!state) {
            return false;
        }

        return typeof target[property] === typeToString(trait[property]);
    });
};

export const impl = function(trait, target, impl) {
    impl.trait = trait;

    if (!TypeImplementations.has(target)) {
        TypeImplementations.set(target, new WeakMap());
    }

    if (!Array.isArray(target)) {
        target = [target];
    }

    target.forEach(target => {
        if (target === Object) {
            GenericImplementations.set(trait, impl);

            return;
        }

        TypeImplementations.get(target).set(trait, impl);
    });
};

const getWithPrototype = function(target, trait) {
    do {
        const implMap = TypeImplementations.get(target);

        if (!implMap) { continue; }

        const impl = implMap.get(trait);

        if (!impl) { continue; }

        return impl;
    } while ((target = Object.prototypeOf(target)));

    return null;
};

export const use = function(trait, target) {
    const impl =  getWithPrototype(target, trait) || GenericImplementations.get(trait);

    if (!impl) {
        throw 'specified object has no implementation for the given trait!';
    }

    return new Proxy(target, {
        get(key) {
            if (target[key]) {
                return target[key];
            }

            return impl[key];
        }
    });
};

export default {
    has,
    use,
    impl,
};
