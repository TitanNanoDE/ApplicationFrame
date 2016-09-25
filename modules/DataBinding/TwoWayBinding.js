import { Make } from '../../util/make.js';
import { attributeNames } from './Mapping.js';
import { parseExpression, assignExpression } from './Parser.js';
import { polyInvoke } from './Util.js';
import Binding from './Binding.js';

/**
 * @class TwoWayBinding
 * @extends module:DataBinding.Binding
 * @memberof module:DataBinding
 */

let TwoWayBinding = Make(/** @lends module:DataBinding.TwoWayBinding# */{
    /**
     * @type {string}
     */
    currentValue : '',

    /**
     * @type {Node}
     */
    parentNode : null,

    /**
     * @type {boolean}
     */
    indirect : false,

    /**
     * @type {string}
     */
    viewBinding : '',

    update : function(scope){
        let value = parseExpression(this.properties[0], scope);
        let attribute = attributeNames.rename(this.node.name);

        if (!this.indirect) {
            polyInvoke(this.parentNode).setAttribute(attribute, value);
        } else {
            let oldValue = parseExpression(this.viewBinding, this.parentNode);

            if (value !== oldValue) {
                assignExpression(this.viewBinding, this.parentNode, value);
                this.currentValue = value;

                if (document.activeElement === this.parentNode) {
                    let range = document.createRange();
                    let selection = window.getSelection();
                    
                    range.selectNodeContents(this.parentNode);
                    range.collapse(false);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }
        }
    }
}, Binding).get();

export default TwoWayBinding;
