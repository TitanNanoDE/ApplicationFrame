import { Make } from '../../util/make.js';
import ArrayUtil from '../../core/objects/ArrayUtil.js';

/**
 * A query object for an indexedDB request.
 *
 * @lends module:IndexedDB.IndexedQuery#
 */
const IndexedQuery = {
    /** @type {string} */
    name: '',

    /** @type {*} */
    rangeStart: null,

    /** @type {*} */
    rangeEnd: null,
}

/**
 * the query compiler for indexedDB requests.
 *
 * @lends module:IndexedDB.IndexedQueryCompiler#
 */
const IndexedQueryCompiler = {
    /** @type {IndexedQuery} */
    _currentQuery: null,

    /** @type {IndexedQuery[]} */
    _allQueries: null,
    _store: '',
    _db: null,
    sortOrder: 'next',

    _make: function(storeName, db) {
        this._allQueries = [];
        this._store = storeName;
        this._db = db;
    },

    _transformExclude: function(value, exclude) {
        if (Array.isArray(value)) {
            value = value.map(item => {
                return { value: item, exclude: exclude };
            });
        } else {
            value = { value: value, exclude: exclude };
        }

        return value;
    },

    where: function(indexName) {
        this._currentQuery = Make(IndexedQuery)();
        this._currentQuery.name = indexName;

        return this;
    },

    equals: function(value) {
        this.from(value).to(value);

        return this;
    },

    from: function(value, exclude=false) {
        value = this._transformExclude(value, exclude);

        if (Array.isArray(this._currentQuery.rangeStart)) {
            this._currentQuery.rangeStart = ArrayUtil.assignEmpty(this._currentQuery.rangeStart, value);
        } else {
            this._currentQuery.rangeStart = value;
        }

        return this;
    },

    to: function(value, exclude=false) {
        value = this._transformExclude(value, exclude);

        if (Array.isArray(this._currentQuery.rangeEnd)) {
            this._currentQuery.rangeEnd = ArrayUtil.assignEmpty(this._currentQuery.rangeEnd, value);
        } else {
            this._currentQuery.rangeEnd = value;
        }

        return this;
    },

    lowerThan: function(value) {
        this.to(value, true);

        return this;
    },

    higherThan: function(value) {
        this.from(value, true);

        return this;
    },

    or: function(indexName) {
        this._allQueries.push(this._currentQuery);
        this.where(indexName);

        return this;
    },

    sort: function(direction) {
        if (direction === 'ASC') {
            this.sortOrder = 'next';
        } else if (direction === 'DESC') {
            this.sortOrder = 'prev';
        }

        return this;
    },

    get: function(...limit) {
        if (limit.length === 1) {
            limit.unshift(0);
        }

        this._allQueries.push(this._currentQuery);
        this._currentQuery = null;

        return this._execute(...limit);
    },

    _execute: function(start, end) {
        return this._db.then(db => {
            let matches = [];
            let results = [];

            return Promise.all(this._allQueries.map(query => {
                return new Promise((done, error) => {
                    let store = db.transaction([this._store], 'readonly').objectStore(this._store);
                    let range = null;
                    let rangeArray = Array.isArray(query.rangeStart) || Array.isArray(query.rangeEnd);

                    if (!rangeArray) {
                        if (query.rangeStart && query.rangeEnd) {
                            range = IDBKeyRange.bound(query.rangeStart.value, query.rangeEnd.value,
                                query.rangeStart.exclude, query.rangeEnd.exclude);
                        } else if (query.rangeStart) {
                            range = IDBKeyRange.lowerBound(query.rangeStart.value, query.rangeStart.exclude);
                        } else {
                            range = IDBKeyRange.upperBound(query.rangeEnd.value, query.rangeEnd.exclude);
                        }
                    }

                    let request = store.index(query.name).openCursor(range, this.sortOrder);

                    request.onsuccess = ({ target: { result: cursor } }) => {
                        if (!cursor) {
                            return done();
                        }

                        if (matches.indexOf(JSON.stringify(cursor.primaryKey)) < 0) {
                            let doesMatch = true;
                            let keyCount = query.rangeStart && query.rangeStart.length || 
                                           query.rangeEnd && query.rangeEnd.length;

                            if (start > 0) {
                                start -= 1;
                                end -= 1;
                                return cursor.continue();
                            } else if (start === 0 && end > 0) {
                                end -= 1;
                            } else if (start === 0 && end === 0) {
                                return done();
                            }

                            if (rangeArray) {
                                for (let i = 0; i < keyCount; i++) {
                                    if (query.rangeStart && query.rangeStart[i].value !== null) {
                                        if (query.rangeStart[i].exclude) {
                                            doesMatch = doesMatch && cursor.key[i] > query.rangeStart[i].value;
                                        } else {
                                            doesMatch = doesMatch && cursor.key[i] >= query.rangeStart[i].value;
                                        }
                                    }

                                    if (query.rangeEnd && query.rangeEnd[i].value !== null) {
                                        if (query.rangeEnd.exclude) {
                                            doesMatch = doesMatch && cursor.key[i] < query.rangeEnd[i].value;
                                        } else {
                                            doesMatch = doesMatch && cursor.key[i] <= query.rangeEnd[i].value;
                                        }
                                    }
                                }
                            }

                            if (doesMatch) {
                                results.push(cursor.value);
                                matches.push(JSON.stringify(cursor.primaryKey));
                            }
                        }

                        return cursor.continue();
                    };

                    request.onerror = error;
                });
            })).then(() => results);
        });
    }
};

export default IndexedQueryCompiler;
