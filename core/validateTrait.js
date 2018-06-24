/**
 * Validates if an object satifies a certain trait.
 *
 * @param  {Object} target the object to Validate
 * @param  {Object} trait  the trait which has to be satified
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
