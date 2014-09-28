//Application Frame v0.1.0 - copyright by TitanNano / Jovan Ggerodetti - http://www.titannano.de


if(typeof global != 'undefined')
	global.$$= global;
else if(typeof this != 'undefined')
	this.$$= this;

(function(){
    
'use strict'; 	
	
//Variables
var asiStorage= new $$.WeakMap();
	
// Classes
// this class defines a new application scope
var ApplicationScope= function(name){
	var self= this;
	this.name= name;
	this.type= 'application';
	this.public= new ApplicationScopeInterface(this);
	this.private=  { 
		public : this.public,
		onprogress : function(f){
			self.listeners.push({ type : 'porgress', listener : f });
		}
    };
	this.thread= null;
	this.workers= [];
	this.listeners= [];
};

ApplicationScope.prototype= {
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

// this class defines a new application scope interface
var ApplicationScopeInterface= function(scope){
	asiStorage.set(this, scope);
};
	
ApplicationScopeInterface.prototype= {
	on : function(type, listener){
		var scope= asiStorage.get(this);
		scope.listeners.push({ type : type, listener : listener });
	},
	thread : function(f){
		var scope= asiStorage.get(this);
		scope.workers.push(new ScopeWorker(f));	
	},
	main : function(f){
		var scope= asiStorage.get(this);
		scope.thread= f;
		scope.thread.apply(scope.private);
	},
	terminate : function(type){
		var scope= asiStorage.get(this);
		scope.getListeners('terminate').emit(type);
	}
};
  
// this class defines a new mozilla addon scope
var MozillaAddonScope = function(){
    this.name= "addon";
    this.type= 'addon';
    this.thread= null;
	this.public= new MozillaAddonScopeInterface(this);
};
	
// this	class defines a new mozilla addon scope interface
var MozillaAddonScopeInterface= function(scope){
	asiStorage.set(this, scope);
};
	
MozillaAddonScopeInterface.prototype= {
	create : function(thread){
		var scope= asiStorage.get(this);
		scope.thread= thread;
		engine.threadQueue.push(scope);
	},
	'module' : function(f){
		var scope= asiStorage.get(this);
		f.apply(scope.global.exports);
	},
	modules : function(depsObject){
		var scope= asiStorage.get(this);
		for (var i in depsObject){
			if(!scope.modules[i])
				scope.modules[i]= depsObject[i];
		}
	},
	hook : function(globalObject){
		var scope= asiStorage.get(this);
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

// this class defines a new service scope
var ServiceScope= function(){
	this.thread= null;
	this.private= {};
	this.isReady= false;
	this.messageQueue= [];
	this.public= new ServiceScopeInterface(this);
};
	
// this class defines a new service scope loader
var ServiceScopeInterface= function(scope){
	asiStorage.set(this, scope);
};
	
ServiceScopeInterface.prototype= {
	talk : function(name, data){
		var scope= asiStorage.get(this);
		
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
		var scope= asiStorage.get(this);
    	scope.addEventListener('message', function(e){
        	if(e.data.name == name){
            	var id= e.data.id;
                var setAnswer= function(data){
                	scope.postMessage({ name : id, data : data });
				};
				callback(e.data.data, setAnswer);
			}
		}, false);
	},
	main : function(source){
		var scope= asiStorage.get(this);
		
		scope.thread= new $$.SharedWorker(engine.shared.serviceLoader+'?'+scope.name);
		if(typeof source == "function"){
			var source= '$$.main= ' + source.toString();
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
//			source= $$.URL.revokeObjectURL(source);
		});
	}
};

// this class defines a new scope worker
var ScopeWorker= function(f, scope){
	var self= this;
	
	this.scope= scope;
	this.thread= f;
	this.promise= new $$.Promise(function(done){
		self.thread.addEventListener('message', function(e){
			if(e.data.name == 'af-worker-done')
				done(e.data.data);
		}, false);
	});
	this.progressListeners= [];
	
	this.thread.addEventListener('message', function(e){
		if(e.data.name == 'af-worker-progress')
			self.progressListners.forEach(function(item){
				item(e.data.data);
			});
	}, false);
};

// this class defines a new scope worker interface
var ScopeWorkerInterface= function(scope){
	asiStorage.set(this, scope);
};
	
ScopeWorkerInterface.prototype= {
	then : function(f){
		return asiStorage.get(this).promise.then(f);
	},
	onprogress : function(f){
		asiStorage.get(this).progressListeners.push(f);
	}
};

// Functions
// this function creates a new unique id
var createUniqueId= function(){
	var time = Date.now();
	while (time == Date.now());
	return Date.now();
};
	
// Engine
//the engine hash, holds private flags, arrays and functions.
var engine = {
	shared : {
		serviceLoader : '',
		renderModes : ['default'],
		selectorIndex : {
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
					engine.pushScope(new ApplicationScope(name));
				}
			},
			services : {
				'new' : function(name){
					engine.pushScope(new ServiceScope(name));
				},
				setLoaderModule : function(url){
					engine.shared.serviceLoader= url; 
				}
			},
			escape : {
				wrapper : function(source){
					return source();	
				}
			},
			system : {
				
			}
		}
	},
	options : {
		applicationName : '',
		renderMode : 'default',
		override : 'false'
	},
	info : {
		name : 'unknown',
    	version : '1',
    	platform : 'unknown',
    	arch : 'x32',
    	type : 'Web'
	},
	itemLibrary : {},
	scopeList : {},
	getLibraryItem : function(name){
		return engine.itemLibrary[name];
	},
	pushScope : function(scope){
		if(!this.scopeList[scope.name] && scope.name != "application")
			this.scopeList[scope.name]= scope;
		else
			$$.console.error('a scope with this name does already exist!');
	},
	getScope : function(name){
		if(name == 'application')
			name= engine.settings.applicationName;
		
		if(engine.scopeList[name])
			return engine.scopeList[name];
		else
			$$.console.error('scope does not exist!');
	}
};

// get the current Platform
var platform= null;    

// find out which engine is used
if ($$.navigator && !$$.importScripts){
    platform= $$.navigator.userAgent;
//              Mozilla
    platform=   (((platform.indexOf('Gecko/') > -1) && 'Gecko '+platform.substring(platform.indexOf('rv:')+3, platform.indexOf(')')) ) || false) ||
//              Google / Apple / Opera
                (((platform.indexOf('AppleWebKit') > -1) && platform.substring(platform.indexOf('AppleWebKit'), platform.lastIndexOf('(')-1).replace(/\//, ' ')) || false) ||      
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
                (((platform.indexOf('AppleWebKit') > -1) && platform.substring(platform.indexOf('AppleWebKit'), platform.lastIndexOf('(')-1).replace(/\//, ' ')) || false) ||      
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
    
if(platform[2] == 'Web'){
//  workaround for XUL Runner error while testing the storage and indexedDB features. They are both not avaiable, so the whole app runs in to an error while testing.
    var isNotChromeURL= ($$.location.protocol != 'chrome:' && $$.location.protocol != 'resource:');
    
    var platformTests= {
        storrage : isNotChromeURL && (function(){try{ return $$.sessionStorage && $$.localStorage; }catch(e){ return false; }})(),
        indexedDB : isNotChromeURL && (function(){try{ return $$.indexedDB; }catch(e){ return false; }})(),
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
    var platformTests= {};
    
// Tests for the Mozilla Add-on SDK
}else if(platform[2] == 'MozillaAddonSDK'){
//  at the moment there are no known platform tests for the 'Mozilla Add-on SDK' platform.
    var platformTests= {};

// Tests for the Node.js runtime or something like that
}else if(platform[2] == 'Node'){
//  at the moment there are no known platform tests for the 'Node' platform.
    var platformTests= {};
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
    $$.$= engine.getLibraryItem;
    $$.$_= engine.getScope;
    
}else if(platform[2] == 'MozillaAddonSDK'){
//  create new Addon Scope
    engine.pushScope(new MozillaAddonScope());
    engine.name= platform[0];
    engine.version= platform[1];
    engine.platform= platform[2];
    engine.type= 'MozAddon';
//    $$.require('af/addonCore.js'); // <--- does not exist yet. Not sure if it is really needed
    
//  publish APIs
    $$.exports.$= engine.getLibraryItem;
    $$.exports.$_= engine.getScope;
    
}else if(platform[2] == 'Node'){
    engine.name= platform[0];
    engine.version= platform[1];
    engine.platform= $$.process.platform;
    engine.arch= $$.process.arch;
    engine.type= 'Node';

//  publish APIs
    $$.$= engine.getLibraryItem;
    $$.$_= engine.getScope;
}
    
})();