//Hash Controller - v0.1 copyright by TitanNano / Jovan Ggerodetti - http://www.titannano.de

'use strict';
    
$('new')({
    name : 'hash',
    constructor : function(engine){
        engine.hash= {
            actions : [],
            path : [],
            overrides : {}
        };
        
//      Classes
        var HashEvent= function(type, path, fullPath){
            this.type= type;
            this.path= path;
            this.fullPath= fullPath;
            this.trigger= function(count){
                var path= this.path;
                var fullPath= this.fullPath;
                if(this.type == HashEvent.ADD){
                    engine.hash.actions.forEach(function(item){
                        if(item.path == path && item.enter && (!item.persistent || !item.active)){
                            item.enter(fullPath);
                            if(item.persistent) item.active= true;
                        }
                    });
                }else if(this.type == HashEvent.LOST){
                    engine.hash.actions.forEach(function(item){
                        if(item.path == path && item.exit){
                            if(!item.persistent || count == 1){
                               item.exit(fullPath);
                               if(item.persistent){
                                  var old= path.split('/');
                                  old.pop();
                                  delete engine.hash.overrides[old.join('/')];
                                  item.active= false;
                               }
                            }else{
                               var old= path.split('/');
                               old.pop();
                               engine.hash.overrides[old.join('/')]= path;
                            }
                        }
                    });
                }else{
                    $$.console.error('unknown HashEvent type!');
                }
            };
        };
        
        HashEvent.ADD= 0;
        HashEvent.LOST= 1;
        
        $$.addEventListener('hashchange', function(){
            if($$.location.hash === "")
                var hashPath= ('#!/').split('/');
            else
                var hashPath= $$.location.hash.split('/');
            
//          check hash path
            if(hashPath[0] != '#!'){
                $$.console.error('error in your hash path!'); 
                return false;
            }
            hashPath.shift();
            
//          save new path
            $$.localStorage.setItem('af.hash.backup', '/'+hashPath.join('/'));
            
//          compare old and new paths
            var events_lost= [];
            var events_add= [];
//          find lost elements
            var difference= false;
            var path= '';
            var fullPath= '/' + engine.hash.path.join('/');
            for(var i= 0; i < engine.hash.path.length; i++){
                path+= '/' + engine.hash.path[i];
                        
                if(difference)
                    events_lost.push(new HashEvent(HashEvent.LOST, path, fullPath));
                else if(engine.hash.path[i] == hashPath[i])
                    continue;
                else if(engine.hash.path[i] != hashPath[i]){
                    difference= true;
                    events_lost.push(new HashEvent(HashEvent.LOST, path, fullPath));
                }
            }
            
            events_lost.reverse();
            events_lost.forEach(function(item){
                item.trigger(events_lost.length);
            });
            
//          check for overrides
            path= '/' + hashPath.join('/');
            if(engine.hash.overrides[path]){
                $$.location.hash= '#!' + engine.hash.overrides[path];
                return;
            }
            
//          find new elements
            path= '';
            fullPath= '/' + hashPath.join('/');
            difference= false;
            for(var i= 0; i < hashPath.length; i++){
                path+= '/' + hashPath[i];
                
                if(difference)
                    events_add.push(new HashEvent(HashEvent.ADD, path, fullPath));
                else if(hashPath[i] == engine.hash.path[i])
                    continue;
                else if(hashPath[i] != engine.hash.path[i]){
                    difference= true;
                    events_add.push(new HashEvent(HashEvent.ADD, path, fullPath));
                }
            }
            
            events_add.forEach(function(item){
                item.trigger(events_add.length);
            });
            
            engine.hash.path= hashPath;
            
//          Google Analytics Support (only analytics.js)
            if($$.ga){
                var location= $$.location.protocol + '//' + $$.location.hostname + $$.location.pathname + $$.location.search + $$.location.hash;
                $$.ga('send', 'pageview', location);
            }
        });

        this.mount= function(path, enter, exit, persistent){
            if(path instanceof Array)
                path.forEach(function(item){
                    engine.hash.actions.push({path : item, enter : enter, exit : exit, persistent : persistent, active : false });
                });
            else
                engine.hash.actions.push({path : path, enter : enter, exit : exit, persistent : persistent, active : false });
            return true;
        };
        
        this.unmount= function(id){
            engine.hash.actions.splice(id, 1);
        };
        
        this.down= function(newElement){
            $$.location.hash+= '/' + newElement;
        };
        
        this.up= function(){
            var hash= $$.location.hash.split('/');
            hash.shift();
            hash.pop();
            $$.location.hash= '!/' + hash.join('/');
        };
        
        this.swichTo= function(path){
            $$.location.hash= '!' + path;
        };
        
        this.trigger= function(){
            var e= new $$.Event('hashchange');
            $$.dispatchEvent(e);
        };
        
        this.restore= function(){
            var hash= $$.localStorage.getItem('af.hash.backup');
            var hashString= '#!' + $$.localStorage.getItem('af.hash.backup');
            if(hash && hashString != $$.location.hash)
                $$.location.hash= hashString;
            else
                this.trigger();
        };
    }
});