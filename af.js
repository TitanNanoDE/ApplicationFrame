//Application Frame v0.1.0 - copyright by TitanNano / Jovan Ggerodetti - http://www.titannano.de


if(typeof global != 'undefined')
	global.$$= global;
else if(typeof this != 'undefined')
	this.$$= this;

(function(){
    
'use strict'; 
  
//default settings for the Application Frame Engine
var settings= {
    coreLock : false,
    masterApplication : null,
	renderMode : 'default',
	preProcessing : false,
    singleApplicationMode : false,
	support : true,
	crashPage : 'about:blank',
    grantRoot : false
};	
	
// Classes
// this class defines a new application scope
var ApplicationScope= function(name){
	var thisScope= this;
	this.name= name;
	this.type= 'application';
	this.settings= {
		allowSetters : true,
		allowGetters : true,
		lockOverride : false,
		autoLock : true
    };
	this.properties=  { 
        addSetterListener : function(key, callback){
			thisScope.setterListeners.push({key : key, callback : callback});
        },
        modules : new Catalog()
    };
    this.modules= [];
	this.thread= null;
	this.worker= null;
	this.setterListeners= [];
    this.override= function(newSettings){
        if(!thisScope.settings.lockOverride){
            for(var i in newSettings)
                if(thisScope.settings[i]) thisScope.settings[i]= newSettings[i];
            if(!newSettings.hasOwnProperty('lockOverride') && thisScope.settings.autoLock) thisScope.settings.lockOverride= true;
        }
    };
};
    
var MozillaAddonScope = function(){
    var thisScope= this;
    this.name= "addon";
    this.type= 'addon';
    this.settings= {
        sdkPrefix : false,
        contentPrefixChar : '*',
        contentPrefix : false,
        fastExport : true
    };
    this.defaultProperties= {};
    this.modules= {};
    this.global= null;
    this.thread= null;
    this.override= function(newSettings){
        for(var i in newSettings)
            if(thisScope.settings[i]) thisScope.settings[i]= newSettings[i];
    };
};
    
var ServiceScopeLocal= function(){
    var thisScope= this;
    this.name= 'serviceLocal';
    this.type= 'service';
    this.settings= {
        allowSubWorkers : true,
        lockOverride : false
    };
    this.properties= {
        listen : function(name, callback){
            $$.addEventListener('message', function(e){
                if(e.data.name == name){
                    var id= e.data.id;
                    var setAnswer= function(data){
                        $$.postMessage({ name : id, data : data });
                    };
                    callback(e.data.data, setAnswer);
                }
            }, false);
        },
		talk : function(name, data){
			return new $$.Promise(function(success){
				var id= createUniqueId();
				var listener= function(e){
					if(e.data.name == id){
						$$.removeEventListener('message', listener);
						success(e.data.data);
					}
				};
				$$.addEventListener('message', listener, false);
				$$.postMessage({ name : name, id : id, data : data });
			});
		}
    };
    this.thread= null;
    this.override= function(newSettings){
        if(!thisScope.settings.lockOverride){
            for(var i in newSettings)
                if(this.settings[i] && !this.settings.lockOverride) thisScope.settings[i]= newSettings[i];
        }
    };
};
    
var ServiceScopeRemote= function(name){
    this.name= name;
    this.type= 'serviceRemote';
    this.thread= null;
    this.isReady= false;
	this.messageQueue= [];
};
    
var Catalog= function(){
    this._listeners= [];
};

Catalog.prototype.on= function(event, listener){
    var self= this;
    return new $$.Promise(function(success){
        self._listeners.push({ event : event, listener : listener, success : success });
    });
};
    
Catalog.prototype.add= function(key, value){
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
};
    
var scopes= [];

//all selectable items for the $ selector.
var items= {
	application : {
		'new' : function(name){
			var exists= false;
			scopes.forEach(function(item){
				if(item.name == name) exists= true;
				});
				
			if(!exists && !engine.isApplicationLimit){
				scopes.push(new ApplicationScope(name));
                if(scopes.length < 1) engine.mainApplication= scopes[scopes.length-1];
				if(settings.singleApplicationMode) engine.isApplicationLimit= true;
                if(settings.masterApplication == scopes[scopes.length-1].name) 
                    engine.mainApplication= scopes[scopes.length-1];
			}else
                $$.console.log("application or service \""+name+"\" already exists!!");
				
			}
		},
    service : {
        'new' : function(name){
            var exists= false;
            scopes.forEach(function(item){
                if(item.name == name) exists= true;
            });
            
            if(!exists){
                scopes.push(new ServiceScopeRemote(name));
            }else
                $$.console.log("application or service \""+name+"\" already exists!!");
        },
        setEngine : function(src){
            engine.workerEngineSource= src;
        }
    },
    'new' : function(settings){
		engine.deviceReady.then(function(){
			var object = {};
        	if(settings.hasOwnProperty('constructor')){
				object= new settings.constructor(engine);
			}else if(settings.builder && settings.nameSpace){
				engine[settings.nameSpace]= {};
				object= function(){
					return settings.builder(engine[settings.nameSpace], this.arguments);
				};
			}else if(settings.builder){
				object= settings.builder;
			}else{
				object= settings.object;
			}
        
        	if(settings.name && !items[settings.name])
				items[settings.name]= object;
			else
				$$.console.error("No or ilegall name!");
        	if(settings._init){
				if(settings.nameSpace)
					settings._init(engine[settings.nameSpace], settings.object);
            	else
					settings._init(settings.object);
			}
        	if(settings.nameSpace)
            	return engine[settings.nameSpace];
			return null;
		});
	},
    queue : {
        push : function(object){
            var push= function(){
                this.count++;
                if(this.type.length && this.count == this.type.length){
                    this.action();
                    engine.launchQueue.splice(engine.launchQueue.indexOf(this), 1);
                }else if(!this.type.length){
                    this.action();
                    engine.launchQueue.splice(engine.launchQueue.indexOf(this), 1);
                }
            };
            
            if(typeof object == 'object'){
                object.push= push;
                engine.launchQueue.push(object);
                return true;
            }else{
                $$.console.error('The launch queue only accepts launch objects!');
                return false;
            }
        },
        trigger : function(type){
            engine.launchQueue.forEach(function(i){
                if(i.type == type) i.push();
            });
        }
    },
    dom : {
        select : function(query){
            return $$.document.querySelector(query);
        },
        selectAll : function(query){
            return $$.document.querySelectorAll(query);
        },
        append : function(element, target){
            return target.appendChild(element);    
        },
        create : function(elementName){
            return $$.document.createElement(elementName);
        },
        entryPoint : function(entryPoint){
            return {
                select : function(query){
                    return entryPoint.querySelector(query);
                },
                selectAll : function(query){
                    return entryPoint.querySelectorAll(query);
                }
            };
        }
    },
    escape : {
        wrapper : function(sub){
            if(sub())
                return true;
            else
                return false;
        }
    },
    addon : {
        talk : function(type, message){
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
        },
        listen : function(type, callback){
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
        }
    }
};
    
//selects a item of the items hash.
var selector= function(name){
	if(items[name])
		return items[name];
	else
		$$.console.error('unknown selector!!');
        return null;
	};

var handleEvents= function(scope, key){
    scope.setterListeners.forEach(function(item){
        if(item.key == key)
        item.callback(scope.properties[key]);
    });
};
    
var findScope= function(name){
    for(var i=0; i < scopes.length; i++){
        if(scopes[i].name == name)
            return scopes[i];
    }
    return null;
};

var prepareScope= function(item){
    if(item){
//      return a application scope
        var scope= null;
        if(item.type == 'application'){
            scope= item;
            return Object.create(scope.properties, {
                main : {
                    value : function(thread){
                        scope.thread= (settings.preProcessing) ? preProcesse(thread) : thread;
                        if(scope.settings.autoLock) scope.settings.isLocked= true;
                        engine.threadQueue.push(scope);
                    }
                },
				'module' : {
					value : function(name, dependencies, f){
						var request= new $$.Promise(function(success, failure){
							engine.deviceReady.then(function(){
								if(dependencies.length > 0){
									scope.properties.modules.on('available', dependencies).then(function(){
										f(scope.properties, success, failure); 
                                	});
                            	}else{
									f(scope.properties, success, failure);
								}
							});
                        });
                        scope.modules.push(request);
						request.then(function(value){
							scope.properties.modules.add(name, value);
						});
					}
				},
                get : {
                    value : function(name){
                        if(scope.settings.allowGetters && scope.properties[name]){
                            handleEvents(scope, name);
                            return scope.properties[name];
                        }else{
                            return null;
                        }
                    }
                },
                set : {
                    value : function(name, value){
                        if(scope.settings.allowSetters && scope.properties[name]){
                            scope.properties[name]= value;
                            handleEvents(scope, name);
                            return true;
                        }else{
                            return false;
                        }
                    }
                },
                override : {
                    value : scope.override
                }
            });
                
        }else if(item.type == 'addon'){
//          return a addon scope (at the moment only mozilla)
            scope= item;
            return {
                create : function(thread){
                    scope.thread= thread;
                    engine.threadQueue.push(scope);
                },
                'module' : function(f){
                    f.apply(scope.global.exports);
                },
                modules : function(depsObject){
                    for (var i in depsObject){
                        if(!scope.modules[i])
                            scope.modules[i]= depsObject[i];
                    }
                },
                hook : function(globalObject){
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
            };
        }else if(item.type == 'serviceRemote'){
            scope= item;
            return {
                main : function(source){
                    scope.thread= new $$.Worker(engine.workerEngineSource);
					if(typeof source == "function"){
						source= '$$.__main__= ' + source.toString();
                    	source= new $$.Blob([source], { type : 'text/javascript' });
						source= $$.URL.createObjectURL(source);
					}
					var self= this;
                    this.talk('init', source).then(function(){
                        scope.isReady= true;
						scope.messageQueue.forEach(function(item){
							self.talk(item.name, item.data).then(function(data){
								item.resolve(data);
							});
						});
						source= $$.URL.revokeObjectURL(source);
                    });
                },
                talk : function(name, data){
					if(name != 'init' && !scope.isReady){
						return new $$.Promise(function(success){
							scope.messageQueue.push({ name : name, data : data, resolve : success });
						});
					}else{
						return new $$.Promise(function(success){
							var id= createUniqueId();
							var listener= function(e){
								if(e.data.name == id){
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
                    var listener= function(e){
                        if(e.data.name == name){
                            var setAnswer= function(message){
                                scope.thread.postMessage({ name : e.data.id, data : message });
                            };
							callback(e.data.data, setAnswer);
                        }
                    };
                    scope.thread.addEventListener('message', listener, false);
                }
            };
        }else 
            return null;
    }else{
        return null;
    }
};

//the scope selector selects an application or service from the scopes array.
var scopeSelector = function(name){
    
//  special handling for the application key
	if(name == 'application'){
        if(engine.mainApplication){
            name= engine.mainApplication.name;
            return prepareScope(engine.mainApplication);
        }else{
            throw 'Can not access "application"! No main application is set!';
        }
        
//  special handling for the eninge key
	}else if(name == 'engine'){
		return {
			override : function(newSettings){
				if(!settings.coreLock){
						for(var i in newSettings){
                            if(settings[i] !== undefined) settings[i]= newSettings[i];
						}
					}
				},
			stop : function(){
				$$.location.replace(settings.crashPage);
				},
            requestRoot : function(scope){
                if( (engine.type == 'Node') && (scope == engine.mainApplication.properties) ){
                    scope.engine= engine;
                    return true;
                }else{
                    return false;
                    }
                }
			};
    }else if(engine.type == 'MozAddon' && findScope('addon').modules[name]){
        return findScope('addon').modules[name];
	}else{
//      default handling for all other keys
        return prepareScope(findScope(name));
    }
};

//preprocesses source from any function.
var preProcesse= function(func){
	func= func.toString();
	func= func.substring(func.indexOf('{')+1, func.lastIndexOf('}'));
	
	return new Function(func);
	};
	
var createUniqueId= function(){
	var time = Date.now();
	while (time == Date.now());
	return Date.now();
};
	
// Engine
//the engine hash, holds private flags, arrays and functions.
var engine = {
	isApplicationLimit : false,
	mainApplication : null,
	name : 'unknown',
    version : '1',
    platform : 'unknown',
    arch : 'x32',
    type : 'Web',
	activeThreads : 0,
    workerEngineSource : null,
	domUpdates : [],
	threadQueue : {
		queue : [],
		push : function(scope){
			if(!this.isRunning){
				this.isRunning= true;
				engine.deviceReady.then(function(){
					if(settings.renderMode == 'default'){
						if(scope.modules.length > 0){
							$$.Promise.all(scope.modules).then(function(){
								scope.thread.apply(scope.properties, [scope]);
							});
						}else{
							scope.thread.apply(scope.properties, [scope]);
						}
					}
				
					if(this.queue.length > 0){
						var n= this.queue[0]; this.queue.shift();
						this.push(n);
					}
				}.bind(this));
				this.isRunning= false;
			}else{
				this.queue.push(scope);
            }
        },
		isRunning : false 
    },
	lastAddonComId : 0,
    pushListeners : [],
    launchQueue : [],
	deviceReady : new Promise(function(ready){
		if($$.cordova){
			$$.document.addEventListener('deviceready', ready, false);
		}else{
			ready();
		}
	}),
    exit : function(){}
	};

// get the current Platform
var platform= null;    

// find out which engine is used
if ($$.navigator && !$$.importScripts){
    platform= $$.navigator.userAgent;
//              Mozilla
    platform=   (((platform.indexOf('Gecko/') > -1) && 'Gecko '+platform.substring(platform.indexOf('rv:')+3, platform.indexOf(')')) ) || false) ||
//              Google / Apple / Opera
                (((platform.indexOf('AppleWebKit') > -1) && (platform= platform.substring(platform.indexOf('AppleWebKit'))) && platform.substring(0, platform.indexOf('(')-1).replace(/\//, ' ')) || false) ||      
//              Microsoft
                (((platform.indexOf('Trident/') > -1) && platform.substring(platform.indexOf('Trident/'), platform.indexOf(';', platform.indexOf('Trident/'))).replace(/\//, ' ')) || false) ||
//              Unknown
                'unknown platform';
    platform= platform.split(' ');
    platform.push('Web');

// check if we are in a Worker
}else if($$.navigator && $$.importScripts){
    platform= $$.navigator.userAgent;
//              Mozilla
    platform=   (((platform.indexOf('Gecko/') > -1) && 'Gecko '+platform.substring(platform.indexOf('rv:')+3, platform.indexOf(')')) ) || false) ||
//              Google / Apple / Opera
                (((platform.indexOf('AppleWebKit') > -1) && (platform= platform.substring(platform.indexOf('AppleWebKit'))) && platform.substring(0, platform.indexOf('(')-1).replace(/\//, ' ')) || false) ||      
//              Microsoft
                (((platform.indexOf('Trident/') > -1) && platform.substring(platform.indexOf('Trident/'), platform.indexOf(';', platform.indexOf('Trident/'))).replace(/\//, ' ')) || false) ||
//              Unknown
                'unknown platform';
    platform= platform.split(' ');
    platform.push('Worker');
    
// check if current platform is the Mozilla Add-on runtime
}else if($$.exports && $$.require && $$.module){
    var system= $$.require('sdk/system');
    platform= [system.name, system.version, 'MozillaAddonSDK'];

// check if current platform is the Node.js runtime
}else if($$.process && $$.process.versions && $$.process.env && $$.process.pid){
    platform= ['Node.js', $$.process.versions.node, 'Node'];
    }
    
//  set platform type
engine.type= platform[2];

// various platform tests for the different platforms

/* 
Tests for Web platforms.
If any test fails Application Frame will quit but at the moment only a notification in the console will be shown.
*/
    
var platformTests= null;
    
if(platform[2] == 'Web'){
//  workaround for XUL Runner error while testing the storage and indexedDB features. They are both not avaiable, so the whole app runs in to an error while testing.
    var isNotChromeURL= ($$.location.protocol != 'chrome:' && $$.location.protocol != 'resource:');
    
    platformTests= {
        storrage : isNotChromeURL && (function(){try{ return $$.sessionStorage && $$.localStorage; }catch(e){ return false; }})(),
        notifications : ($$.Notification),
        renderFrame : ($$.requestAnimationFrame),
        audio : ($$.Audio),
        indexOf : ($$.Array.indexOf),
        forEach : ($$.Array.forEach),
        geolocation : ($$.navigator.geolocation),
        appCache : ($$.applicationCache),
        xcom : ($$.postMessage),
        blobs : ($$.Blob),
        clipBoard : ($$.ClipboardEvent),
        file : ($$.File),
        fileReader : ($$.FileReader),
        hashchange : (typeof $$.onhashchange != "undefined"),
        json : ($$.JSON),
        matchMedia : ($$.matchMedia),
        timing : ($$.PerformanceTiming),
        pageVisibility : ((typeof $$.document.hidden != "undefined") && $$.document.visibilityState),
        serverSentEvent : ($$.EventSource),
        webWorker : ($$.Worker),
//        sharedWebWorker : ($$.SharedWorker), <--- disabled because it isn't really supported in any web engine 
        arrayBuffer : ($$.ArrayBuffer),
        webSocket : ($$.WebSocket),
        computedStyle : ($$.getComputedStyle),
        deviceOrientation : ($$.DeviceOrientationEvent)
//        spread : (function(){try{ return eval("var x; x= [1, 2, 3], (function(x, y, z){})(...x), true;"); }catch(e){ return false; }})()
    };
    
}else if(platform[2] == 'Worker'){
//  at the moment there are no known platform tests for the 'Worker' platform.
    platformTests= {};
    
// Tests for the Mozilla Add-on SDK
}else if(platform[2] == 'MozillaAddonSDK'){
//  at the moment there are no known platform tests for the 'Mozilla Add-on SDK' platform.
    platformTests= {};

// Tests for the Node.js runtime or something like that
}else if(platform[2] == 'Node'){
//  at the moment there are no known platform tests for the 'Node' platform.
    platformTests= {};
    }

//check if any test failed
var faildTests= 0;
var allTests= 0;
for(var i in platformTests){
    allTests++;
    if(!platformTests[i]){
        faildTests++;
        $$.console.log("Test for '"+i+"' faild!!");
        }
}

//if a test failed the engine will quit
if(faildTests > 0){
    $$.console.warn(faildTests+' of '+allTests+' platform tests are faild!');
//    engine.exit(0);
}
    
// setup environment
if(platform[2] == 'Web' || platform[2] == 'Worker'){
//  check if touchscreen is supported
    $$.navigator.isTouch= 'ontouchstart' in $$;
    engine.name= platform[0];
    engine.version= platform[1];
    engine.platform= $$.navigator.userAgent.substring($$.navigator.userAgent.indexOf('(')+1, $$.navigator.userAgent.indexOf(';'));
    engine.arch= $$.navigator.userAgent.substring($$.navigator.userAgent.indexOf(';')+2, $$.navigator.userAgent.indexOf(';', $$.navigator.userAgent.indexOf(';')+1));
    engine.type= 'Web';
    
//  publish APIs
    $$.$= selector;
    $$.$_= scopeSelector;

// worker additions
    if(platform[2] == 'Worker'){
        engine.type= 'Worker';
        var scope= new ServiceScopeLocal();
        scopes.push(scope);
        scope.properties.listen('init', function(source, setAnswert){
			$$.importScripts(source);
            $$.__main__.apply(scope.properties, [setAnswert]);
            $$.console.log('starting worker...');
    	});
    }
    
}else if(platform[2] == 'MozillaAddonSDK'){
//  create new Addon Scope
    scopes.push(new MozillaAddonScope());
    engine.name= platform[0];
    engine.version= platform[1];
    engine.platform= platform[2];
    engine.type= 'MozAddon';
//    $$.require('af/addonCore.js'); // <--- does not exist yet. Not sure if it is really needed
    
//  publish APIs
    $$.exports.$= selector;
    $$.exports.$_= scopeSelector;
    
}else if(platform[2] == 'Node'){
    engine.name= platform[0];
    engine.version= platform[1];
    engine.platform= $$.process.platform;
    engine.arch= $$.process.arch;
    engine.type= 'Node';

//  publish APIs
    $$.$= selector;
    $$.$_= scopeSelector;
}
    
})();
