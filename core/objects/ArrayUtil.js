
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
}

export default ArrayUtil;
