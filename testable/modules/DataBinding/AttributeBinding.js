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

const AttributeBinding = (0, _make.Make)({

    name: 'bind-attr',

    config: null,

    _make: function ({ parentNode, scopeInfo, text }) {
        _Binding2.default._make.apply(this);

        this.parentNode = parentNode;
        this.config = (0, _Parser.ObjectParser)(text);

        scopeInfo.bindings.push(this);
    },

    update: function (scope) {
        let attrName = this.config.name;
        let attrValue = this.config.value ? (0, _Parser.parseExpression)(this.config.value, scope) : '';
        let attrEnabled = this.config.enabled ? (0, _Parser.parseExpression)(this.config.enabled, scope) : true;

        if (attrEnabled) {
            this.parentNode.setAttribute(attrName, attrValue);
        } else {
            this.parentNode.removeAttribute(attrName);
        }
    }

}, _Binding2.default).get();

_BindingRegistry2.default.register(AttributeBinding);

exports.default = AttributeBinding;