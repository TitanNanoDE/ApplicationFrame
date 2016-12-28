'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @module DataBinding/Mapping
 */

/**
 * Contains all the attribute names
 *
 * @namespace
 */
let attributeNames = exports.attributeNames = {
  events: 'events',
  visible: 'display',
  transparent: 'visible',
  classes: 'class',
  value: 'value',
  prefix: 'bind',
  enabled: 'enabled',
  model: 'model',
  modelEvent: 'model-event',

  /**
   * returns the value for a key
   *
   * @param  {string} key the key to lookup
   *
   * @return {string}     the coresponding value
   */
  get: function (key) {
    return `${ this.prefix }-${ this[key] }`;
  },

  /**
   * cuts off the prefix of the name
   *
   * @param  {string} name initial value
   *
   * @return {string}      the clean value
   */
  rename: function (name) {
    return name.replace(`${ this.prefix }\-`, '');
  }
};