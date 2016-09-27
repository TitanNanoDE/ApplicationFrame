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
     * the last known view value
     *
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

    update : function(scope) {
        // the current value on the scope
        let value = parseExpression(this.properties[0], scope);

        if (!this.indirect) {
            let attribute = attributeNames.rename(this.node.name);

            polyInvoke(this.parentNode).setAttribute(attribute, value);
        } else {
            // the current view value
            //let viewValue = parseExpression(this.viewBinding, this.parentNode);

            // check if our current scope value is different from the last value.
            // Then check if the view value doesn't have unassigned changes.
            // Only apply the scope value to the view if both rules apply.
            if (value !== this.currentValue) {
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
