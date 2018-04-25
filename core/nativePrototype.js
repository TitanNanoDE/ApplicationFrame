/**
 * transforms an native constructor into a normal ECMAScript prototype object
 *
 * @param  {Function} nativeConstructor
 *
 * @return {Object}
 */
export const nativePrototype = function(nativeConstructor) {
    const NativeInherited = {
        constructor: function NativeConstructor(...args) {
            return Reflect.construct(nativeConstructor, args, this.constructor);
        },

        __proto__: nativeConstructor.prototype,
    };

    return prepareConstructor(NativeInherited);
};

export const prepareConstructor = function(prototype) {
    prototype.constructor.prototype = prototype;

    return prototype;
};

/**
 * A drop-in replacement for the HTMLElement construct function
 *
 * @type {HTMLElement}
 */
const HTMLElementProto = nativePrototype(HTMLElement);

export { HTMLElementProto as HTMLElement };
