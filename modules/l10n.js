/* global $ */

$('escape').wrapper(function(){

    $$._= function(stringID, callback){
        $('addon').talk('l10n', stringID).then(function(string){
            callback(string);
        });
    };
    
});