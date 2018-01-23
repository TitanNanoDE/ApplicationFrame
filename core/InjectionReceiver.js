const InjectionReceiver = {
    _injectedObjects : null,

    constructor() {
        this._injectedObjects = new WeakMap();

        return this;
    },

    inject(original, injected) {
        this._injectedObjects.set(original, injected);
    },

    injected(object) {
        return this._injectedObjects.get(object) || object;
    }
};

export default InjectionReceiver;
