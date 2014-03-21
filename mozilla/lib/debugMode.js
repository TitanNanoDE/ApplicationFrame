
this.self= this;
var { $_ }= self.require('af/core');

$_('addon').hook(self);

$_('addon').modules({
    'globalPrefs' : self.require('sdk/preferences/service'),
    'self' : self.require('sdk/self')
});

$_('addon').module(function(){    
    var prefName= 'extensions.'+$_('self').id+'.sdk.console.logLevel';
    this.enabled= function(value){
        var status= (value) ? 'debug' : 'error';
        $_('globalPrefs').set(prefName, status);
    };
});