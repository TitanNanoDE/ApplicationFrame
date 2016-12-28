/* eslint-env mocha */

'use strict';

const exec = require('child_process').exec;
const Import = require('./tools/import');
const expect = require('chai').expect;

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

    describe('Make Util', () => {
        let makeModule = Import('../../dist/util/make');

        describe('Make()', () => {
            it('make()() should create a new instance', () => {
                let { Make } = makeModule.value;
                let TestPrototype = {};
                let instance = Make(TestPrototype)();

                expect(Object.getPrototypeOf(instance)).to.equal(TestPrototype);
                expect(instance).to.not.equal(TestPrototype);
            });

            it('make() should return a constructor', () => {
                let { Make } = makeModule.value;

                let TestPrototype = {};
                let constructor = Make(TestPrototype);

                expect(constructor).to.be.a('function');
            });
        });

        describe('hasPrototype()', () => {

            it('should return true if object has prototype', () => {
                let { hasPrototype } = makeModule.value;

                let testPrototype = {};
                let instance = Object.create(testPrototype);

                expect(hasPrototype(instance, testPrototype)).to.be.true;
            });

            it('should return false if object doesn\'t have prototype', () => {
                let { hasPrototype } = makeModule.value;

                let testPrototype = {};
                let instance = {};

                expect(hasPrototype(instance, testPrototype)).to.be.false;
            })
        });
    });

    describe('Prototypes', () => {
        require('./Application.js');
        require('./EventTarget.js');
        require('./Catalog');

        Import('../../dest/core/prototypes/NetworkRequest');
        Import('../../dest/core/objects/ArrayUtil');
    });
});
