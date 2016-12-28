'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _make = require('../../util/make.js');

var _Parser = require('./Parser.js');

var _Util = require('./Util.js');

var _Binding = require('./Binding.js');

var _Binding2 = _interopRequireDefault(_Binding);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let EnabledBinding = (0, _make.Make)( /** @lends module:DataBinding.EnabledBinding# */{
    /**
     * @type {Node}
     */
    parentNode: null,

    /**
     * @constructs
     * @extends {module:DataBinding.Binding}
     */
    _make: _Binding2.default._make,

    /**
     * @param {module:DataBinding.ScopePrototype} scope the scope to work on
     * @return {void}
     */
    update: function (scope) {
        let value = (0, _Parser.parseExpression)(this.originalNodeValue, scope);

        if (!value) {
            (0, _Util.polyInvoke)(this.parentNode).setAttribute('disabled', '');
        } else {
            (0, _Util.polyInvoke)(this.parentNode).removeAttribute('disabled');
        }
    }

}, _Binding2.default).get();

exports.default = EnabledBinding;