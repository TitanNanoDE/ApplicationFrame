/*****************************************************************
 * Classes.js v1.1  part of the ApplicationFrame                 *
 * © copyright by Jovan Gerodetti (TitanNano.de)                 *
 * The following Source is licensed under the Appache 2.0        *
 * License. - http://www.apache.org/licenses/LICENSE-2.0         *
 *****************************************************************/

"use strict";
		
var AsyncLoop= function(loop){
	this._l= loop;
	this.busy= false;
	this.step= 0;
	this.status= 'notstarted';
};

AsyncLoop.prototype= {
    run : function(){
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
		listeners.forEach(item => {
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
