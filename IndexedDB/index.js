import { Make } from '../util/make';
import IndexedQueryCompiler from './IndexedQueryCompiler';
import async from '../core/async';

const IndexedStoreDefinition = {
    indexes: null,

    _make(info) {
        this.description = info;
        this.indexes = [];
    }
};

const IndexedDefinition = {

    /**
     * @private
     * @type {number}
     */
    _version: 0,

    /**
     * @private
     * @type {IndexedStoreDefinition}
     */
    _currentStore: null,

    /**
     * @private
     * @type {IndexedStoreDefinition[]}
     */
    _allStores: null,


    /**
     * Instantiates a new DB version.
     *
     * @param  {number} version
     *
     * @return {undefined}
     */
    _make(version) {
        this._version = version;
        this._allStores = [];
    },

    /**
     * Creates a new store definition.
     * Inside the store definition new indexes can be defined.
     *
     * @param  {string|{ name: string, keyPath: string, autoincrement: boolean }} info
     *
     * @return {IndexedDefinition}
     */
    store(info) {
        if (this._currentStore) {
            this._allStores.push(this._currentStore);
        }

        if (typeof info === 'string') {
            info = { name: info };
        }

        this._currentStore = Make(IndexedStoreDefinition)(info);

        return this;
    },

    /**
     * Creates a new index in the last defined store.
     * This has been chosen to be able to chain together all definition calls.
     *
     * @param  {string} name  name of the new index
     * @param  {string[]} members
     * @param  {object} options
     *
     * @return {IndexedDefinition}
     */
    index(name, members, options) {
        this._currentStore.indexes.push({
            name,
            members,
            options,
        });

        return this;
    },

    /**
     * executes the definition and creates the required stores and indexes
     *
     * @private
     *
     * @param  {IDBDatabase} db          the db object to operate on
     * @param  {IDBTransaction} transaction the db transaction
     *
     * @return {undefined}
     */
    _execute(db, transaction) {
        if (this._currentStore) {
            this._allStores.push(this._currentStore);
        }

        this._allStores.forEach(storeDefinition => {
            let store = null;

            try {
                store = transaction.objectStore(storeDefinition.description.name);
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
    /**
     * the name of the current db
     *
     * @private
     * @type {string}
     */
    _name: '',

    /**
     * @private
     * @type {Function[]}
     */
    _definitions: null,

    /**
     * runs all db setup tasks
     *
     * @private
     *
     * @return {Promise.<IDBDatabase>} [description]
     */
    _setup() {
        return new Promise((success, fail) => {
            const request = indexedDB.open(this._name, this._definitions.length - 1);

            request.onsuccess = (event) => success(event.target.result);
            request.onerror = fail;

            request.onupgradeneeded = ({ oldVersion: lastVersion, target: { result: db, transaction }}) => {
                for (let i = lastVersion+1; i < this._definitions.length; i++) {
                    const setup = this._definitions[i];

                    setup._execute(db, transaction);
                }
            };
        });
    },

    /**
     * Instantiates a new indexed DB.
     * All version definitions have to be made done synchronously.
     * The actual database creation is immediately scheduled for the next event cycle.
     *
     * @param {string} name of the db to open
     *
     * @return {IndexedDB}
     */
    constructor(name) {
        this._name = name;
        this._definitions = [];

        this._promise = async(this._setup.bind(this));

        return this;
    },

    /**
     * @deprecated
     *
     * @param {...any} args
     *
     * @return {IndexedDB}
     */
    _make(...args) {
        return this.constructor(...args);
    },

    /**
     * Creates a new version definition for the DB.
     * All stores and indexes for the current version have to be defined in this definition.
     *
     * @param  {number} version the version to be defined, don't use floats
     *
     * @return {IndexedDefinition} the new definition
     */
    define(version) {
        this._definitions[version] = Make(IndexedDefinition)(version);

        return this._definitions[version];
    },

    /**
     * Creates a new query to the database. The store which should be queried
     * from has to be specified.
     *
     * @param  {string} storeName to read from
     *
     * @return {IndexedQueryCompiler} a new query
     */
    read(storeName) {
        return Make(IndexedQueryCompiler)(storeName, this._promise);
    },

    /**
     * Stores an object in the selected store.
     * The promise resolves to the transaction result.
     *
     * @param  {string} storeName name of the targeted store
     * @param  {object} value     value to store
     *
     * @return {Promise}
     */
    write(storeName, value) {
        return this._promise.then(db => {
            return new Promise((success, failure) => {
                try {
                    const request = db.transaction([storeName], 'readwrite')
                        .objectStore(storeName).put(value);

                    request.onsuccess = event => success(event.target.result);
                    request.onerror = failure;
                } catch (e) {
                    failure(e);
                }
            });
        });
    },

    close() {
        this._promise.then(db => db.close());
        this._promise = Promise.reject(new Error(`DB ${this._name} has been closed and is no longer available`));
    },

    upgrade(version) {
        this.close();
        this._promise.catch(() => {});
        this._promise = async(this._setup.bind(this));

        return this.define(version);
    }
};

export default IndexedDB;
