'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _make = require('../../util/make');

var _Parser = require('./Parser');

var _Binding = require('./Binding');

var _Binding2 = _interopRequireDefault(_Binding);

var _BindingRegistry = require('./BindingRegistry.js');

var _BindingRegistry2 = _interopRequireDefault(_BindingRegistry);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let ElementToScopeBinding = (0, _make.Make)( /** @lends module:DataBinding.ElementToScopeBinding.prototype */{

    /**
     * @type {string}
     */
    name: 'scope-id',

    /**
     * @type {Node}
     */
    parentNode: null,

    /**
     * @constructs
     * @extends {module:DataBinding.Binding}
     *
     * @param  {Node} parentNode   parent node of this binding
     * @param  {Object} scopeInfo  scope metadata object
     * @param  {string} text       original text value of the binding
     *
     * @return {void}
     */
    _make: function ({ parentNode, scopeInfo, text }) {
        _Binding2.default._make.apply(this);

        this.parentNode = parentNode;
        this.text = text;

        scopeInfo.bindings.push(this);
    },

    update: function (scope) {
        /** @type {Node} */
        let currentValue = (0, _Parser.parseExpression)(this.text, scope);

        if (currentValue !== this.parentNode) {
            (0, _Parser.assignExpression)(this.text, scope, this.parentNode);
            scope.__apply__(null, true);
        }
    }

}, _Binding2.default).get();

_BindingRegistry2.default.register(ElementToScopeBinding);

exports.default = ElementToScopeBinding;