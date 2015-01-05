//Hash Controller - v0.1 copyright by TitanNano / Jovan Ggerodetti - http://www.titannano.de

'use strict';

var hash= {
	actions : [],
	path : [],
	overrides : {},
	target : null
};
        
//      Classes
var HashEvent= function(type, path){
	this.type= type;
	this.path= path;
	this.trigger= function(count){
		var path= this.path;
		if(this.type == HashEvent.ADD){
			hash.actions.forEach(function(item){
				if(item.path == path && item.enter && (!item.persistent || !item.active)){
					item.enter(path);
					if(item.persistent) item.active= true;
				}
			});
		}else if(this.type == HashEvent.LOST){
			hash.actions.forEach(function(item){
				var old= null;
				if(item.path == path && item.exit){
					if(!item.persistent || count == 1){
						item.exit(path);
						if(item.persistent){
							old= path.split('/');
							old.pop();
							delete hash.overrides[old.join('/')];
							item.active= false;
						}
					}else{
						old= path.split('/');
						old.pop();
						hash.overrides[old.join('/')]= path;
					}
				}
			});
		}else{
			console.error('unknown HashEvent type!');
		}
	};
};

HashEvent.ADD= 0;
HashEvent.LOST= 1;

//exports
var interface_ = {
	mount : function(path, enter, exit, persistent){
		if(path instanceof Array)
			path.forEach(function(item){
				hash.actions.push({path : item, enter : enter, exit : exit, persistent : persistent, active : false });
			});
		else
			hash.actions.push({path : path, enter : enter, exit : exit, persistent : persistent, active : false });
		return true;
	},

	unmount : function(id){
		hash.actions.splice(id, 1);
	},

	down : function(newElement){
		$$.location.hash+= '/' + newElement;
	},
        
	up : function(){
		var hash= $$.location.hash.split('/');
		hash.shift();
		hash.pop();
		$$.location.hash= '!/' + hash.join('/');
	},
        
	swichTo : function(path){
		$$.location.hash= '!' + path;
	},

	trigger : function(){
		var e= new $$.Event('hashchange');
		$$.dispatchEvent(e);
	},

	restore : function(){
		var hash= hash.target.localStorage.getItem('af.hash.backup');
		var hashString= '#!' + hash.target.localStorage.getItem('af.hash.backup');
		if(hash && hashString != hash.target.location.hash)
			hash.target.location.hash= hashString;
		else
			this.trigger();
	},

	bind : function(object){
		hash.target= object;
		object.addEventListener('hashchange', function(){
			var hashPath= null;
			if(this.location.hash === "")
				hashPath= ('#!/').split('/');
			else
				hashPath= this.location.hash.split('/');

//          check hash path
			if(hashPath[0] != '#!'){
				console.error('error in your hash path!');
				return false;
			}
			hashPath.shift();

//  	   	save new path
			this.localStorage.setItem('af.hash.backup', '/'+hashPath.join('/'));

//  		compare old and new paths
			var events_lost= [];
			var events_add= [];
// 			find lost elements
			var difference= false;
			var path= '';
			for(var i= 0; i < hash.path.length; i++){
				path+= '/' + hash.path[i];
        
				if(difference)
					events_lost.push(new HashEvent(HashEvent.LOST, path));
				else if(hash.path[i] == hashPath[i])
					continue;
				else if(hash.path[i] != hashPath[i]){
					difference= true;
					events_lost.push(new HashEvent(HashEvent.LOST, path));
				}
			}

			events_lost.reverse();
			events_lost.forEach(function(item){
				item.trigger(events_lost.length);
			});

//  		check for overrides
			path= '/' + hashPath.join('/');
			if(hash.overrides[path]){
				this.location.hash= '#!' + hash.overrides[path];
				return;
			}

//			find new elements
			path= '';
			difference= false;
			for(i= 0; i < hashPath.length; i++){
				path+= '/' + hashPath[i];

				if(difference)
					events_add.push(new HashEvent(HashEvent.ADD, path));
				else if(hashPath[i] == hash.path[i])
					continue;
				else if(hashPath[i] != hash.path[i]){
					difference= true;
					events_add.push(new HashEvent(HashEvent.ADD, path));
				}
			}

			events_add.forEach(function(item){
				item.trigger(events_add.length);
			});

			hash.path= hashPath;

//  		Google Analytics Support (only analytics.js)
			if(this.ga){
				var location= this.location.protocol + '//' + this.location.hostname + this.location.pathname + this.location.search + this.location.hash;
				this.ga('send', 'pageview', location);
			}
		});
	}
};

export default {
	hash : interface_,

	config : {
		main : 'hash',
		version : 'v1.1',
		author : 'Jovan Gerodetti'
	}
};
