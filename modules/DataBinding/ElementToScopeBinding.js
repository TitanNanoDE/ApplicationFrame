import { Make } from '../../util/make';
import { assignExpression, parseExpression } from './Parser';
import Binding from './Binding';

let ElementToScopeBinding = Make(/** @lends module:DataBinding.ElementToScopeBinding.prototype */{

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
    _make: function({ parentNode, scopeInfo, text }) {
        Binding._make.apply(this);

        this.parentNode = parentNode;
        this.text = text;

        scopeInfo.bindings.push(this);
    },

    update: function(scope) {
        /** @type {Node} */
        let currentValue = parseExpression(this.text, scope);

        if (currentValue !== this.parentNode) {
            assignExpression(this.text, scope, this.parentNode);
        }
    }

}, Binding);

export default ElementToScopeBinding;
