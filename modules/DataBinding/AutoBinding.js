import { Make } from '../../util/make.js';
import Binding from './Binding.js';
import { parseExpression } from './Parser.js';
import { bindNode } from './Bind.js';

let AutoBinding = Make(/** @lends AutoBinding.prototype*/{

    scopeName : '',

    /** @type {HTMLTemplateNode} */
    template : null,

    _isBound : false,

    _make : function(){},

    update : function(scope) {
        if (!this._isBound) {
            scope = parseExpression(this.scopeName, scope);

            bindNode(this.template, scope, true);

            this._isBound = true;
        }
    }

}, Binding).get();

export default AutoBinding;
