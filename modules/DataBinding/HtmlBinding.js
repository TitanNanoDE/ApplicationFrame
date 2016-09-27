import Binding from './Binding.js';
import { parseExpression } from './Parser.js';
import { sanitizeText, polyInvoke } from './Util.js';
import BindingRegistry from './BindingRegistry.js';


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
        let text = parseExpression(this.text, scope, this.parentNode);

        text = sanitizeText(text);

        if (this.parentNode.innerHTML !== text) {
            polyInvoke(this.parentNode).innerHTML = text;
        }
    },

    __proto__: Binding,
};

BindingRegistry.register(HtmlBinding);

export default HtmlBinding;
