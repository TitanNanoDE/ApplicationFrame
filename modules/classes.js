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
        },
		URL : function(urlString){
			this._h= '';
			this._p= '';
			this._pa= '';
			this._u= '';
			this._pat= '';
			this._hr= urlString;
			
			this.parse(urlString);
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
            'while' : function(condition){
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
		
		me.URL.prototype= {
			parse : function(urlString){
//				parse URL
				if(urlString.indexOf('//')){
					this._p= urlString.substring(0, urlString.indexOf('//'));
					urlString.substr(urlString.indexOf('//')+2);
				}
				
				var hostPart= urlString.substring(0, urlString.indexOf('/'));
				urlString= urlString.substr(urlString.indexOf('/'));
				if(hostPart.indexOf('@')){
					var userPart= hostPart.split('@')[0];
					this._h= hostPart.split('@')[1];
					this._u= userPart.split(':')[0];
					this._pa= userPart.split(':')[1] || '';
				}
				this._h= hostPart;
				this._pat= urlString;
			},
			
			asemble : function(){
				var path= '';
				if(this._p !== '')
					path+= this._p+'//';
				
				if(this._u !== ''){
					path+= this._u;
					path+= (this._pa !== '') ? ':'+this._pa+'@' : '@';
				}
				
				if(this._h)
					path+= this._h;
				
				if(this._pat)
					path+= this._pat;
				
				this._hr= path;
			},
			
			get protocol(){
				return this._p;
			},
			
			set protocol(value){
				this._p=value;
				this.asemble();
			},
			
			get host(){
				return this._h;
			},
			
			set host(value){
				this._h= value;
				this.asemble();
			},
			
			get username(){
				return this._u;
			},
			
			set username(value){
				this._u= value;
				this.asemble();
			},
			
			get password(){
				return this._pa;
			},
			
			set password(value){
				this._pa= value;
				this.asemble();
			},
			
			get path(){
				return this._pat;
			},
			
			set path(value){
				this._pat= value;
				this.asemble();
			},
			
			get href(){
				return this._hr;	
			},
			
			set href(value){
				this._hr= value;
				this.parse(this._hr);
			}
		};
    }
});
