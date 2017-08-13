const validateTrait = function(target, trait) {
    return Object.keys(trait).reduce((state, property) => {
        if (!state) {
            return false;
        }

        return typeof target[property] === trait[property];
    });
};

export default validateTrait;
