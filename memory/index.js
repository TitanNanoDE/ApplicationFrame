const heapObjects = new Map();
const heapObjectsReleased = {};
const heapArrays = new Map();
const heapArraysReleased = [];

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

export const flushHeap = function() {
    heapArraysReleased.length = 0;

    Object.keys(heapObjectsReleased).forEach(key => {
        delete heapObjectsReleased[key];
    });
};
