/* eslint-env mocha */

'use strict';

let exec = require('child_process').exec;
let assert = require('assert');

console.log('### Application Frame Tests ###');

let codeReady = new Promise((success, failed) => {
    exec('gulp', (error, stdout, stderr) => {
        if (error) {
            console.error('compiler:', stderr);
            failed(error);
        }

        success();
    });
});

describe('compile', function(){
    this.slow(10000);
    this.timeout(0);

    it('should compile the source code so we can test it', () => {
        return codeReady;
    })
})

describe('core', () => {
    let Af = null;
    let share = { Af : null };

    it('should import the main script', () => {
        Af = require('../dist/af.js').default;
        share.Af = Af;

        assert.notEqual(null, Af);
    })

    describe('public Util methods', () => {
        let makejs = null;

        it('should import the make util', () => {
            makejs = require('../dist/util/make.js');

            assert.notEqual(null, makejs);
        });

        it('should expose the Make function', () => {
            assert.equal(makejs.Make, Af.Util.Make);
        });

        it('should expose the hasPrototype function', () => {
            assert.equal(makejs.hasPrototype, Af.Util.hasPrototype);
        });

        it('should expose the Mixin function', () => {
            assert.equal(makejs.Mixin, Af.Util.Mixin);

        });
    });

    describe('public prototypes', () => {
        it('should expose the Application prototype', () => {
            let application = require('../dist/core/prototypes/Application.js').default;

            assert.equal(application, Af.Prototypes.Application);
        });

        it('should expose the EventTarget prototype', () => {
            let eventTarget = require('../dist/core/prototypes/EventTarget.js').default;

            assert.equal(eventTarget, Af.Prototypes.EventTarget);
        });
    });

    require('./Application.js');

    require('./EventTarget.js').test(assert, share);
});
