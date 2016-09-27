import Binding from './Binding.js';
import { polyInvoke } from './Util.js';
import BindingRegistry from './BindingRegistry.js';


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
        polyInvoke(this.parentNode).removeAttribute(this.name);
        this.scopeBindingList.splice(this.scopeBindingList.indexOf(this), 1);
    },

    __proto__: Binding,
};

let style = document.createElement('style');

style.id = 'cloak-binding';

style.innerHTML = `
    [bind-cloak] {
        visibility: hidden;
    }
`;

document.head.appendChild(style);

BindingRegistry.register(CloakBinding);

export default CloakBinding;
