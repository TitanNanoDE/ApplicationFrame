import { Make } from '../../util/make.js';
import { parseExpression } from './Parser.js';
import { polyInvoke } from './Util.js';
import Binding from './Binding.js';

let EnabledBinding = Make(/** @lends EnabledBinding.prototype*/{
    /**
     * @type {Node}
     */
    parentNode : null,

    /**
     * @constructs
     * @extends {Binding}
     */
    _make : Binding._make,

    update : function(scope){
        let value = parseExpression(this.originalNodeValue, scope);

        if (!value) {
            polyInvoke(this.parentNode).setAttribute('disabled', '');
        } else {
            polyInvoke(this.parentNode).removeAttribute('disabled');
        }
    }

}, Binding).get();

export default EnabledBinding;
