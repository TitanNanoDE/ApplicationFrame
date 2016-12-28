/* eslint-env mocha */

'use strict';

const exec = require('child_process').exec;
const Import = require('./tools/import');
const expect = require('chai').expect;

console.log('### Application Frame Tests ###');

describe('core', () => {

    describe('Make Util', () => {
        let makeModule = Import('../../testable/util/make');

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

    describe('ArrayUtil', () => {
        Import('../../testable/core/objects/ArrayUtil');
    });

    describe('Prototypes', () => {
        require('./Application.js');
        require('./EventTarget.js');
        require('./Catalog');

        describe('NetworkReqest', () => {
            Import('../../testable/core/prototypes/NetworkRequest');
        });
    });
});
