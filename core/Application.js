import EventTarget from './EventTarget';

/** @lends Application.prototype */
let Application = {

    /**
    * Name of this application so other components can identify the application.
    *
    * @type {string}
    */
    name : '',

    /**
    * Some components may need to know the version of this applicaion.
    *
    * @type {string}
    */
    version : '0.0.0',

    /**
    * @type {string}
    */
    author : '',

    constructor() {
        super.constructor();

        return this;
    },

    _make(...args) {
        return this.constructor(...args);
    },

    /**
    * Initializes this application, default interface for components and modules.
    *
    * @return {void}
    */
    init : function(){
        console.log(`Initialzing Application "${this.name}"!`);
    },

    /**
    * This function will try to terminate the application by emitting the termination event.
    *
    * @param {string} reason - the reason for the termination.
    *
    * @return {void}
    */
    terminate : function(reason){
        this.emit('terminate', reason);
    },

    __proto__: EventTarget,

};

export default Application;
