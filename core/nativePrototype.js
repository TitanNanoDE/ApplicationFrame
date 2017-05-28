export const nativePrototype = function(nativeConstructor) {
    const NativeInherited = {
        constructor: function(...args) {
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

const HTMLElementProto = nativePrototype(HTMLElement);

export { HTMLElementProto as HTMLElement };
