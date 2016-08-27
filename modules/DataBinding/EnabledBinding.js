import { Make } from '../../util/make.js';
import { parseExpression } from './Parser.js';
import { polyInvoke } from './Util.js';
import Binding from './Binding.js';

let EnabledBinding = Make(/** @lends module:DataBinding.EnabledBinding# */{
    /**
     * @type {Node}
     */
    parentNode : null,

    /**
     * @constructs
     * @extends {module:DataBinding.Binding}
     */
    _make: Binding._make,

    /**
     * @param {module:DataBinding.ScopePrototype} scope the scope to work on
     * @return {void}
     */
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
