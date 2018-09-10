const Application = {
    /** @type {Function} */
    emmit: Function,

    /** @type {Function} */
    on: Function,

    /**
     * Name of the application, other components can identify it.
     *
     * @type {string}
     */
    name: String,

    /**
     * The current version of the application.
     *
     * @type {String}
     */
    version: String,

    /**
     * Initializes the application when bootstrapping.
     *
     * @type {Function}
     */
    init: Function,

    /**
     * Emits a termination notice on the object.
     * This is intended to notify sub components about the termination of
     * the application.
     *
     * @type {Function}
     *
     * @param {string} reason
     *
     * @return {undefined}
     */
    terminate: Function,
};

export default Application;
