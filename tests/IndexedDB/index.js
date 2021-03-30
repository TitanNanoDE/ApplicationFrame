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

    it('should upgrade the db at runtime when requested', () => {
        const { testResult, indexedDB } = vm.apply((IndexedDB, async) => {
            const db = Object.create(IndexedDB).constructor('test-db-2');

            db.define(1).store('Test');

            const openPromise = new Promise((resolve, reject) => {
                async(() => {
                    db.write('Test', { a: 1 }).then(resolve, reject);
                });
            });

            const updatePromise = openPromise.then(() => {
                return db.upgrade(2)
                    .store('SecondStore')
                    .index('id');
            });

            const postUpdatePromise = updatePromise.then(() => {
                return new Promise((resolve, reject) => {
                    async(() => {
                        db.write('SecondStore', { id: 1234 })
                            .then(resolve, reject);
                    });
                });
            });

            global.testResult = { postUpdatePromise };
        }, ['IndexedDB', '_async.default']);

        expect(testResult.postUpdatePromise).to.be.a('promise');

        return testResult.postUpdatePromise
            .then(() => {
                expect(indexedDB.dbs['test-db-2']['SecondStore']).to.be.an('object');
                expect(indexedDB.dbs['test-db-2']['SecondStore']).to.have.property('indexes');
                expect(indexedDB.dbs['test-db-2']['SecondStore']).to.have.property('items');
            }, () => expect.fail('promise should not reject!'));
    });
});
