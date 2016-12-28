'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Binding = require('./Binding.js');

var _Binding2 = _interopRequireDefault(_Binding);

var _Util = require('./Util.js');

var _BindingRegistry = require('./BindingRegistry.js');

var _BindingRegistry2 = _interopRequireDefault(_BindingRegistry);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * [CloakBinding description]
 *
 * @lends module:DataBinding.CloakBinding#
 * @extends module:DataBinding.Binding
 *
 * @type {Object}
 */
const CloakBinding = {

    name: 'bind-cloak',

    scopeBindingList: null,

    _make({ parentNode, scopeInfo }) {
        this.parentNode = parentNode;
        this.scopeBindingList = scopeInfo.bindings;

        scopeInfo.bindings.push(this);
    },

    update() {
        (0, _Util.polyInvoke)(this.parentNode).removeAttribute(this.name);
        this.scopeBindingList.splice(this.scopeBindingList.indexOf(this), 1);
    },

    __proto__: _Binding2.default
};

let style = document.createElement('style');

style.id = 'cloak-binding';

style.innerHTML = `
    [bind-cloak] {
        visibility: hidden;
    }
`;

document.head.appendChild(style);

_BindingRegistry2.default.register(CloakBinding);

exports.default = CloakBinding;