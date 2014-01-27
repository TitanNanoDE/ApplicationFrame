//default core extensions for the default Application Frame modules - copyright by TitanNano / Jovan Ggerodetti - http://www.titannano.de
/* global $ */
/* global self */

$('escape').wrapper(function(){

'use strict';

/* --- eventManagement --- */
    self.EventManager= function(){
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
	
/* --- advanced Prototyping --- */
    self.prototyping= function(object, types){
        var prototype= {};
        types.forEach(function(Item){
            Item.apply(object);
            var x= new Item();
            for(var i in x){
                prototype[i]= x[i];
                }
            });
//        object.prototype= prototype;
        };
});