import { IndexedQuery } from './IndexedQueryCompiler';

const Private = {
    store: Symbol('IndexedDeleteRangeCompiler.Private.store'),
    query: Symbol('IndexedDeleteRangeCompiler.Private.query'),
    db: Symbol('IndexedDeleteRangeCompiler.Private.db'),
    buildKeyRange: Symbol('IndexedDeleteRangeCompiler.Private.buildKeyRange'),
};

/**
 * the range compiler for indexedDB delete operations.
 */
export const IndexedDeleteRangeCompiler = {

    [Private.db]: null,
    [Private.allQueries]: null,
    [Private.store]: null,

    /**
     * creates a new indexed query
     *
     * @param  {string} storeName the store to query
     * @param  {Promise.<IDBDatabase>} db   the db to query
     *
     * @return {IndexedDeleteRangeCompiler}
     */
    constructor(storeName, db) {
        this[Private.store] = storeName;
        this[Private.query] = Object.create(IndexedQuery);
        this[Private.db] = db;

        return this;
    },


    /**
     * filters items from the result if the index doesn't match the given value.
     *
     * @param  {*} value value to compare
     *
     * @return {IndexedDeleteRangeCompiler}
     */
    equals(value) {
        this.from(value).to(value);

        return this;
    },

    /**
     * starts a new value range
     *
     * @param  {*} value                 range start value
     * @param  {boolean} [exclude=false] determines if the start value will be included in the range
     *
     * @return {IndexedDeleteRangeCompiler}
     */
    from(value, exclude=false) {
        this[Private.query].rangeStart = { value, exclude };

        return this;
    },

    /**
     * ends a value range
     *
     * @param  {*} value                 end value of the range
     * @param  {boolean} [exclude=false] determines if the end value will be included in the range
     *
     * @return {IndexedDeleteRangeCompiler}
     */
    to(value, exclude=false) {
        this[Private.query].rangeEnd = { value, exclude };

        return this;
    },

    /**
     * filters items from the result where the index is lower than the given value
     *
     * @param  {*} value
     *
     * @return {IndexedDeleteRangeCompiler}
     */
    lowerThan(value) {
        this.to(value, true);

        return this;
    },

    /**
     * filters items from the result where the index is higher than the given value
     *
     * @param  {*} value
     *
     * @return {IndexedDeleteRangeCompiler}
     */
    higherThan(value) {
        this.from(value, true);

        return this;
    },

    [Private.buildKeyRange]() {
        const { rangeStart, rangeEnd } = this[Private.query];
        const hasStart = rangeStart && rangeStart.value !== null && rangeStart.value !== undefined;
        const hasEnd = rangeEnd && rangeEnd.value !== null && rangeEnd.value !== undefined;
        const isSingleValue = hasStart && hasEnd && rangeStart.value === rangeEnd.value;

        if (!hasStart && !hasEnd) {
            throw new TypeError('key range for delete operation can not be empty. To delete all store items, use .clear()');
        }

        if (isSingleValue) {
            return IDBKeyRange.only(rangeStart.value);
        }

        if (!hasEnd) {
            return IDBKeyRange.lowerBound(rangeStart.value, rangeStart.exclude);
        }

        if (!hasStart) {
            return IDBKeyRange.upperBound(rangeEnd.value, rangeEnd.exclude);
        }

        return IDBKeyRange.bound(rangeStart.value, rangeEnd.value, rangeStart.exclude, rangeEnd.exclude);
    },

    commit() {
        const storeName = this[Private.store];
        const keyRange = this[Private.buildKeyRange]();

        return this[Private.db].then(db => {
            return new Promise((success, failure) => {
                try {
                    const request = db.transaction([storeName], 'readwrite')
                        .objectStore(storeName).delete(keyRange);

                    request.onsuccess = event => success(event.target.result);
                    request.onerror = failure;
                } catch (e) {
                    failure(e);
                }
            });
        });
    },

};

export default IndexedDeleteRangeCompiler;
