/*****************************************************************
 * Classes.js v1.1  part of the ApplicationFrame                 *
 * © copyright by Jovan Gerodetti (TitanNano.de)                 *
 * The following Source is licensed under the Appache 2.0        *
 * License. - http://www.apache.org/licenses/LICENSE-2.0         *
 *****************************************************************/

"use strict";

var AsyncLoop = {
    _l : null,
	busy : false,
	step : 0,
	status : 'notstarted',

    _make : function(loop){
        this._l = loop;

        this._make = null;
    },

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

var EventManager= {
    listeners : null,

    _make : function(){
        this.listeners = [];

        this._make = null;
    },

	addEventListener : function(type, listener, useCapture){
		this.listeners.push({
			type : type,
			listener : listener,
			useCapture : useCapture
		});
	},

	dispatchEvent : function(event){
		this.listeners.forEach(item => {
			if(item.type === event.type){
				item.listener(event);
			}
		});
	}
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

var AsyncQueue = {
    queue : null,
    active : false,
    processor : null,

    _make : function(processor){
        this._processor = processor;

        this._make = null;
    },

    next : function(){
        if(this.queue.length > 0){
            this.integrate(...this.queue.shift());
            this.next();
        }else{
            this.active= false;
        }
    },

    push : function(...args){
        var self= this;
		return new Promise(function(done){
            args.push(done);
            this.queue.push(args);

            if(!this.active){
                this.active= true;
                this.next();
            }
		}.bind(this)).then(value => self.next());
	}
};

var Accessor = {
    privateMap : null,

    _make : function(){
        this.privateMap = new WeakMap();
    },

    attributes : function(target, object){
        if(!object){
            return { public : target, private : this.privateMap.get(target) };
        }else{
            this.privateMap.set(target, object);
            return { public : target, private : object };
        }
    }
};

export var classes = {
    AsyncLoop : AsyncLoop,
    AsyncQueue : AsyncQueue,
    EventManager : EventManager,
    Prototype : Prototype,
    Accessor : Accessor
};

export var config = {
    main : 'classes',
    author : 'Jovan Gerodetti',
    version : 'v1.1'
};
