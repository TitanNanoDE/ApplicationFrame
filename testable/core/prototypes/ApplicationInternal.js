"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

/** @lends ApplicationInternal# */
let ApplicationInternal = {
  /**
   * @type {Thread}
   */
  thread: null,

  /**
   * @type {Worker[]}
   */
  workers: null,

  /**
   * @type {Function[]}
   */
  listeners: null,

  /**
   * @type {Catalog}
   */
  modules: null,

  /**
   * this prototype defines a new application scope
   *
   * @constructs
   *
   * @return {void}
   */
  _make: function () {
    this.workers = [];
    this.listeners = [];

    this._make = null;
  }
};

exports.default = ApplicationInternal;