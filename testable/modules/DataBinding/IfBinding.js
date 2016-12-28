'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _make = require('../../util/make.js');

var _Parser = require('./Parser.js');

var _Binding = require('./Binding.js');

var _Binding2 = _interopRequireDefault(_Binding);

var _BindingRegistry = require('./BindingRegistry.js');

var _BindingRegistry2 = _interopRequireDefault(_BindingRegistry);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let IfBinding = (0, _make.Make)( /** @lends module:DataBinding.IfBinding# **/{

    /** @type {string} */
    name: 'bind-if',

    /**
     * @type {Node}
     */
    parentNode: null,

    /**
     * @type {Node}
     */
    node: null,

    /**
     * @type {Node}
     */
    nextSibling: null,

    /**
     *
     * @constructs
     * @extends {Binding}
     * @param {Node} parentNode - this node
     * @param {string} text - the attribute value
     * @param {ScopeInfo} scopeInfo - bindings container
     *
     * @return {void}
     */
    _make: function ({ parentNode, text, scopeInfo }) {
        this.node = parentNode;
        this.parentNode = this.node.parentNode;
        this.text = text;
        this.nextSibling = parentNode.nextSibling;

        scopeInfo.bindings.push(this);
    },

    update: function (scope) {
        let isTrue = (0, _Parser.parseExpression)(this.text, scope);

        if (isTrue) {
            if (this.node.parentNode !== this.parentNode) {
                if (this.nextSibling) {
                    this.parentNode.insertBefore(this.node, this.nextSibling);
                } else {
                    this.parentNode.appendChild(this.node);
                }
            }
        } else {
            if (this.node.parentNode === this.parentNode) {
                this.parentNode.removeChild(this.node);
            }
        }
    }

}, _Binding2.default).get();

_BindingRegistry2.default.register(IfBinding);

exports.default = IfBinding;