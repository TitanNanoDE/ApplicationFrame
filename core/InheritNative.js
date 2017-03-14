export const inheritNative = function(nativeConstructor) {
    const NativeInherited = {
        constructor: function(...args) {
            this.constructor.prototype = this;

            return Reflect.construct(nativeConstructor, args, this.constructor);
        },

        __proto__: nativeConstructor.prototype,
    };

    return NativeInherited;
};

export const prepareConstructor = function(prototype) {
    prototype.constructor.prototype = prototype;

    return prototype;
};
