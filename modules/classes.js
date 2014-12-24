// Function Hijack v0.1 © copyright by TitanNano / Jovan Gerodetti - titannano.de
$('new')({
    name : 'classes',
    object : {
        Hijack : function(object){
            this._object= object;
            this._traps= {};
        },
        Promise : function(promis){
            this._p= new $$.Promise(promis);
        },
        AsyncLoop : function(loop){
            this._l= loop;
            this.busy= false;
            this.step= 0;
            this.status= 'notstarted';
        }
    },
    _init : function(me){
		"use strict";
        
		me.Hijack.prototype= {
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
        me.Promise.prototype= {
            then : function(){
                this._p.then.apply(this._p, arguments);
                return this;
            },
            'catch' : function(onRejected){
                this._p.catch.apply(this._p, arguments);
                return this;
            },
            resolve : function(value){
                this._p.resolve.apply(this._p, arguments);
                return this;
            },
            reject : function(reason){
                this._p.resolve.apply(this._p, arguments);
                return this;
            }
        };
        me.AsyncLoop.prototype= {
            'while' : function(condition, $){
                this.busy= true;
                var loop= this;
				
				return new Promise(function(success){
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
						success(loop);
                	};
                	next();
				});
            },
			'incalculable' : function(){
				this.busy= true;
                var loop= this;
				
				return new Promise(function(success){
					var next= function(){
						loop.step++;
						loop.status= 'running';
						loop._l(next, exit);
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
						success(loop);
                	};
					
                	next();
				});
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
    }
});
