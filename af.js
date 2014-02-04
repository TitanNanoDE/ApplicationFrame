//Application Frame v1.0.0 - copyright by TitanNano / Jovan Ggerodetti - http://www.titannano.de

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
	crashPage : 'about:blank'
	};	
	
// Classes
// this class defines a new application scope
var ApplicationScope= function(name){
	var thisScope= this;
	this.name= name;
	this.type= 'application';
	this.settings= {
		allowSetters : true,
		allowGettes : true,
		lockOverride : false,
		autoLock : true
        };
	this.properties=  { 
        addSetterListener : function(key, callback){
			thisScope.setterListeners.push({key : key, callback : callback});
			},
        wait : function(key, callback){
            thisScope.waitList.push({key : key, callback : callback});
            },
		dom : function(selector){
			return {
				setProperty : function(name, value){
					engine.domUpdates.push({selector : selector, type : 'property', name : name, value : value});
					},
				setCSS : function(name, value){
					engine.domUpdates.push({selector : selector, type : 'style', name : name, value : value});
					}
				};
            }
        };
	this.thread= null;
	this.worker= null;
	this.setterListeners= [];
    this.waitList= [];
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
        modules : []
        };
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
				if(scopes.length < 1) engine.mainApplication= name;
				scopes.push(new ApplicationScope(name));
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
        if(settings.construct){
            object= new settings.construct(engine);
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
            }else
                throw 'The launch queue only accepts launch objects!';
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
            }
        },
    escape : {
        wrapper : function(sub){
            if(sub())
                return true;
            else
                return false;
            },
        shell : function(sub){
        
            },
        scopeLoop : function(sub){
        
            }
        },
	};
    
//selects a item of the items hash.
var selector= function(name){
	if(items[name])
		return items[name];
	else
		throw 'unknown selector!!';
	};

var handleEvents= function(scope, key){
    scope.setterListeners.forEach(function(item){
        if(item.key == key)
        item.callback(scope.properties[key]);
        });
    scope.waitList.forEach(function(item, i){
        if(item.key == key){
            item.callback(scope.properties[key]);
            scope.waitList.splice(i, 1);
            }
        });
    };

//the scope selector selects an application or service from the scopes array.
var scopeSelector = function(name){
	var prepare= function(item){
		if(item.name == name){
//          return a application scope
            if(item.type == 'application'){
                var scope= item;
                var x= function(thread){
                    scope.thread= (settings.preProcessing) ? preProcesse(thread) : thread;
                    if(scope.settings.autoLock) scope.settings.isLocked= true;
                    engine.threadQueue.push(scope);
                    };
                x.get= function(name){
                    if(scope.settings.allowGetters && scope.properties[name]) return scope.properties[name];
                    handleEvents(scope, name);
                    };
                x.set= function(name, value){
                    if(scope.settings.allowSetter && scope.properties[name]){
                        scope.properties[name]= value;
                        handleEvents(scope, name);
                        return true;
                    }else{
                        return false;
                        }
                    };
                x.override= scope.override;
//          return a addon scope (at the moment only mozilla)
            }else if(item.type == 'addon'){
                var scope= item;
                return {
                    create : function(thread){
                        scope.thread= thread;
                        engine.threadQueue.push(scope);
                        },
                    'module' : function(){
                        
                        }
                    };
                }
            return x;
			}
		};
//  special handling for the application key
	if(name == 'application'){
        name= engine.mainApplication.name;
		return prepare(engine.mainApplication);
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
				}
			};
//  default handling for all other keys
	}else{
		for (var i=0; i < scopes.length; i++){
			return prepare(scopes[i]);
			}
		}
	};

//preprocesses source from any function.
var preProcesse= function(func){
	func= func.toString();
	func= func.substring(func.indexOf('{')+1, func.lastIndexOf('}'));
	
	return new Function(func);
	};
	
// engine
//the engine hash, holds private flags, arrays and functions.
var engine = {
	isApplicationLimit : false,
	mainApplication : null,
	engine : self.navigator.userAgent.match(/(?!^)[A-Z][A-Za-z]*\/[0-9\.]*/g)[0].split('/'),
	activeThreads : 0,
	domUpdates : [],
	threadQueue : {
		queue : [],
		push : function(scope){
			if(!this.isRunning){
				this.isRunning= false;
				if(settings.renderMode == 'default'){
					scope.thread.apply(scope.properties, [scope]);
					}
				
				this.isRunning= false;
				if(this.queue.length > 0){
					var n= this.queue[0]; this.queue.shift();
					this.push(n);
					}
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
    
// check if current platform is a common JavaScript engine
var platform= null;    

if(self.navigator)
    platform= self.navigator.userAgent || 'notDefault';
else
    platform= 'notDefault';

// find out wich engine is used
if (platform != 'notDefault'){
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
}else if(self.require && self.exports && self.Components){
    var system= self.require('sdk/system');
    platform= [system.name, system.version, 'MozillaAddonSDK'];
    }

// various platform tests for the different platforms

/* 
Tests for Web platforms.
If any test fails Application Frame will quit but at the moment only a notification in the console will be shown
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
        deviceOrientation : (self.DeviceOrientationEvent)
    };
    
// Tests for the Mozilla Add-on SDK
}else if(platform[2] == 'MozillaAddonSDK'){
//  at the moment there are no known platform tests for the 'Mozilla Add-on SDK' platform.
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
//  at the moment nothing to do here.
}else if(platform[2] == 'MozillaAddonSDK'){
//  create new Addon Scope
    scopes.push(new MozillaAddonScope());
    self.require('af/addonCore.js'); // <--- does not exist yet. Not sure if it is really needed
    }
    
// publish APIs
self.$= selector;
self.$_= scopeSelector;
})();