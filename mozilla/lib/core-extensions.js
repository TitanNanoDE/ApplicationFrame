//default core extensions for the default Application Frame modules - copyright by TitanNano / Jovan Ggerodetti - http://www.titannano.de

var {$, $_}= $$.require('af/core');

$('addon').module([], function(){

"use strict";

/* --- eventManagement --- */
    $$.EventManager= function(){
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
    $$.prototyping= function(object, types){
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
    
/* --- forEach extension --- */
var forEach= function(callback){
    for(var i= 0; i<this.length; i++){
        callback(this[i], i);
        }
    };

// if your required list type isn't here just add it
if($$.Array && !$$.Array.forEach) $$.Array.prototype.forEach= forEach;
if($$.NodeList && !$$.NodeList.forEach) $$.NodeList.prototype.forEach= forEach;
if($$.navigator && $$.navigator.isTouch && !$$.TouchList.forEach) $$.TouchList.prototype.forEach= forEach;
    
});