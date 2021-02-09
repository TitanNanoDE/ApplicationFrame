import EventTarget from './EventTarget';

/**
 * This prototype provides a base construct for the core of an ECMAScript application
 */
const Application = {

    /**
    * Name of the application, other components can identify it.
    */
    name: '',

    /**
    * The current version of the application.
    */
    version: '0.0.0',

    /**
     *  Author meta data.
     */
    author: '',

    /**
     * Constructs the Application prototype.
     *
     * @return {Application}
     */
    new() {
        return { __proto__: this };
    },

    /**
    * Initializes the application when bootstrapping.
    *
    * @return {undefined}
    */
    init() {
        console.log(`Initialzing Application "${this.name}"!`);
    },

    /**
    * Emits a termination notice on the object. This is intended to notify sub components about the termination of the application.
    *
    * @param {string} reason The reason for the termination.
    *
    * @return {undefined}
    */
    terminate(reason) {
        this.emit('terminate', reason);
    },

    __proto__: EventTarget,

};

export default Application;
