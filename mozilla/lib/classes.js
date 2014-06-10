// Classes v0.1 © copyright by TitanNano / Jovan Gerodetti - titannano.de

this.$$= this;
var { $_ }= $$.require('af/core');

$_('addon').hook($$);

$_('addon').module(function(){
    
    "use strict";
    
    this.Hijack= function(object){
            this._object= object;
            this._traps= {};
        };
    this.Promise= function(promis){
            this._pr= promis;
            this._fu= [];
            this._re= [];
            this._is= false;
            this._st= 0;
            this._res= null;
            this._a= false;
        };
    this.Hijack.prototype= {
        get object(){
            return this._object;
        },
        on : function(funcName, callback){
            if(!this._traps[funcName]){
                this._traps[funcName]= [];
                
                var traps= this._traps[funcName];
                var target= this._object[funcName];
                
                this._object[funcName]= function(...param){
                    var result= target(...param);
                    traps.forEach(function(item){
                        item(param);
                    });
                    return result;
                };
            }
            this._traps[funcName].push(callback);
        }
    };
    this.Promise.prototype= {
        then : function(onFulfilled, onRejected){
            var self= this;
            if(!this._is){
                if(onFulfilled)
                    this._fu.push(onFulfilled);
                if(onRejected)
                    this._re= onRejected;
            }else{
                if(this._st == 2 && onFulfilled)
                    onFulfilled(this._res);
                else if(this._st == 1 && onRejected)
                    onRejected(this._res);
            }
            if(!this._a){
                var res= function(x){
                    self.resolve(x);
                };
                var rej= function(x){
                    self.reject(x);
                };
                this._a= true;
                this._pr(res, rej);
            }
            return this;
        },
        'catch' : function(onRejected){
            if(!this._is){
                if(onRejected)
                    this._re.push(onRejected);
            }else{
                if(this._st == 1 && onRejected)
                    onRejected(this._res);
            }
            return this;
        },
        resolve : function(value){
            if(!this._is){
                var self= this;
                this._a= true;
                this._res= value;
                this._is= true;
                this._st= 2;
                this._fu.forEach(function(item){
                    item(self._res);
                });
            }
            return this;
        },
        reject : function(reason){
            if(!this._is){
                var self= this;
                this._a= true;
                this._res= reason;
                this._is= true;
                this._st= 1;
                this._re.forEach(function(item){
                    item(self._res); 
                });
            }
            return this;
        }
    };
});