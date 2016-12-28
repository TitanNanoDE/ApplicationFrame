'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Binding = require('./Binding.js');

var _Binding2 = _interopRequireDefault(_Binding);

var _Parser = require('./Parser.js');

var _Util = require('./Util.js');

var _BindingRegistry = require('./BindingRegistry.js');

var _BindingRegistry2 = _interopRequireDefault(_BindingRegistry);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * [HtmlBinding description]
 *
 * @lends module:DataBinding.HtmlBinding#
 * @extends module:DataBinding.Binding
 *
 * @type {Object}
 */
const HtmlBinding = {

    name: 'bind-html',

    _make({ parentNode, text, scopeInfo }) {
        this.parentNode = parentNode;
        this.text = text;

        scopeInfo.bindings.push(this);
    },

    update(scope) {
        let text = (0, _Parser.parseExpression)(this.text, scope, this.parentNode);

        text = (0, _Util.sanitizeText)(text);

        if (this.parentNode.innerHTML !== text) {
            (0, _Util.polyInvoke)(this.parentNode).innerHTML = text;
        }
    },

    __proto__: _Binding2.default
};

_BindingRegistry2.default.register(HtmlBinding);

exports.default = HtmlBinding;