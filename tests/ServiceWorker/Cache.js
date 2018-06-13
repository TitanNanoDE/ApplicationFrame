/* eslint-env mocha */

const istanbulVM = require('../../node/istanbulVM');
const { expect } = require('chai');
const fetchShim = require('../shims/FetchShim');
const cachesShim = require('../shims/CachesShim');
const IndexedDbShim = require('../shims/IndexedDbShim');
const sha1 = require('sha1');
const DateShim = require('../shims/DateShim');

describe('Cache', () => {
    const vm = istanbulVM();

    istanbulVM.applyNodeEnv(vm);

    vm.updateContext({
        indexedDB: IndexedDbShim(),
        IDBKeyRange: IndexedDbShim.IDBKeyRange,
    });

    it('should return the cache interface', () => {
        vm.runModule('../../testable/ServiceWorker/Cache.js');

        const result = vm.runModule('../testTasks/ServiceWorker/Cache/interface.js');

        expect(result.cache).to.have.all.keys('register', 'cleanUp', 'init', 'matchStatic');
        expect(result.cache.register).to.be.a('function');
        expect(result.cache.cleanUp).to.be.a('function');
        expect(result.cache.init).to.be.a('function');
        expect(result.cache.matchStatic).to.be.a('function');
    });

    describe('register', () => {
        it('should register a new cache manifest', () => {
            vm.updateContext({
                fetch: fetchShim({
                    'manifest.json': '{ "name": "test-cache", "buildId": 12314323, "staticFiles": ["test.js", "file.html", "./contents/data.json"] }'
                }),
                caches: cachesShim(),
            });

            const result = vm.runModule('../testTasks/ServiceWorker/Cache/register.js');

            expect(result.registerResult).to.be.a('promise');

            return result.registerResult.then(() => {
                expect(cachesShim.status.addAllCalled).to.be
                    .equal(sha1('test-cache:test.js,file.html,./contents/data.json'), 'addAll hasn\'t been called');

                expect(result.indexedDB.dbs['sw_storage']).to.exist;
                expect(result.console.stats.error).to.have.lengthOf(0, result.console.stats.error);
                expect(result.indexedDB.dbs['sw_storage']['config']).to.be.an('object');
                expect(result.indexedDB.dbs['sw_storage']['config'].items)
                    .to.deep.include({ key: 'cacheName', value: 'test-cache' });
            });
        });

        it('should add all static files', () => {
            const result = vm.getContext();
            const responses = result.caches.cacheStore['test-cache'].responses;

            expect(responses).to.deep.include({ url: 'test.js' });
            expect(responses).to.deep.include({ url: 'file.html' });
            expect(responses).to.deep.include({ url: './contents/data.json' });
        });
    });

    describe('init', () => {
        it('should not fetch if last check was less than 5 min ago', () => {
            vm.updateContext({
                Date: DateShim(),
            });

            const { value: lastUpdate } = vm.getContext()
                .indexedDB.dbs['sw_storage']['config'].items.find(item => item.key === 'cacheUpdate');

            const result = vm.runModule('../testTasks/ServiceWorker/Cache/update');

            return result.init.then(() =>
                expect(result.indexedDB.dbs['sw_storage']['config'].items)
                    .to.deep.include({ key: 'cacheUpdate', value: lastUpdate }));

        });

        it('should fetch the cache manifest if last check was more than 5 min ago', () => {
            vm.getContext().Date._offset = 700000;

            let cacheOpen = false;
            let manifestFetched = null;
            const { value: lastBuildDate } = vm.getContext().indexedDB.dbs['sw_storage']['config'].items
                .find(item => item.key == 'staticFileBuildId');
            const result = vm.runModule('../testTasks/ServiceWorker/Cache/update');

            result.caches._openHook(() => cacheOpen = true);
            result.fetch._fetchHook((url) => manifestFetched = url);

            return result.init.then(() => {
                expect(result.indexedDB.dbs['sw_storage']['config'].items).to.deep
                    .include({ key: 'staticFileBuildId', value: lastBuildDate });

                expect(manifestFetched).to.be.equal('manifest.json');
                expect(cacheOpen).to.be.false;
            });
        });

        it('should update cache if manifest build id has changed', () => {
            const addedFiles = [];
            let openedCache = null;

            vm.updateContext({
                fetch: fetchShim({
                    'manifest.json': '{ "name": "test-cache-v2", "buildId": 12314325, "staticFiles": ["test.js", "file.html", "./contents/data.json"] }'
                }),
            });

            const result = vm.runModule('../testTasks/ServiceWorker/Cache/update');

            result.caches._addAllHook(list => {
                addedFiles.push(...list);
            });

            result.caches._openHook(cacheName => openedCache = cacheName);

            return result.init.then(() => {
                expect(addedFiles).to.be.deep.equal(['test.js', 'file.html', './contents/data.json']);
                expect(openedCache).to.be.equal('test-cache-v2');
            });
        });
    });

    describe('cleanUp', () => {
        it('should delete all caches except the current', () => {
            vm.getContext().caches.cacheStore['test'] = {};
            vm.getContext().caches.cacheStore['oldCache'] = {};

            const result = vm.runModule('../testTasks/ServiceWorker/Cache/cleanUp');

            return result.cleanUp.then(() => {
                expect(Object.keys(result.caches.cacheStore)).to.have.lengthOf(1);
            });
        });
    });

});
