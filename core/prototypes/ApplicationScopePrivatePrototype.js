/**
 * @file ApplicationScopePrivatePrototype
 * @deprecated Don't use this file anymore. It will be removed soon.
 */

import Interface from './Interface.js';
import { Make } from '../../util/make.js';
import Scopes from '../objects/Scopes.js';

let ApplicationScopePrivatePrototype = Make({
    public : null,
    modules : null,

    _make : function(scope){
        Interface._make(scope);

        this.public = scope.public;
        this.modules = {};

        this._make = null;
    },

    onprogress : function(f){
        Scopes.get(this).listeners.push({ type : 'progress', listener : f });
    },

}, Interface).get();

export default ApplicationScopePrivatePrototype;
