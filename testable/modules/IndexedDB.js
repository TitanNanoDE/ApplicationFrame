'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _make = require('../util/make.js');

var _IndexedQueryCompiler = require('./IndexedDB/IndexedQueryCompiler.js');

var _IndexedQueryCompiler2 = _interopRequireDefault(_IndexedQueryCompiler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @module IndexedDB
 */

const IndexedStoreDefinition = {
    name: '',
    indexes: null,

    _make: function (info) {
        this.description = info;
        this.indexes = [];
    }
};

const IndexedDefinition = {
    _version: 0,

    /** @type {IndexedStoreDefinition} */
    _currentStore: null,

    /** @type {IndexedStoreDefinition[]} */
    _allStores: null,

    _make: function (version) {
        this._version = version;
        this._allStores = [];
    },

    store: function (info) {
        if (this._currentStore) {
            this._allStores.push(this._currentStore);
        }

        if (typeof info === 'string') {
            info = { name: info };
        }

        this._currentStore = (0, _make.Make)(IndexedStoreDefinition)(info);

        return this;
    },

    index: function (name, members, options) {
        this._currentStore.indexes.push({
            name: name,
            members: members,
            options: options
        });

        return this;
    },

    _execute: function (db, transaction) {
        if (this._currentStore) {
            this._allStores.push(this._currentStore);
        }

        this._allStores.forEach(storeDefinition => {
            let store = null;

            try {
                store = transaction.objectStore(storeDefinition.name);
            } catch (e) {
                if (e.name === 'NotFoundError') {
                    store = db.createObjectStore(storeDefinition.description.name, storeDefinition.description);
                } else {
                    console.error(e);
                }
            }

            storeDefinition.indexes.forEach(index => {
                try {
                    store.createIndex(index.name, index.members, index.options);
                } catch (e) {
                    if (e.name === 'ConstraintError') {
                        store.deleteIndex(index.name);
                        store.createIndex(index.name, index.members, index.options);
                    } else {
                        console.error(e);
                    }
                }
            });
        });
    }
};

const IndexedDB = {
    _name: '',

    /**
     * [_definitions description]
     *
     * @type {Function[]}
     */
    _definitions: null,

    _setup: function (success, failure) {
        let request = window.indexedDB.open(this._name, this._definitions.length - 1);

        request.onsuccess = event => success(event.target.result);
        request.onerror = failure;
        request.onupgradeneeded = ({ oldVersion: lastVersion, target: { result: db, transaction } }) => {
            for (let i = lastVersion + 1; i < this._definitions.length; i++) {
                let setup = this._definitions[i];

                setup._execute(db, transaction);
            }
        };
    },

    _make: function (name) {
        this._name = name;
        this._definitions = [];

        this._promise = new Promise((success, failure) => {
            setTimeout(this._setup.bind(this, success, failure), 0);
        });
    },

    define: function (version) {
        this._definitions[version] = (0, _make.Make)(IndexedDefinition)(version);

        return this._definitions[version];
    },

    read: function (storeName) {
        return (0, _make.Make)(_IndexedQueryCompiler2.default)(storeName, this._promise);
    },

    write: function (storeName, value) {
        return this._promise.then(db => {
            return new Promise((success, failure) => {
                try {
                    let request = db.transaction([storeName], 'readwrite').objectStore(storeName).put(value);

                    request.onsuccess = event => success(event.target.result);
                    request.onerror = failure;
                } catch (e) {
                    failure(e);
                }
            });
        });
    }
};

exports.default = IndexedDB;