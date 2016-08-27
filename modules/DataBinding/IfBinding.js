import { Make } from '../../util/make.js';
import { parseExpression } from './Parser.js';
import Binding from './Binding.js';
import BindingRegistry from './BindingRegistry.js';

let IfBinding = Make(/** @lends module:DataBinding.IfBinding# **/{

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
    _make: function({ parentNode, text, scopeInfo }) {
        this.node = parentNode;
        this.parentNode = this.node.parentNode;
        this.text = text;
        this.nextSibling = parentNode.nextSibling;

        scopeInfo.bindings.push(this);
    },

    update: function(scope) {
        let isTrue = parseExpression(this.text, scope);

        if (isTrue) {
            if (this.node.parentNode !== this.parentNode)　{
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
    },

}, Binding).get();

BindingRegistry.register(IfBinding);

export default IfBinding;
