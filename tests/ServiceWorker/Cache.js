/* eslint-env mocha */

const mochaVM = require('../../node/mochaVM');
const { expect } = require('chai');
const fetchShim = require('../shims/FetchShim');
const cachesShim = require('../shims/CachesShim');
const IndexedDbShim = require('../shims/IndexedDbShim');
const sha1 = require('sha1');
const DateShim = require('../shims/DateShim');
const ServiceWorkerGlobalScopeShim = require('../shims/ServiceWorkerGlobalScopeShim');

describe('Cache', () => {
    const vm = mochaVM();

    mochaVM.applyNodeEnv(vm);

    vm.updateContext({
        self: vm.getContext(),
        indexedDB: IndexedDbShim(),
        IDBKeyRange: IndexedDbShim.IDBKeyRange,
        process, // nyc needs this to run bable for instrumentation
    });

    vm.updateContext(ServiceWorkerGlobalScopeShim());
    vm.runModule('../../testable/ServiceWorker/Cache.js');
    vm.apply((_index) => _index.ServiceWorker.bootstrap(), ['_index']);

    it('should return the cache interface', () => {
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

            const swConfig = vm.getContext().indexedDB.dbs['sw_storage']['config'].items;
            const { value: lastBuildDate } = swConfig.find(item => item.key == 'staticFileBuildId');
            const { value: lastUpdate } = swConfig.find(item => item.key == 'cacheUpdate');

            const result = vm.runModule('../testTasks/ServiceWorker/Cache/update');

            result.caches._openHook(() => cacheOpen = true);
            result.fetch._fetchHook((url) => manifestFetched = url);

            // TODO: need to define some interface for ServiceWorkerEventTarget to emit udpate event!!
            return result.init.then(() => {
                expect(result.indexedDB.dbs['sw_storage']['config'].items)
                    .to.deep.include({ key: 'staticFileBuildId', value: lastBuildDate }, 'staticFileBuildId should not change');

                expect(result.indexedDB.dbs['sw_storage']['config'].items)
                    .to.not.deep.include({ key: 'cacheUpdate', value: lastUpdate }, 'has to udpate cacheUpdate timestamp');

                expect(manifestFetched).to.be.equal('manifest.json');
                expect(cacheOpen).to.be.false;
            });
        });

        it('should update cache if manifest build id has changed', () => {
            const addedFiles = [];
            let openedCache = null;

            vm.getContext().Date._offset += 750000;

            vm.updateContext({
                fetch: fetchShim({
                    'manifest.json': '{ "name": "test-cache-v2", "buildId": 12314325, "staticFiles": ["test.js", "file.html", "./contents/data.json"] }'
                }),
            });

            const swConfig = vm.getContext().indexedDB.dbs['sw_storage']['config'].items;
            const { value: lastBuildDate } = swConfig.find(item => item.key == 'staticFileBuildId');
            const { value: lastUpdate } = swConfig.find(item => item.key == 'cacheUpdate');

            const result = vm.runModule('../testTasks/ServiceWorker/Cache/update');

            result.caches._addAllHook(list => {
                addedFiles.push(...list);
            });

            result.caches._openHook(cacheName => openedCache = cacheName);

            return result.init.then(() => {
                const swConfig = result.indexedDB.dbs['sw_storage']['config'].items;

                expect(addedFiles).to.be.deep.equal(['test.js', 'file.html', './contents/data.json']);
                expect(openedCache).to.be.equal('test-cache-v2');

                expect(swConfig).to.not.deep.include({ key: 'staticFileBuildId', value: lastBuildDate }, 'staticFileBuildId should not change');
                expect(swConfig).to.not.deep.include({ key: 'cacheUpdate', value: lastUpdate }, 'has to udpate cacheUpdate timestamp');
                expect(swConfig).to.deep.include({ key: 'cacheName', value: 'test-cache-v2' }, 'has to udpate cacheName if it changed');
            });
        });

        it('should log errors to the console, abort and carry on');
        it('not initialize if no cache has been registered and reject');
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

    describe('matchStatic', () => {
        it('should serve existing requests from the cache');
        it('should resolve to undefined if no entry is found');
        it('should try to resolve to index.html as a fallback');
        it('should use the configured cache');
    });

});
