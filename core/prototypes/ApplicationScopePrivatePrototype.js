import Interface from './Interface.js';
import { Make } from '../../util/make.js';
import Scopes from '../objects/Scopes.js';

export default Make({
    public : null,
    modules : null,

    _make : function(scope){
        Object.getPrototypeOf(this)._make(scope);

        this.public = scope;
        this.modules = {};

        this._make = null;
    },

    onprogress : function(f){
        Scopes.get(this).listeners.push({ type : 'progress', listener : f });
    },

}, Interface).get();
