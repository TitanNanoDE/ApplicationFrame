const sha1 = require('sha1');

const openHooks = [];
const addAllHooks = [];

const callOpenHooks = function(cacheName) {
    openHooks.forEach(cb => cb(cacheName));
}

const callAddAllHooks = function(list) {
    addAllHooks.forEach(cb => cb(list));
}

const CachesShim = (cacheStore = {}) => ({

    cacheStore,

    open(cacheName) {

        callOpenHooks(cacheName);

        if (!(cacheName in cacheStore)) {
            cacheStore[cacheName] = {
                responses: [],
            };
        }

        return Promise.resolve({
            addAll(list) {
                list.forEach(url => cacheStore[cacheName].responses.push({ url }));

                CachesShim.status.addAllCalled = sha1(`${cacheName}:${list.join(',')}`);
                callAddAllHooks(list);
            }
        });
    },

    keys() {
        return Object.keys(this.cacheStore);
    },

    delete(cacheKey) {
        if (cacheKey in this.cacheStore) {
            delete this.cacheStore[cacheKey];
            
            return true;
        }

        return false;
    },

    _openHook(callback) {
        openHooks.push(callback);
    },

    _addAllHook(callback) {
        addAllHooks.push(callback);
    }
});

CachesShim.status = {};

module.exports = CachesShim;
