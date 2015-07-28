/* global require */

import { Make } from '../../util/make.js';
import { createUniqueId } from '../util/functions.js';
import Scopes from '../objects/Scopes.js';
import Extendables from '../objects/Extendables.js';
import Interface from './Interface.js';

// this	prototype defines a new mozilla addon scope interface
export default Make({

	create : Extendables.ApplicationScopeInterface.main,

	'module' : Extendables.ApplicationScopeInterface.module,

	modules : function(depsObject){
		var scope= Scopes.get(this);

        Object.keys(depsObject).forEach(key => {
			if(!scope.modules[key])
				scope.modules[key]= depsObject[key];
		});
	},

	hook : function(globalObject){
		var scope= Scopes.get(this);

        scope.global= globalObject;
	},

    dataURL : function(path){
		var prefixURI= require('@loader/options').prefixURI;

        return (prefixURI + 'af/lib/') + (path || '');
    },

    talkTo : function(worker){
		return {
			talk : function(type, message){
				return new Promise(function(okay){
					var id= createUniqueId();
					worker.port.on(id, function ready(e){
						worker.port.removeListener(ready);
						okay(e);
					});
					worker.port.emit(type, { id : id, message : message });
				});
			},
			listen : function(type, callback){
				worker.port.on(type, function(e){
					var id= e.id;
					callback(e.message, function(message){
						worker.port.emit(id, message);
					});
				});
			}
		};
	}
}, Interface).get();
