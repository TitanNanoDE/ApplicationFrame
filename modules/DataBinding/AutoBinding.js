import { Make } from '../../util/make.js';
import Binding from './Binding.js';
import { parseExpression } from './Parser.js';
import { makeTemplate } from './Template.js';

let AutoBinding = Make(/** @lends AutoBinding.prototype*/{

    scopeName : '',

    /** @type {HTMLTemplateNode} */
    template : null,

    _isBound : false,

    _make : function(){},

    update : function(scope) {
        if (!this._isBound) {
            let subScope = parseExpression(this.scopeName, scope);

            setTimeout(() => {
                let scopeHolder = null;
                let scopeObjName = null;

                if (this.scopeName.lastIndexOf('.') > 0) {
                    scopeHolder = this.scopeName.split('.');
                    scopeObjName =  scopeHolder.pop();
                    scopeHolder = parseExpression(scopeHolder.join('.'), scope);

                    scopeHolder[scopeObjName] = makeTemplate(this.template, subScope, true);
                } else {
                    makeTemplate(this.template, subScope, true);
                }
            }, 0);

            this._isBound = true;
        }
    }

}, Binding).get();

export default AutoBinding;
