//default core extensions for the default Application Frame modules - copyright by TitanNano / Jovan Gerodetti - http://www.titannano.de

$('wrap')(function(){
    
"use strict";

// if your required list type isn't here just add it
if($$.NodeList && !$$.NodeList.prototype.forEach) $$.NodeList.prototype.forEach= $$.Array.prototype.forEach;
if($$.TouchList && !$$.TouchList.prototype.forEach) $$.TouchList.prototype.forEach= $$.Array.prototype.forEach;
	
/* --- last extension --- */
var ArrayLast= function(){
	return this[this.length -1];
};
	
if($$.Array && !$$.Array.prototype.last) $$.Array.prototype.last= ArrayLast;
    
});
