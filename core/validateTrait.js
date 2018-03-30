/**
 * Validates if an object satifies a certain trait.
 *
 * @param  {Object} target [description]
 * @param  {Object} trait  [description]
 *
 * @return {boolean}
 */
const validateTrait = function(target, trait) {
    return Object.keys(trait).reduce((state, property) => {
        if (!state) {
            return false;
        }

        return typeof target[property] === trait[property];
    });
};

export default validateTrait;
