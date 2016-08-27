/**
 * @file ApplicationScope
 * @deprecated Don't use this file anymore. It will be removed soon.
 */

import { Make } from '../../util/make.js';
import Catalog from './Catalog.js';
import Extendables from '../objects/Extendables.js';


let ApplicationScope = {
    name : null,
    type : 'application',
    public : null,
    private : null,
    thread : null,
    workers : null,
    listeners : null,
    modules : null,
    _make : function(name){
        this.name= name;
        this.public= Make(Extendables.ApplicationScopeInterface)(this);

        this.workers= [];
        this.listeners= {};
        this.modules = Make(Catalog)();

        this._make = null;
    }
};

export default ApplicationScope;
