'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _make = require('../../util/make.js');

var _ApplicationInternal = require('./ApplicationInternal.js');

var _ApplicationInternal2 = _interopRequireDefault(_ApplicationInternal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let Internal = new WeakMap();

/** @lends Application.prototype */
let Application = {

    /**
    * Name of this application so other components can identify the application.
    *
    * @type {string}
    */
    name: '',

    /**
    * Some components may need to know the version of this applicaion.
    *
    * @type {string}
    */
    version: '0.0.0',

    /**
    * @type {string}
    */
    author: '',

    /**
    * @constructs
    *
    * @return {void}
    */
    _make: function () {
        Internal.set(this, (0, _make.Make)(_ApplicationInternal2.default)());
    },

    /**
    * Initializes this application, default interface for components and modules.
    *
    * @return {void}
    */
    init: function () {
        console.log(`Initialzing Application "${ this.name }"!`);
    },

    /**
    * Registers a new event listener for the given event type.
    *
    * @param {string} type the event type
    * @param {function} listener the listener function
    *
    * @return {Application} this application
    */
    on: function (type, listener) {
        let scope = Internal.get(this);

        if (!scope.listeners[type]) {
            scope.listeners[type] = [];
        }

        scope.listeners[type].push(listener);

        return this;
    },

    /**
    * removes a previously attached listener function.
    *
    * @param  {string} type     the listener type
    * @param  {Function} listener the listener function to remove
    *
    * @return {void}
    */
    removeListener: function (type, listener) {
        let scope = Internal.get(this);

        if (scope.listeners[type]) {
            let index = scope.listeners[type].indexOf(listener);

            scope.listeners[type].splice(index, 1);
        }
    },

    /**
    * Emmits a new event on this application.
    *
    * @param {string} type event type
    * @param {Object} data event data
    *
    * @return {void}
    */
    emit: function (type, data) {
        let scope = Internal.get(this);
        let name = this.name ? `${ this.name }:%c ` : '%c%c';

        if (scope.listeners[type]) {
            console.log(`%c${ name }${ type } event emitted`, 'font-weight: 900; text-decoration: underline;', 'font-weight: initial; text-decoration: initial;');

            setTimeout(() => scope.listeners[type].forEach(f => f(data)), 0);
        }
    },

    /**
    * This function will try to terminate the application by emitting the termination event.
    *
    * @param {string} reason - the reason for the termination.
    *
    * @return {void}
    */
    terminate: function (reason) {
        this.emit('terminate', reason);
    }

};

exports.default = Application;