/**
 * @file Interface
 * @deprecated don't use this file anymore. It will be removed soon.
 */

import Scopes from '../objects/Scopes.js';

let Interface = {

    _make : function(scope){
        Scopes.set(this, scope);

        this._make = null;
    }

};

export default Interface;
