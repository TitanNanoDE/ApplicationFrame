import { Make } from '../../util/make.js';
import Catalog from '../../util/Catalog.js';
import Extendables from '../objects/Extendables.js';


/**
 * @lends ApplicationScope.prototype
 */
let ApplicationScope = {
    /**
     * @type {string}
     */
    name : null,

    /**
     * @type {string}
     */
    type : 'application',

    /**
     * @type {ApplicationScopeInterface}
     */
    public : null,

    /**
     * @type {ApplicationScopePrivatePrototype}
     */
    private : null,

    /**
     * @type {Thread}
     */
    thread : null,

    /**
     * @type {Worker[]}
     */
    workers : null,

    /**
     * @type {Array}
     */
    listeners : null,

    /**
     * @type {Catalog}
     */
    modules : null,

    /**
     * this prototype defines a new application scope
     *
     * @constructs
     * @param {string} name
     * @implements {Scope}
     */
    _make : function(name){
        this.name= name;
        this.public= Make(Extendables.ApplicationScopeInterface)(this);

        this.workers= [];
        this.listeners= [];
        this.modules = Make(Catalog)();

        this._make = null;
    },

    /**
     * @param {string} type
     */
    getListeners : function(type){
        var list= [];

        list.emit= function(value){
            this.forEach(function(item){
                item.listener(value);
            });
        };

        this.listeners.forEach(function(item){
            if(item.type === type)
                list.push(item);
        });

        return list;
    }
};

export default ApplicationScope;
