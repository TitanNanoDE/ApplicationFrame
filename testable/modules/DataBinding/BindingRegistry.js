"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @module DataBinding/BindingRegistry
 */

/**
 * Registry of all bindings.
 *
 * @type {Object}
 */
let registry = {};

/**
 * Public Singleton Interface for the binding registry.
 *
 * @class BindingRegistry
 */
/** @lends module:DataBinding/BindingRegistry~BindingRegistry.prototype */
let BindingRegistry = {

  /**
   * @param {Binding} binding - new binding type
   * @return {boolean} - success status
   */
  register: function (binding) {
    if (!registry[binding.name]) {
      registry[binding.name] = binding;
      return true;
    } else {
      console.warn(`Binding type ${ binding.name } already exists!`);
      return false;
    }
  },

  /**
   * @param {string} name - binding name
   * @return {Binding} - the binding for the given name
   */
  get: function (name) {
    return registry[name];
  }
};

/**
 * @member BindingRegistry
 * @static
 * @type module:DataBinding/BindingRegistry~BindingRegistry
 */
exports.default = BindingRegistry;