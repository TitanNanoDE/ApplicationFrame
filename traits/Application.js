const Application = {
    /** @type {Function} */
    emmit: 'function',

    /** @type {Function} */
    on: 'function',

    /**
     * Name of the application, other components can identify it.
     *
     * @type {string}
     */
    name: 'string',

    /**
     * The current version of the application.
     *
     * @type {String}
     */
    version: 'string',

    /**
     * Initializes the application when bootstrapping.
     *
     * @type {Function}
     */
    init: 'function',

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
    terminate: 'function',
};

export default Application;
