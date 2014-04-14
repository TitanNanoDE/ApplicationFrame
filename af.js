//Application Frame v0.1.0 - copyright by TitanNano / Jovan Ggerodetti - http://www.titannano.de

(function(){
    
this.self= this, "use strict"; 
  
//default settings for the Application Frame Engine
var settings= {
//  the coreLock option locks the settings and prevents from overwriteing
//  the coreLock is disabled for default	
    coreLock : false,
//  the masterApplication option defines the name of the app which should get master privileges.
//  for default no app name is set.	
    masterApplication : null,
//  the render mode defines how to handle the different tasks. 
//  default means all apps and services running in the main thread.
	renderMode : 'default',
//  turn on preprocessing, to use Application Frame specific syntax.
	preProcessing : false,
//  if turned on, only one application can be runned at once.	
    singleApplicationMode : false,
//  when enabled the engine checks if the runtime environment supports all required APIs.
//  If any dependencies couldn't be found, the user will be forwarded to crashPage.
	support : true,
//  defines the page to which the engine forwards, if there is a unsolved dependency.
	crashPage : 'about:blank',
// gives the main application the possibility to access the engine object (only available in node)
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
			}
        };
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
    this.defaultProperties= {
        };
    this.modules= {};
    this.global= null;
    this.thread= null;
    this.override= function(newSettings){
        for(var i in newSettings)
            if(thisScope.settings[i]) thisScope.settings[i]= newSettings[i];
        };
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
			}else{
				throw "application \""+name+"\" already exists!!";
				}
			}
		},
    'new' : function(settings){
        var object = {};
        if(settings.constructor){
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
            self.console.error("No or ilegall name!");
        if(settings._init){
            if(settings.nameSpace)
                settings._init(engine[settings.nameSpace], settings.object);
            else
                settings._init(settings.object);
            }
        if(settings.nameSpace)
            return engine[settings.nameSpace];
        return null;
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
            }else self.console.error('The launch queue only accepts launch objects!');
        },
        trigger : function(type){
            engine.launchQueue.forEach(function(i){
                if(i.type == type) i.push();
            });
        }
    },
    dom : {
        select : function(query){
            return self.document.querySelector(query);
        },
        selectAll : function(query){
            return self.document.querySelectorAll(query);
        },
        append : function(element, target){
            target.appendChild(element);    
        },
        create : function(elementName){
            return self.document.createElement(elementName);
        },
        enrtyPoint : function(entryPoint){
            return {
                select : function(query){
                    entryPoint.querySelector(query);
                },
                selectAll : function(query){
                    entryPoint.querySelectorAll(query);
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
};
    
//selects a item of the items hash.
var selector= function(name){
	if(items[name])
		return items[name];
	else
		self.console.error('unknown selector!!');
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
        else
            return null;
    }
};

var prepareScope= function(item){
    if(item){
//      return a application scope
        if(item.type == 'application'){
            var scope= item;
            return {
                thread : function(thread){
                    scope.thread= (settings.preProcessing) ? preProcesse(thread) : thread;
                    if(scope.settings.autoLock) scope.settings.isLocked= true;
                    engine.threadQueue.push(scope);
                },
                get : function(name){
                    if(scope.settings.allowGetters && scope.properties[name]){
                        handleEvents(scope, name);
                        return scope.properties[name];
                    }else{
                        return null;
                    }
                },
                set : function(name, value){
                    if(scope.settings.allowSetters && scope.properties[name]){
                        scope.properties[name]= value;
                        handleEvents(scope, name);
                        return true;
                    }else{
                        return false;
                    }
                },
                override : scope.override
            };
                
        }else if(item.type == 'addon'){
//          return a addon scope (at the moment only mozilla)
            var scope= item;
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
                dataURL : function(name){
                    return self.require('sdk/self').data.url(name);
                }
            };
        }
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
            throw 'Can not access "application"! No main application was set!';
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
				self.location.replace(settings.crashPage);
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
    }else if(engine.type == 'MozillaAddonSDK' && findScope('addon').modules[name]){
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
	domUpdates : [],
	threadQueue : {
		queue : [],
		push : function(scope){
			if(!this.isRunning){
				this.isRunning= true;
				if(settings.renderMode == 'default'){
					scope.thread.apply(scope.properties, [scope]);
					}
				
				if(this.queue.length > 0){
					var n= this.queue[0]; this.queue.shift();
					this.push(n);
				}
				this.isRunning= false;
			}else{
				this.queue.push(scope);
            }
        },
		isRunning : false 
		},
    launchQueue : [],
    exit : function(){}
	};

// get the current Platform
var platform= null;    

// find out which engine is used
if (self.navigator){
    platform= self.navigator.userAgent;
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

// check if current platform is the Mozilla Add-on runtime
}else if(self.exports && self.require && self.module){
    var system= self.require('sdk/system');
    platform= [system.name, system.version, 'MozillaAddonSDK'];

// check if current platform is the Node.js runtime
}else if(self.process && self.process.versions && self.process.env && self.process.pid){
    platform= ['Node.js', self.process.versions.node, 'Node'];
    }
    
//  set platform type
engine.type= platform[2];

// various platform tests for the different platforms

/* 
Tests for Web platforms.
If any test fails Application Frame will quit but at the moment only a notification in the console will be shown.
*/
if(platform[2] == 'Web'){
    var platformTests= {
        storrage : (self.sessionStorage && self.localStorage),
        indexedDB : (self.indexedDB),
        notifications : (self.Notification),
        renderFrame : (self.requestAnimationFrame),
        audio : (self.Audio),
        indexOf : (self.Array.indexOf),
        forEach : (self.Array.forEach),
        geolocation : (self.navigator.geolocation),
        appCache : (self.applicationCache),
        xcom : (self.postMessage),
        blobs : (self.Blob),
        clipBoard : (self.ClipboardEvent),
        file : (self.File),
        fileReader : (self.FileReader),
        hashchange : (typeof self.onhashchange != "undefined"),
        json : (self.JSON),
        matchMedia : (self.matchMedia),
        timing : (self.PerformanceTiming),
        pageVisibility : ((typeof self.document.hidden != "undefined") && self.document.visibilityState),
        serverSentEvent : (self.EventSource),
        webWorker : (self.Worker),
//        sharedWebWorker : (self.SharedWorker), <--- disabled because it isn't really supported in any web engine 
        arrayBuffer : (self.ArrayBuffer),
        webSocket : (self.WebSocket),
        computedStyle : (self.getComputedStyle),
        deviceOrientation : (self.DeviceOrientationEvent),
//        spread : (function(){try{ return eval("var x; x= [1, 2, 3], (function(x, y, z){})(...x), true;"); }catch(e){ return false; }})()
    };
    
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
        self.console.log("Test for '"+i+"' faild!!");
        }
}

//if a test failed the engine will quit
if(faildTests > 0){
    self.console.log(faildTests+' of '+allTests+' platform tests are faild!');
//    engine.exit(0);
}
    
// setup environment
if(platform[2] == 'Web'){
//  check if touchscreen is supported
    self.navigator.isTouch= 'ontouchstart' in self;
    engine.name= platform[0];
    engine.version= platform[1];
    engine.platform= self.navigator.userAgent.substring(self.navigator.userAgent.indexOf('(')+1, self.navigator.userAgent.indexOf(';'));
    engine.arch= self.navigator.userAgent.substring(self.navigator.userAgent.indexOf(';')+2, self.navigator.userAgent.indexOf(';', self.navigator.userAgent.indexOf(';')+1));

//  publish APIs
    self.$= selector;
    self.$_= scopeSelector;
    
}else if(platform[2] == 'MozillaAddonSDK'){
//  create new Addon Scope
    scopes.push(new MozillaAddonScope());
    engine.name= platform[0];
    engine.version= platform[1];
    engine.platform= platform[2];
//    self.require('af/addonCore.js'); // <--- does not exist yet. Not sure if it is really needed
    
//  publish APIs
    self.exports.$= selector;
    self.exports.$_= scopeSelector;
    
}else if(platform[2] == 'Node'){
    engine.name= platform[0];
    engine.version= platform[1];
    engine.platform= self.process.platform;
    engine.arch= self.process.arch;

//  publish APIs
    self.$= selector;
    self.$_= scopeSelector;
}
    
})();