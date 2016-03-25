/* eslint-env mocha */

'use strict';

let assert = require('assert');

describe('Application Prototype', function(){
    let Application = null;
    let Af = null;
    let instance = null;

    it('should load the core', () => {
        Af = require('../dist/af.js').default;

        assert.notEqual(null, Af);
    });

    it('should load the Application Prototype', () => {
        Application = require('../dist/core/prototypes/Application.js').default;

        assert.notEqual(null, Application);
    });

    it('should construct a new application', () => {
        instance = Af.Util.Make(Application)();

        assert.equal(Application, Object.getPrototypeOf(instance));
    });

    it('should broadcast an event on the application', (done) => {
        instance.on('test#1', () => done());
        instance.emit('test#1', true);
    });
});
