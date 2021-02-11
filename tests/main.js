/* eslint-env mocha */

'use strict';

const Import = require('./tools/import');
const expect = require('chai').expect;

console.log('### Application Frame Tests ###');

require('./node/vm');

describe('Make Util', () => {
    const makeModule = Import('../../testable/util/make');

    describe('Make()', () => {
        it('make()() should create a new instance', () => {
            const { Make } = makeModule.value;
            const TestPrototype = {};
            const instance = Make(TestPrototype)();

            expect(Object.getPrototypeOf(instance)).to.equal(TestPrototype);
            expect(instance).to.not.equal(TestPrototype);
        });

        it('make() should return a constructor', () => {
            const { Make } = makeModule.value;

            const TestPrototype = {};
            const constructor = Make(TestPrototype);

            expect(constructor).to.be.a('function');
        });
    });

    describe('hasPrototype()', () => {

        it('should return true if object has prototype', () => {
            const { hasPrototype } = makeModule.value;

            const testPrototype = {};
            const instance = Object.create(testPrototype);

            expect(hasPrototype(instance, testPrototype)).to.be.true;
        });

        it('should return false if object doesn\'t have prototype', () => {
            const { hasPrototype } = makeModule.value;

            const testPrototype = {};
            const instance = {};

            expect(hasPrototype(instance, testPrototype)).to.be.false;
        });
    });
});

describe('Prototypes', () => {
    require('./Application.js');
    require('./EventTarget.js');
    require('./Catalog');
    require('./Observable');

    require('./NetworkRequest');
});

describe('ServiceWorker', () => {
    require('./ServiceWorker/lib/getRegistration');
    require('./ServiceWorker/lib/NotificationManagerEventHandler');
    require('./ServiceWorker/lib/ServiceWorkerEventTarget');
    require('./ServiceWorker/Cache');
});

describe('Web', () => {
    require('./web/Manifest');
    require('./web/CustomElement');
});

require('./util/array');

require('./rendering');

require('./features');
