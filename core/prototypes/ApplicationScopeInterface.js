import { Make } from '../../util/make.js';
import Scopes from '../objects/Scopes.js';
import ApplicationScopePrivatePrototype from './ApplicationScopePrivatePrototype.js';
import Interface from './Interface.js';
import Extendables from '../objects/Extendables.js';
import Engine from '../objects/Engine.js';

// this prototype defines a new application scope interface
export default Make({

	on : function(type, listener){
		var scope= Scopes.get(this);

        scope.listeners.push({ type : type, listener : listener });
	},

	thread : function(f){
		var scope= Scopes.get(this);

        scope.workers.push(Make(Extendables.ScopeWorker)(f));
	},

    prototype : function(object){
        Scopes.get(this).private = Make(object, ApplicationScopePrivatePrototype)(Scopes.get(this));
    },

	main : function(f){
		var scope= Scopes.get(this);

        if(scope.private === null)
            scope.private = Make(ApplicationScopePrivatePrototype)(scope);

        scope.thread= f.bind(scope.private);

		Engine.ready.then(scope.thread);
	},

    module : function(name, dependencies, f){
        var scope = Scopes.get(this);

        scope.modules.on('available', dependencies).then(function(){
            scope.modules.add(new Promise(function(ready){
                f(scope, ready);
            }));
        });
    },

	terminate : function(type){
		var scope= Scopes.get(this);

        scope.getListeners('terminate').emit(type);
	}

}, Interface).get();
