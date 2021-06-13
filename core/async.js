/**
 * Executes the callback function as a microtask
 *
 * @param  {Function} callback task to execute
 *
 * @return {void}
 */
const async = function(callback) {
    return Promise.resolve().then(callback);
};

export default async;
