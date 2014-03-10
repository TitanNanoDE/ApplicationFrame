
var {$, $_}= self.require('af/core');

$('addon').module(['sdk/preferences/service', 'sdk/self'], function(globalPref, system){
    
    "use strict";
    
    var prefName= 'extensions.'+system.id+'.sdk.console.logLevel';
    
    this.enabled= function(value){
        var status= (value) ? 'debug' : 'error';
        globalPref.set(prefName, status);
        };
});