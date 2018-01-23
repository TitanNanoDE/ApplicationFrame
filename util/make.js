/**
 * Internal function to apply one objects propteries to a target object.
 *
 * @param {Object} target
 * @param {Object} source
 * @inner
 */
var apply = function (target, source) {
    Object.keys(source).forEach(function(key){
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });

    return target;
};

/**
 * Creates a new object with the given prototype.
 * If two arguments are passed in, the properties of the first object will be
 * applied to the new object.
 *
 * @deprecated
 *
 * @param {Object} object
 * @param {Object} prototype
 * @return {function}
 */
export var Make = function(object, prototype) {
    if(arguments.length < 2){
        prototype = object;
        object = null;
    }

    if (object === null) {
        object = Object.create(prototype);
    } else {
        object = apply(Object.create(prototype), object);
    }

    var m = function(...args){
        var make = object.make || object._make || function(){};

        make.apply(object, args);

        return object;
    };

    m.get = function(){ return object; };

    return m;
};

/**
 * This method checks if the given prototype is in the prototype chain of
 * the given target object.
 *
 * @deprecated
 *
 * @param {Object} object
 * @param {Object} prototype
 * @return {boolean}
 */
export var hasPrototype = function(object, prototype){
    var p = Object.getPrototypeOf(object);

    while(p !== null && p !== undefined){
        if(typeof prototype == 'function')
            prototype = prototype.prototype;

        if(p == prototype)
            return true;
        else
            p = Object.getPrototypeOf(p);
    }

    return false;
};
