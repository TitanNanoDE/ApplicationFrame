//hash control module for Application Frame - v1.0.0 copyright by TitanNano / Jovan Ggerodetti - http://www.titannano.de
/* global self */
/* global $ */

this.self= this, 'use strict';
    
$('new')({
    name : 'hash',
    constructor : function(engine){
        engine.hash= {
            actions : [],
            path : []
        };
        
//      Classes
        var HashEvent= function(type, path){
            this.type= type;
            this.path= path;
            this.trigger= function(){
                var path= this.path;
                if(this.type == HashEvent.ADD){
                    engine.hash.actions.forEach(function(item){
                        if(item.path == path && item.enter)
                            item.enter();
                    });
                }else if(this.type == HashEvent.LOST){
                    engine.hash.actions.forEach(function(item){
                        if(item.path == path && item.exit)
                            item.exit();
                    });
                }else{
                    self.console.error('unknown HashEvent type!');
                }
            };
        };
        
        HashEvent.ADD= 0;
        HashEvent.LOST= 1;
        
        self.addEventListener('hashchange', function(){
            var hashPath= self.location.hash.split('/');
            
//          check hash path
            if(hashPath[0] != '#!'){
                self.console.error('error in your hash path!'); 
                return false;
            }
            hashPath.shift();
            
//          compare old and new paths
            var events= [];
//          find lost elements
            var difference= false;
            var path= '';
            for(var i= 0; i < engine.hash.path; i++){
                path+= '/' + engine.hash.path[i];
                        
                if(difference)
                    events.push(new HashEvent(HashEvent.LOST, path));
                else if(engine.hash.path[i] == hashPath[i])
                    continue;
                else if(engine.hash.path[i] != hashPath[i]){
                    difference= true;
                    events.push(new HashEvent(HashEvent.LOST, path));
                }
            }
            events.reverse();
//          find new elements
            path= '';
            difference= false;
            for(var i= 0; i < hashPath.length; i++){
                path+= '/' + hashPath[i];
                
                if(difference)
                    events.push(new HashEvent(HashEvent.ADD, path));
                else if(hashPath[i] == engine.hash.path[i])
                    continue;
                else if(hashPath[i] != engine.hash.path[i]){
                    difference= true;
                    events.push(new HashEvent(HashEvent.ADD, path));
                }
            }
            
            events.forEach(function(item){
                item.trigger();
            });
            
            engine.hash.path= hashPath;
            
//          Google Analytics Support (only analytics.js)
            if(self.ga){
                var location= self.location.protocol + '//' + self.location.hostname + self.location.pathname + self.location.search + self.location.hash;
                self.ga('send', 'pageview', location);
            }
        });

        this.mount= function(path, enter, exit){
            return engine.hash.actions.push({path: path, enter : enter, exit: exit});
        };
        
        this.unmount= function(id){
            engine.hash.actions.splice(id, 1);
        };
        
        this.down= function(newElement){
            self.location.hash+= '/' + newElement;
        };
        
        this.up= function(){
            var hash= self.location.hash.split('/');
            hash.shift();
            hash.pop();
            self.location.hash= '!/' + hash.join('/');
        };
        
        this.swichTo= function(path){
            self.location.hash= '!' + path;
        };
    }
});