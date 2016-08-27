import { Make } from '../../util/make.js';
import Binding from './Binding.js';
import { parseExpression } from './Parser.js';
import { makeTemplate } from './Template.js';

let AutoBinding = Make(/** @lends module:DataBinding.AutoBinding.prototype*/{

    scopeName : '',

    /** @type {HTMLTemplateNode} */
    template : null,

    /** @type {boolean} */
    _isBound : false,

    /**
     * An auto binding instanciates a template and binds it
     * to a property of the current scope.
     *
     * @constructs
     * @extends module:DataBinding.Binding
     * @return {void}
     */
    _make : function(){},

    /** @type module:DataBinding.ScopePrototype */
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

    /**
     * destroys this binding. This binding needs to be destroied before
     * it is deleted, since it creates a new scope.
     *
     * @return {void}
     */
    destory : function(){
        if (this._scope) {
            return this._scope.__destroy__(true);
        } else {
            return [0, 0];
        }
    }

}, Binding).get();

export default AutoBinding;
