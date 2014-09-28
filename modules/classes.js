// Function Hijack v0.1 © copyright by TitanNano / Jovan Gerodetti - titannano.de
$('system').export({
	classes : (function(){
		
		'use strict';
		
		var Hijack= function(object){
			this._object= object;
            this._traps= {};
        };
		
		Hijack.prototype= {
            get object(){
                return this._object;
            },
            on : function(funcName, callback){
                if(!this._traps[funcName]){
                    this._traps[funcName]= [];
                    
                    var traps= this._traps[funcName];
                    var target= this._object[funcName];
                    
                    this._object[funcName]= function(){
                        var result= target.apply(null, arguments);
                        traps.forEach(function(item){
                            item(arguments);
                        });
                        return result;
                    };
                }
                this._traps[funcName].push(callback);
            }
        };
		
		var promiseStorage= new $$.WeakMap();
		
		var Promise= function(promis){
        	promiseStorage.set(this, new $$.Promise(promis));
        };
		
		Promise.prototype= {
        	then : function(onFulfilled, onRejected){
            	promiseStorage.get(this).then(onFulfilled, onRejected);
				return promiseStorage.get(this);
        	},
			'catch' : function(onRejected){
				promiseStorage.get(this).catch(onRejected);
				return promiseStorage.get(this);
			},
			resolve : function(value){
				promiseStorage.get(this).resolve(value);
				return promiseStorage.get(this);
			},
			reject : function(reason){
				promiseStorage.get(this).reject(reason);
				return promiseStorage.get(this);
			}
		};
		
        var AsyncLoop= function(loop){
            this._l= loop;
            this.busy= false;
            this.step= 0;
            this.status= 'notstarted';
        };
		
		AsyncLoop.prototype= {
			'while' : function(condition){
				this.busy= true;
				var loop= this;
				var next= function(){
					if(eval(condition)){
						loop.step++;
                        loop.status= 'running';
                        loop._l(next, exit);
                    }else{
                        exit(1);
                    }
                };
                var exit= function(status){
                    if(status === 0)
                        loop.status= 'canceled';
                    else if(status > 0)
                        loop.status= 'completed';
                    else
                        loop.status= 'error';
                    loop.busy= false;
                    loop.step= 0;
                };
                next();
            },
			'for' : function(startIndex, condition, indexChange){
                this.busy= true;
                var loop= this;
                var i= startIndex;
                var next= function(){
                    if(eval(condition)){
                        loop.step++;
                        loop.status= 'running';
                        loop._l(i, next, exit);
                        eval(indexChange);
                    }else{
                        exit(1);
                    }
                };
                var exit= function(status){
                    if(status === 0)
                        loop.status= 'canceled';
                    else if(status > 0)
                        loop.status= 'completed';
                    else
                        loop.status= 'error';
                    loop.busy= false;
                    loop.step= 0;
                };
                next();
            }
		};
		
		return {
			Hijack : Hijack,
			Promise : Promise,
			AsyncLoop : AsyncLoop
		};
    })()
});
