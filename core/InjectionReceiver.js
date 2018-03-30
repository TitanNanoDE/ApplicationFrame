
/**
 * Manages the injection of module dependencies.
 */
const InjectionReceiver = {

    /**
     * @private
     * @type {Array}
     */
    _injectedObjects : null,

    /**
     * @return {InjectionReceiver}
     */
    constructor() {
        this._injectedObjects = new WeakMap();

        return this;
    },

    /**
     * Injects a replacement dependency into the module that owns this InjectionReceiver.
     *
     * @param  {*} original the original value
     * @param  {*} injected the replacement value
     *
     * @return {undefined}
     */
    inject(original, injected) {
        this._injectedObjects.set(original, injected);
    },

    /**
     * returns the injected value for an original value
     *
     * @param  {*} object the original value
     *
     * @return {*} replacement value
     */
    injected(object) {
        return this._injectedObjects.get(object) || object;
    }
};

export default InjectionReceiver;
