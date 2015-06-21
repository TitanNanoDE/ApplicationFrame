//Application Frame v0.1.0 - copyright by TitanNano / Jovan Ggerodetti - http://www.titannano.de

"use strict";

import { Make } from './util/make.js';

export var $$= window; //(typeof global != 'undefined') ? window : global;
	
//Variables
var scopes= new $$.WeakMap();

// Prototypes
var prototypes = {};

prototypes.Interface = {

    _make : function(scope){
        scopes.set(this, scope);

        this._make = null;
    }

};

prototypes.Catalog = {

    _listeners : null,

    _make : function(){
        this._listeners = [];

        this._make = null;
    },

    on : function(event, listener){
        var self= this;

        return new $$.Promise(function(success){
            if(listener.length > 0)
                self._listeners.push({ event : event, listener : listener, success : success });
            else
                success();
        });
    },

    add : function(key, value){
        this[key]= value;
        var object= this;
        this._listeners.forEach(function(item){

            if(item.event == 'available'){
                var ready= 0;
                item.listener.forEach(function(item){
                    if(Object.keys(object).indexOf(item) > -1)
                        ready++;
                });

                if(ready == item.listener.length){
                    item.success();
                }
            }
        });
    }
};

var ApplicationScopePrivatePrototype = Make({
    public : null,
    modules : null,

    _make : function(scope){
        Object.getPrototypeOf(this)._make(scope);

        this.public = scope;
        this.modules = {};

        this._make = null;
    },

    onprogress : function(f){
        scopes.get(this).listeners.push({ type : 'progress', listener : f });
    },

}, prototypes.Interface).get();

