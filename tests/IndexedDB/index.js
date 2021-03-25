/* eslint-env mocha */

const { expect } = require('chai');
const mochaVM = require('../../node/mochaVM');
const IndexedDBShim = require('../shims/IndexedDbShim');

describe('IndexedDB', () => {
    const vm = mochaVM();

    mochaVM.applyNodeEnv(vm);

    vm.updateContext({
        indexedDB: IndexedDBShim(),
    });

    vm.runModule('../../testable/IndexedDB/index.js');

    it('should not be accessible after closing the connection', () => {
        const { testResult } = vm.apply((IndexedDB, async) => {
            const db = Object.create(IndexedDB).constructor('test-db');

            db.define(1).store('Test');

            const openPromise = new Promise((resolve, reject) => {
                async(() => {
                    db.write('Test', { a: 1 }).then(resolve, reject);
                });
            });

            const closedPromise = new Promise((resolve, reject) => {
                async(() => {
                    db.close();
                    db.write('Test', { t: 4 }).then(resolve, reject);
                });
            });

            global.testResult = { openPromise, closedPromise };
        }, ['IndexedDB', '_async.default']);

        expect(testResult.openPromise).to.be.a('promise');
        expect(testResult.closedPromise).to.be.a('promise');

        return Promise.all([
            testResult.openPromise
                .then(() => expect(true).to.be.true)
                .catch(() => expect.fail('promise should not reject!')),
            testResult.closedPromise
                .then(() => expect.fail('promise should reject!'))
                .catch(() => expect(true).to.be.true)
        ]);
    });
});
