// ApplicationFrame Classes v1.1 © copyright by TitanNano / Jovan Gerodetti - titannano.de
"use strict";
		
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

var EventManager= function(){
	var listeners= [];
	this.addEventListener= function(type, listener, useCapture){
		listeners.push({
			type : type,
			listener : listener,
			useCapture : useCapture
		});
	};
	this.dispatchEvent= function(event){
		listeners.forEach(function(item){
			if(item.type === event.type){
				item.listener(event);
			}
		});
	};
};

var Prototype= function(...types){
	var prototype= {};
	types.forEach(function(item){
		var x= item.prototype || item;
		for(var i in x){
            Object.defineProperty(prototype, i, Object.getOwnPropertyDescriptor(x, i));
		}
	});
	return prototype;
};

export var classes = {
    AsyncLoop : AsyncLoop,
    EventManager : EventManager,
    Prototype : Prototype
};

export var config = {
    main : 'classes',
    author : 'Jovan Gerodetti',
    version : 'v1.1'
};