// this prototype defines a new application scope
prototypes.ApplicationScope = {
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
        this.public= Make(prototypes.ApplicationScopeInterface)(this);

        this.workers= [];
        this.listeners= [];
        this.modules = Make(prototypes.Catalog)();

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

// this prototype defines a new application scope interface
	
prototypes.ApplicationScopeInterface = Make({

	on : function(type, listener){
		var scope= scopes.get(this);

        scope.listeners.push({ type : type, listener : listener });
	},

	thread : function(f){
		var scope= scopes.get(this);

        scope.workers.push(Make(prototypes.ScopeWorker)(f));
	},

    prototype : function(object){
        scopes.get(this).private = Make(object, ApplicationScopePrivatePrototype)(scopes.get(this));
    },

	main : function(f){
		var scope= scopes.get(this);

        if(scope.private === null)
            scope.private = Make(ApplicationScopePrivatePrototype)(scope);

        scope.thread= f.bind(scope.private);

		Engine.ready.then(scope.thread);
	},

    module : function(name, dependencies, f){
        var scope = scopes.get(this);

        scope.modules.on('available', dependencies).then(function(){
            scope.modules.add(new Promise(function(ready){
                f(scope, ready);
            }));
        });
    },

	terminate : function(type){
		var scope= scopes.get(this);

        scope.getListeners('terminate').emit(type);
	}

}, prototypes.Interface).get();

// this prototype defines a new mozilla addon scope
prototypes.MozillaAddonScope = {
    name : 'addon',
    type : 'addon',
	public : null,

    _make : function(){
        this.public = Make(prototypes.MozillaAddonScopeInterface)(this);

        var self = this;
        this.private=  {
            public : this.public,
            onprogress : function(f){
                self.listeners.push({ type : 'progress', listener : f });
            }
        };

        this._make = null;
    }
};
	
// this	prototype defines a new mozilla addon scope interface

prototypes.MozillaAddonScopeInterface = Make({

	create : prototypes.ApplicationScopeInterface.main,

	'module' : prototypes.ApplicationScopeInterface.module,

	modules : function(depsObject){
		var scope= scopes.get(this);

        Object.keys(depsObject).forEach(key => {
			if(!scope.modules[key])
				scope.modules[key]= depsObject[key];
		});
	},

	hook : function(globalObject){
		var scope= scopes.get(this);

        scope.global= globalObject;
	},

    dataURL : function(path){
		var prefixURI= $$.require('@loader/options').prefixURI;

        return (prefixURI + 'af/lib/') + (path || '');
    },

    talkTo : function(worker){
		return {
			talk : function(type, message){
				return new $$.Promise(function(okay){
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
}, prototypes.Interface).get();

// this prototype defines a new service scope
prototypes.ServiceScope = {
	thread : null,
	isReady : false,
	messageQueue : null,
	public : null,

    _make : function(){
        this.public = Make(prototypes.ServiceScopeInterface)(this);
        this.messageQueue = [];

        this._make = null;
    }
};
	
// this prototype defines a new service scope loader
	
prototypes.ServiceScopeInterface = Make({

	talk : function(name, data){
		var scope= scopes.get(this);
		
		if(name != 'init' && !scope.isReady){
			return new $$.Promise(function(success){
				scope.messageQueue.push({ name : name, data : data, resolve : success });
			});

		}else{
			return new $$.Promise(function(success){
				var id= createUniqueId();
				var listener= function(e){
					if(e.data.id == id){
						scope.thread.removeEventListener('message', listener);
						success(e.data.data);
					}
				};

                scope.thread.addEventListener('message', listener, false);
				scope.thread.postMessage({ name : name, id : id, data : data });
			});
		}
	},

	listen : function(name, callback){
		var scope= scopes.get(this);

        scope.addEventListener('message', function(e){
        	if(e.data.name == name){
            	var id= e.data.id;
                var setAnswer= function(data){
                	scope.postMessage({ id : id, data : data });
				};
				callback(e.data.data, setAnswer);
			}
		}, false);
	},

	main : function(source){
		var scope= scopes.get(this);
		
		scope.thread= new $$.ServiceWorker(Engine.shared.serviceLoader+'?'+scope.name);

        if(typeof source == "function"){
			source= '$$.main= ' + source.toString();
            source= new $$.Blob([source], { type : 'text/javascript' });
			source= $$.URL.createObjectURL(source);
		}

        scope.thread.talk('init', source).then(function(){
			scope.isReady= true;
			scope.messageQueue.forEach(function(item){
				scope.thread.talk(item.name, item.data).then(function(data){
					item.resolve(data);
				});
			});

            scope.messageQueue = null;
//			source= $$.URL.revokeObjectURL(source);
		});
	}
}, prototypes.Interface).get();

// this prototype defines a new scope worker
prototypes.ScopeWorker = {
    scope : null,
    thread : null,
    progressListeners : null,
    promise : null,
	
    _make : function(f, scope){
        var self= this;

        this.scope= scope;
        this.thread= new $$.Worker(Engine.shared.threadLoader);
        this.thread.postMessage({ name : 'init', func : f });
        this.progressListeners= [];

        this.promise= new $$.Promise(function(done){
            self.thread.addEventListener('message', function(e){
                if(e.data.name == 'af-worker-done')
                    done(e.data.data);
            }, false);
        });

        this.thread.addEventListener('message', function(e){
            if(e.data.name == 'af-worker-progress')
                self.progressListners.forEach(function(item){
                    item(e.data.data);
                });
        }, false);
    }
};

// this prototype defines a new scope worker interface
	
prototypes.ScopeWorkerInterface = Make({
	then : function(f){
		return scopes.get(this).promise.then(f);
	},

	onprogress : function(f){
		scopes.get(this).progressListeners.push(f);
	}
}, prototypes.Interface).get();

// Functions

// this function creates a new unique id
var createUniqueId= function(){
	var time = Date.now();
	while (time == Date.now()){}
	return Date.now();
};
	
var objectReplace= function(update){
    
    $$.Object.keys(update).forEach(item => {
		if(typeof update[item] == 'object' && !$$.Array.isArray(update[item]) && update[item] !== null)
			objectReplace.apply(this[item], [update[item]]);
		else
			this[item]= update[item];
	});
};

var cloneObject= function(object){
	return JSON.parse(JSON.stringify(object));
};

var userAgentParser= function(userAgentString){
	var items= [];
	var current= '';
	var enabled= true;
	var version= '';
	var engines= ['Gecko', 'AppleWebKit', 'Firefox', 'Safari', 'Chrome', 'OPR', 'Trident'];
	var found= [];
	var record= {};

	for(var i= 0; i < userAgentString.length; i++){
		if(userAgentString[i] == ' ' && enabled){
			items.push(current);
			current= '';
		}else if(userAgentString[i] == '('){
			enabled= false;
		}else if(userAgentString[i] == ')'){
			enabled= true;
		}else{
			current+= userAgentString[i];
		}
	}
	items.push(current);

	items.forEach(function(item){
		if(item.indexOf(';') > -1){
			record.platform= item;
		}else if(item.indexOf('/') > -1){
			item= item.split('/');
			if(item[0] == 'Version'){
				version= item[1];
			}else{
				item.push(engines.indexOf(item[0]));
				found.push(item);
			}
		}
	});

	if(found.length == 1){
		record.engine= found[0][0];
		record.engineVersion= found[0][1];
	}else if(found.length > 1){
		found.sort(function(a, b){
			if(a[2] < b[2])
				return 0;
			else
				return 1;
		});
		record.engine= found[found.length-1][0];
		record.engineVersion= found[found.length-1][1];
	}else{
		record.engine= 'unknown';
		record.engineVersion= '1';
	}

	record.arch= 'x32';

	record.platform.substring(1, record.platform.length-2).split('; ').forEach(function(item){
		if(item.indexOf('OS X') > -1){
			record.platform= item;
			record.arch= 'x64';
		}else if(item.indexOf('Windows') > -1){
			record.platform= item;
		}else if(item.indexOf('Linux') > -1){
			record.platform= item;
		}else if(item.indexOf('WOW64') > -1 || item.indexOf('Win64') > -1 || item.indexOf('x64') > -1){
			record.arch= 'x64';
		}else if(item.indexOf('/') > -1){
			if(engines.indexOf(item.split('/')[0]) > -1){
				record.engine= item.split('/')[0];
				record.engineVersion= item.split('/')[1];
			}
		}else if(item.indexOf(':') < 0){
            record.platform = item;
        }
	});

	if(version !== ''){
		record.engineVersion= version;
	}

	return record;
};

// Engine
//the engine hash, holds private flags, arrays and functions.
var Engine = {
	shared : {
		serviceLoader : '',
		renderModes : ['default'],
		features : {
			chromeLevel : ($$.location.protocol == 'chrome:' || $$.location.protocol == 'resource:'),
//			storrage : !Engine.features.chromeLevel && (function(){try{ return $$.sessionStorage && $$.localStorage; }catch(e){ return false; }})(),
//			indexedDB : !Engine.features.chromeLevel && (function(){try{ return $$.indexedDB; }catch(e){ return false; }})(),
        	notifications : ($$.Notification) || false,
        	renderFrame : ($$.requestAnimationFrame) || false,
        	audio : ($$.Audio) || false,
        	indexOf : ($$.Array.indexOf) || false,
        	forEach : ($$.Array.forEach) || false,
        	geolocation : ($$.navigator.geolocation) || false,
        	appCache : ($$.applicationCache) || false,
        	xcom : ($$.postMessage) || false,
        	blobs : ($$.Blob) || false,
        	clipBoard : ($$.ClipboardEvent) || false,
        	file : ($$.File) || false,
        	fileReader : ($$.FileReader) || false,
        	hashchange : (typeof $$.onhashchange != "undefined") || false,
        	json : ($$.JSON) || false,
        	matchMedia : ($$.matchMedia) || false,
        	timing : ($$.PerformanceTiming) || false,
        	pageVisibility : ((typeof $$.document.hidden != "undefined") && $$.document.visibilityState),
        	serverSentEvent : ($$.EventSource) || false,
        	webWorker : ($$.Worker) || false,
			sharedWebWorker : ($$.SharedWorker) || false,
        	arrayBuffer : ($$.ArrayBuffer)|| false,
        	webSocket : ($$.WebSocket) || false,
        	computedStyle : ($$.getComputedStyle) || false,
        	deviceOrientation : ($$.DeviceOrientationEvent) || false,
        	spread : (function(){try{ return eval("var x; x= [1, 2, 3], (function(x, y, z){})(...x), true;"); }catch(e){ return false; }})()
		},
        moduleTypes : {
            EXTENSION : 'extension'
        }
	},
	itemLibrary : {
		addon : (function(){
			var self= {};

			self.talk= function(type, message){
				if($$ != $$.self){
					return new $$.Promise(function(okay){
						var id= createUniqueId();
						var ready= function(e){
							$$.self.port.removeListener(ready);
							okay(e);
						};
						$$.console.log(id);
						$$.self.port.on(id, ready, false);
						$$.self.port.emit(type, { id : id, message : message });
					});
				}else{
					$$.console.error('Not available in this context!!');
				}
			};

			self.listen= function(type, callback){
				if($$ != $$.self){
					$$.self.port.on(type, function(e){
						var id= e.id;
							callback(e.message, function(message){
								$$.self.port.emit(id, message); 
							});
                		});
				}else{
					$$.console.error('Not available in this context!!');
				}
			};

			if($$ != $$.self)
				return self;
			else
				return null;
		})(),

		applications : {
			'new' : function(name){
				Engine.pushScope(Make(prototypes.ApplicationScope)(name));
				return {
					name : name
				};
			}
		},

		services : {
			'new' : function(name){
				Engine.pushScope(Make(prototypes.ServiceScope)(name));
			},
			setLoaderModule : function(url){
				Engine.shared.serviceLoader= url;
			}
		},

		wrap : function(source){
			return new Promise(function(done){
				done(source.apply({}));
			});
		},

		system : {
			settings : function(settings){
				objectReplace.apply(Engine.options, [settings]);
			},
			info : function(){
				return cloneObject(Engine.info);
			},
			shared : function(){
				return Engine.shared;
			},
			'import' : function(...modules){
                var { moduleTypes } = Engine.shared;

                Engine.ready= new Promise(function(ready){
					Promise.all(modules.map(m => System.import(m))).then(modules => modules.forEach(m => {
						if('config' in m){
							if(m.config.main){
                                if(m.config.type && m.config.type == moduleTypes.EXTENSION){
                                    m[m.config.main](prototypes, scopes);

                                }else if(!(m.config.main in Engine.itemLibrary)){
									Engine.itemLibrary[m.config.main]= m[m.config.main];

								}else{
									$$.console.warn('an other version of "'+ m.config.main +'" is already loaded!');
								}
							}else{
								$$.console.error('couldn\'t find main in module config!');
							}
						}
					}));
				});
			}
		}
	},
	options : {
		applicationName : '',
		renderMode : 'default',
		override : 'false'
	},
	info : {
		engine : 'unknown',
    	engineVersion : '1',
    	platform : 'unknown',
    	arch : 'x32',
    	type : 'unknown'
	},
	scopeList : {},
	getLibraryItem : function(name){
		if(typeof name == 'string'){
			return Engine.itemLibrary[name];
		}else{
			return Engine.itemLibrary[name.name];
		}
	},
	pushScope : function(scope){
		if(!this.scopeList[scope.name] && scope.name != "application")
			this.scopeList[scope.name]= scope;
		else
			$$.console.error('a scope with this name does already exist!');
	},
	getScope : function(name){
		if(name == 'application')
			name= Engine.settings.applicationName;
		
		if(Engine.scopeList[name])
			return Engine.scopeList[name].public;
		else
			$$.console.error('scope does not exist!');
	},
	ready : Promise.resolve()
};

// get the current Platform
var platform= null;    

// find out which engine is used
if ($$.navigator){
	Engine.info.type= 'Web';
	objectReplace.apply(Engine.info, [userAgentParser(navigator.userAgent)]);

//  check if touchscreen is supported
    $$.navigator.isTouch= 'ontouchstart' in $$;
    
// check if current platform is the Mozilla Add-on runtime
}else if($$.exports && $$.require && $$.module){
    var system= $$.require('sdk/system');
	objectReplace.apply(Engine.info, [{
		engine : system.name,
		engineVersion : system.version,
		platform : system.platform + ' ' + system.platformVersion,
		type : 'MozillaAddonSDK',
		arch : system.architecture
	}]);

// check if current platform is the Node.js runtime
}else if($$.process && $$.process.versions && $$.process.env && $$.process.pid){
    objectReplace.apply(Engine.info, [{
		engine : $$.process.name,
		engineVersion : $$.process.versions.node,
		platform : $$.process.platform,
		arch : $$.process.arch,
		type : 'Node'
	}]);
}

//  publish APIs
export var $= Engine.getLibraryItem;
export var $_= Engine.getScope;
