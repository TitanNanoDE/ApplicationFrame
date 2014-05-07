//Hash Controller - v0.1 copyright by TitanNano / Jovan Ggerodetti - http://www.titannano.de

'use strict';
    
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
                    $$.console.error('unknown HashEvent type!');
                }
            };
        };
        
        HashEvent.ADD= 0;
        HashEvent.LOST= 1;
        
        $$.addEventListener('hashchange', function(){
            if($$.location.hash == "")
                var hashPath= ('#!/').split('/');
            else
                var hashPath= $$.location.hash.split('/');
            
//          check hash path
            if(hashPath[0] != '#!'){
                $$.console.error('error in your hash path!'); 
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
            if($$.ga){
                var location= $$.location.protocol + '//' + $$.location.hostname + $$.location.pathname + $$.location.search + $$.location.hash;
                $$.ga('send', 'pageview', location);
            }
        });

        this.mount= function(path, enter, exit){
            if(path instanceof Array)
                path.forEach(function(item){
                    engine.hash.actions.push({path : item, enter : enter, exit : exit});
                });
            else
                engine.hash.actions.push({path : path, enter : enter, exit : exit});
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
    }
});