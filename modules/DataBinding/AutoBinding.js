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

    _scope : null,

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

                    this._scope = scopeHolder[scopeObjName];
                } else {
                    this._scope = makeTemplate(this.template, subScope, true);
                }
            }, 0);

            this._isBound = true;
        }
    },

    destory : function(){
        if (this._scope) {
            return this._scope.__destroy__(true);
        } else {
            return [0, 0];
        }
    }

}, Binding).get();

export default AutoBinding;
