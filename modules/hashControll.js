//hash control module for Application Frame - v1.0.0 copyright by TitanNano / Jovan Ggerodetti - http://www.titannano.de
/* global self */
/* global $ */

this.self= this, 'use strict';
    
$('new')({
    name : 'hash',
    construct : function(engine){
        engine.hash= {
            actions : [],
            cleanUps : [],
            items : []
        };
        self.addEventListener('hashchange', function(){
            var hash= self.location.hash.split('&');
            for(var i= 0; i < hash.length; i++){
                if(engine.hash.items.indexOf(hash[i]) < 0){
                    engine.hash.actions.forEach(function(item){
                        if(item.type instanceof Array)
                            if(item.type.indexOf(hash[i]) > -1) item.action();
                        else    
                            if(item.type == hash[i]) item.action();
                        });
                    }
                }
            engine.hash.items.forEach(function(item){
                if(hash.indexOf(item) < 0){
                    engine.hash.cleanUps.forEach(function(item){
                        if(item.type instanceof Array)
                            if(item.type.indexOf(hash[i]) > -1) item.action();
                        else    
                            if(item.type == hash[i]) item.action();                         
                        });
                    }
                });
            engine.hash.items= hash;
            });
        var buildHash= function(hashArray){
            var new_hash_string= '';
            if(hashArray.length > 0){
                new_hash_string+= hashArray[0];
                for(var i=1; i < hashArray.length; i++){
                    new_hash_string+= '&'+hashArray[i];
                    }
                self.location.hash= new_hash_string;
                }
            return new_hash_string;
            };
        this.on= function(type, action){
            engine.hash.actions.push({type: type, action : action});
            };
        this.after= function(type, action){
            engine.hash.cleanUps.push({type: type, action: action});
            };
        this.add= function(item){
            var hash= self.location.hash.split('&');
            hash.push(item);
            self.location.hash= buildHash(hash);
            };
        this.replace= function(key, value){
            var hash= self.location.hash.split('&');
            for(var i=0; i < hash.length; i++){
                if(hash[i].indexOf('_'+key+':') > -1){
                    hash[i]= '_'+key+':'+value;
                    self.location.hash= buildHash(hash);
                    break;
                    }
                }
            };
        this.remove= function(item){
            var hash= self.location.hash.split('&');
            hash.splice(hash.indexOf(item), 1);
            self.location.hash= buildHash(hash);
            };
        this.createItem= function(key, value){
            return '_'+key+':'+value;
            };
        this.create= function(key){
            self.hash+= '&_'+key+':null';
            };
    }
});