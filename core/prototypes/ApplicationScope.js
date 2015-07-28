import { Make } from '../../util/make.js';
import Catalog from '../../util/Catalog.js';
import Extendables from '../objects/Extendables.js';


// this prototype defines a new application scope
export default {
    name : null,
    type : 'application',
    public : null,
    private : null,
    thread : null,
    workers : null,
    listeners : null,
    modules : null,

    _make : function(name){
        var self= this;

        this.name= name;
        this.public= Make(Extendables.ApplicationScopeInterface)(this);

        this.workers= [];
        this.listeners= [];
        this.modules = Make(Catalog)();

        this._make = null;
    },

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
