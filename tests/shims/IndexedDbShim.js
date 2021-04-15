const async = require('../../testable/core/async').default;

const IndexedDbShim = () => ({
    /**
     * [dbs description]
     * @type {object.<string, object>}
     */
    dbs: [],

    open(name, version) {
        if (version < 1) {
            console.error('db version can\'t be smaller than 1');
        }

        if (!this.dbs[name]) {
            this.dbs[name] = {};
        }

        const response = {
            onsuccess: null,
            onerror: null,
            onupgradeneeded: null,
        };

        async(() => {
            response.onupgradeneeded({
                oldVersion: 0,
                target: {
                    result: getDbInterface(this.dbs[name]),
                    transaction: getTransaction(this.dbs[name]),
                }
            });

            response.onsuccess({ target: { result: getDbInterface(this.dbs[name]), } });
        });

        return response;
    }
});


const getTransaction = (host) => ({
    objectStore(storeName) {
        if (!host[storeName]) {
            const error = new Error(`store does not exist: ${storeName}`);

            error.name = 'NotFoundError';

            throw error;
        }

        return getStoreInterface(host[storeName]);
    }
});

const getDbInterface = (host) => ({
    isOpen: true,

    createObjectStore(name, description) {
        if (!host[name]) {
            host[name] = { indexes: {}, items: [], description };

            return getObjectStoreInterface(host[name]);
        }

        return null;
    },

    transaction(storeNames, mode) {
        if (mode === 'read') {
            throw 'transaction mode \'read\' is not shimmed!';
        }

        if (!this.isOpen) {
            const error = new Error('database has been closed');

            error.name = 'InvalidStateError';

            throw error;
        }

        return getTransaction(host);
    },

    close() {
        this.isOpen = false;
    }
});

const getStoreInterface = (host) => ({
    put(value) {
        const keyPath = host.description.keyPath;
        const index = host.items.findIndex(item => item[keyPath] === value[keyPath]);

        (index < 0) ? host.items.push(value) : host.items.splice(index, 1, value);

        const result = {
            onsuccess: null,
            onerror: null,
        };

        async(() => {
            result.onsuccess({ target: { result } });
        });

        return result;
    },

    clear() {
        const result = {
            onsuccess: null,
            onerror: null,
        };

        host.items.length = 0;

        async(() => {
            result.onsuccess({ target: { result: null } });
        });

        return result;
    },

    delete(keyRange) {
        const result = {
            onsuccess: null,
            onerror: null,
        };

        async(() => {
            if (!('upper' in keyRange) || !('lower' in keyRange) || !('lowerOpen' in keyRange) || !('upperOpen' in keyRange)) {
                throw new TypeError('The key is not a valid key or a key range');
            }

            host.items.filter(item => {
                const key = host.description.keyPath;

                return (keyRange.lowerOpen ? item[key] > keyRange.lower : item[key] >= keyRange.lower) &&
                    (keyRange.upperOpen ? item[key] < keyRange.upper : item[key] <= keyRange.upper);
            }).forEach(item => {
                const index = host.items.indexOf(item);

                host.items.splice(index, 1);
            });

            result.onsuccess({ target: { result: null } });
        });

        return result;
    },

    index(name) {
        return getIndexInterface({ store: host, selectedIndex: name });
    }
});

const getObjectStoreInterface = (host) => ({
    createIndex(name, keyPath, params) {
        host.indexes[name] = { name, keyPath, params, store: host };

        return Symbol('empty index interface: ');
    }
});

const getKeypathValue = function(host, object) {
    return object[host.store.indexes[host.selectedIndex].keyPath];
};

const getIndexInterface = (host) => ({
    openCursor(range /*, sortOrder */) {

        const continueCursor = function() {
            const item = list.pop();
            const currentResult = item ? { primaryKey: getKeypathValue(host, item), value: item, continue: continueCursor } : null;

            async(() => result.onsuccess({ target: { result: currentResult } }));
        };

        const list = host.store.items.filter(item => {
            const keyPathValue = getKeypathValue(host, item);


            if (range.lower) {
                if (range.lowerOpen && keyPathValue <= range.lower) {
                    return false;
                }

                if (keyPathValue < range.lower) {
                    return false;
                }
            }

            if (range.upper) {
                if (range.upperOpen && keyPathValue >= range.upper) {
                    return false;
                }

                if (keyPathValue > range.upper) {
                    return false;
                }
            }

            return true;
        });

        continueCursor();

        const result = {
            onsuccess: null,
            onerror: null,
        };


        return result;
    }
});

module.exports = IndexedDbShim;

module.exports.IDBKeyRange = {
    bound(lower, upper, lowerOpen = false, upperOpen = false) {
        return { lower, upper, lowerOpen, upperOpen };
    },

    upperBound(upper, upperOpen = false) {
        return { upper, upperOpen };
    },

    lowerBound(lower, lowerOpen = false) {
        return { lower, lowerOpen };
    },

    only(value) {
        return this.bound(value, value);
    }
};
