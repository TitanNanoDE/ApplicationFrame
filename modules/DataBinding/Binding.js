import { hasPrototype } from '../../util/make';
import { parseExpression } from './Parser.js';
import { polyInvoke } from './Util.js';

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

    _make : function(){
        this.properties = [];
    },

    update : function(scope){
        let text = this.originalNodeValue;
        let values = this.properties.map(key => {
            let item = { name : key, value : parseExpression(key, scope) };

            return item;
        });

        if (this.singleExpression) {
                text = parseExpression(text, scope);
        } else {
            values.forEach(pair => {
                text = text.replace(`\{\{${pair.name}\}\}`, pair.value);
            });
        }

        if (hasPrototype(this.node, window.Attr)) {
            if (polyInvoke(this.parentNode).getAttribute(this.node.name) !== text) {
                polyInvoke(this.parentNode).setAttribute(this.node.name, text);
            }
        } else {
            text = text.toString().replace(/ /g, '\u00a0');

            if (this.node.textContent !== text) {
                this.node.textContent = text;
            }
        }
    }
};

export default Binding;
