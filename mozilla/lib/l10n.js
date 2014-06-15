
this.$$= this;
var { $_ }= $$.require('af/core');

$_('addon').hook($$);

$_('addon').modules({
    'self' : $$.require('sdk/self'),
    'sdk-l10n' : $$.require('sdk/l10n'),
});

$_('addon').module(function(){
    var defaultStrings= null;
    
    this.setup= function(str){
        defaultStrings= str;
    };
    
    this.localize= function(worker){
        $_('addon').talkTo(worker).listen('l10n', function(string, answert){
            var trans= $_('sdk-l10n').get(string);
            if(trans != string)
                answert(trans);
            else
                answert(defaultStrings[string]);
        });
    };
});