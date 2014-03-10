// Function Hijack v0.1 © copyright by TitanNano / Jovan Gerodetti - titannano.de

$('addon').module(['af/core-extensions'], function(){
    
    "use strict";
    
    this.Hijack= function(object){
            this._object= object;
            this._traps= {};
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
});