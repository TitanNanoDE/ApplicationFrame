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
        this._p= new $$.Promise(promis);
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
            this._p.then(onFulfilled, onRejected);
            return this;
        },
        'catch' : function(onRejected){
            this._p.catch(onRejected);
            return this;
        },
        resolve : function(value){
            this._p.resolve(value);
            return this;
        },
        reject : function(reason){
            this._p.reject(reason);
            return this;
        }
    };
});