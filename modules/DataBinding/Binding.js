import { hasPrototype } from '../../util/make';
import { parseExpression } from './Parser.js';
import { polyInvoke } from './Util.js';

/** @lends module:DataBinding.Binding.prototype */
let Binding = {

    /**
     * @type {string[]}
     */
    properties : null,

    /**
     * @type {string}
     */
    originalNodeValue : '',

    /**
     * @type {Node}
     */
    node : null,

    /**
     * @type {Node}
     */
    parentNode : null,

    /**
     * @type {Boolean}
     */
    singleExpression : false,

    /**
     * The basic prototype for bindings. Any binding should inherit form this prototype.
     *
     * @constructs
     * @return {void}
     */
    _make : function() {
        this.properties = [];
    },

    /**
     * updates a binding. The model will be checked for changes
     * and new data will be applied to the binding target.
     *
     * @param  {module:DataBinding.ScopePrototype} scope the scope on which
     *                                             this binding should operate.
     *
     * @return {void}
     */
    update : function(scope){
        let text = this.originalNodeValue;
        let localNode = { element: this.parentNode };
        let values = this.properties.map(key => {
            let item = { name : key, value : parseExpression(key, localNode, scope) };

            return item;
        });

        if (this.singleExpression) {
                text = parseExpression(text, localNode, scope);
        } else {
            text = text.toString().trim().split(/\s+/).join(' ');

            values.forEach(pair => {
                text = text.replace(`\{\{${pair.name}\}\}`, pair.value);
            });
        }


        if (hasPrototype(this.node, window.Attr)) {
            if (this.parentNode.getAttribute(this.node.name) !== text) {
                polyInvoke(this.parentNode).setAttribute(this.node.name, text);
            }
        } else {
            if (this.node.textContent !== text) {
                this.node.textContent = text;
            }
        }
    },

    test: function() { return true; }
};

export default Binding;
