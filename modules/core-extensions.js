//default core extensions for the default Application Frame modules - copyright by TitanNano / Jovan Ggerodetti - http://www.titannano.de

$('escape').wrapper(function(){
    
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
    $$.Prototype= function(types){
        var prototype= {};
        types.forEach(function(item){
            var x= item.prototype || item;
            for(var i in x){
                if(x.__lookupGetter__(i) || x.__lookupSetter__(i)){
                    prototype.__defineGetter__(i, x.__lookupGetter__(i));
                    prototype.__defineSetter__(i, x.__lookupSetter__(i));
                }else{
                    prototype[i]= x[i];
                }
            }
        });
        return prototype;
    };
    
/* --- forEach extension --- */
var forEach= function(callback){
    for(var i= 0; i<this.length; i++){
        callback(this[i], i);
        }
    };

// if your required list type isn't here just add it
if($$.Array && !$$.Array.prototype.forEach) $$.Array.prototype.forEach= forEach;
if($$.NodeList && !$$.NodeList.prototype.forEach) $$.NodeList.prototype.forEach= forEach;
if($$.navigator && $$.navigator.isTouch && !$$.TouchList.prototype.forEach) $$.TouchList.prototype.forEach= forEach;
	
/* --- array last extension --- */
var ArrayLast= function(){
	return this[this.length -1];
};
	
if($$.Array && !$$.Array.prototype.last) $$.Array.prototype.last= ArrayLast;
    
/* --- DOM Node extensions --- */
if($$.Node){
    $$.Node.prototype.transition= function(add, remove){
        var node= this;
        return new $$.Promise(function(setValue){
//          set event listener            
            node.addEventListener('transitionend', function x(e){
                this.removeEventListener('transitionend', x);
                setValue(this, e);
            });
//          set css classes
            if(add && add instanceof Array)
                add.forEach(function(item){
                    node.classList.add(item);
                });
            else if(add)
                node.classList.add(add);
            
            if(remove && remove instanceof Array)
                remove.forEach(function(item){
                    node.classList.add(item);
                });
            else if(remove)
                node.classList.remove(remove);
        });  
    };
}
    
});