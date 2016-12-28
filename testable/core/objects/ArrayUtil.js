"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

const ArrayUtil = {
    assignEmpty(target, ...sources) {
        sources.forEach(source => {
            Array.prototype.forEach.apply(source, (item, index) => {
                if (target[index] === null || target[index] === undefined) {
                    target[index] = item;
                }
            });
        });

        return target;
    }
};

exports.default = ArrayUtil;