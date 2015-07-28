import Scopes from '../objects/Scopes.js';

export default {

    _make : function(scope){
        Scopes.set(this, scope);

        this._make = null;
    }

};
