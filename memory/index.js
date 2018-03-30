const heapObjects = new Map();
const heapObjectsReleased = {};
const heapArrays = new Map();
const heapArraysReleased = [];

/**
 * Allocates objects and arrays in memory. The allocated structures are excluded from garbage collection.
 *
 * @param  {string|number} typeOrLength either the length of an array, or a string identifying an object type.
 * @param  {Object} [prototype={}] the structures prototype
 *
 * @return {*}
 */
export const allocate = function(typeOrLength, prototype={}) {
    if (typeof typeOrLength === 'string') {
        let object = null;

        if (heapObjectsReleased[typeOrLength] && heapObjectsReleased[typeOrLength].length) {
            object = heapObjectsReleased[typeOrLength].shift();
        } else {
            if (prototype === WeakMap.prototype) {
                object = new prototype.constructor();
            } else {
                object = Object.create(prototype);
                object.constructor();
            }
        }

        heapObjects.set(object, typeOrLength);

        return object;
    } else {
        let array = heapArraysReleased.shift();

        if (!array) {
            array = [];
        }

        array.length = typeOrLength;
        heapArrays.set(array, true);

        return array;
    }
};

/**
 * Marks he given structure as unused and therefore available for usage.
 * If a new array or object is to be allocated the released items will be reused,
 * before an actual new object is created.
 *
 *
 * @param  {*} object data to be released
 *
 * @return {undefined}
 */
export const release = function(object) {
    if (Array.isArray(object)) {
        heapArrays.delete(object);
        heapArraysReleased.push(object);
    } else {
        const type = heapObjects.get(object);

        heapObjects.delete(object);

        if (!heapObjectsReleased[type]) {
            heapObjectsReleased[type] = [];
            heapObjectsReleased[type].push(object);
        }
    }
};

/**
 * Makes all released object available for garbage collection.
 *
 * @return {undefined}
 */
export const flushHeap = function() {
    heapArraysReleased.length = 0;

    Object.keys(heapObjectsReleased).forEach(key => {
        delete heapObjectsReleased[key];
    });
};
