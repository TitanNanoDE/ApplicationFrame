/**
 * Fills empty array slots with items from the source array
 *
 * @param  {Array} target
 * @param  {...Array} sources
 *
 * @return {Array}
 */
export const assignEmpty = function(target, ...sources) {
    sources.forEach(source => {
        Array.prototype.forEach.apply(source, [(item, index) => {
            if (target[index] === null || target[index] === undefined) {
                target[index] = item;
            }
        }]);
    });

    return target;
};
