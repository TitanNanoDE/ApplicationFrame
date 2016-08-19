
let registry = {};

let BindingRegistry = {

    /**
     * @param {Binding} binding - new binding type
     * @return {boolean} - success status
     */
    register : function(binding) {
        if (!registry[binding.name]) {
            registry[binding.name] = binding;
            return true;

        } else {
            console.warn(`Binding type ${binding.name} already exists!`);
            return false;
        }
    },

    /**
     * @param {string} name - binding name
     * @return {Binding} - the binding for the given name
     */
    get: function(name) {
        return registry[name];
    }
}

export default BindingRegistry;
