this.$$ = this;
var { $_ }= $$.require('af/core');

$_('addon').hook($$);

$_('addon').modules({
    'self' : $$.require('sdk/self'),
    'window' : $$.require('sdk/window/utils')
});

$_('addon').module(function(){
    
    $$.exports.Window= function(options){
        var activeBrowserWindow= $_('window').getMostRecentBrowserWindow();    
        
        var url= $_('self').data.url('pages/release.html');
        var features= {
            height : options.height,
            width : options.width,
            left: activeBrowserWindow.screenX + (activeBrowserWindow.outerWidth / 2) - (options.width / 2),
            top: activeBrowserWindow.screenY + (activeBrowserWindow.outerHeight / 2) - (options.height / 2),
            chrome : !options.webView,
            titlebar : !options.popup,
            alwaysRaised : options.popup,
            minimizable : !options.popup
        };
        
//      open window
        this._window= $_('window').open(url, { name : options.title, features : features });
        
//      hide popup form taskbar
        if(options.popup)
            $_('window').backgroundify(this._window, { close : true });
        
//      create communication
        var  com= {
            messageQueue : [],
            handlers: [],
            ready : false,
            sandbox : this._window.document.xCo,
            _init_ : function(){
                this.ready= true;
                var self= this;
                console.log('pushing existing messages...');
                this.messageQueue.forEach(function(item){
                    self.push(item.type, item.content);
                });
                this.messageQueue= null;
            },
            push : function(type, content){
                if(!this.ready)
                    this.messageQueue.push({ type : type, content : content});
                else{
                    this.sandbox.in(type, content);
                }
            },
            trigger : function(type, content){
                this.messageQueue.forEach(function(item){
                    if(item.type == type)
                        item.handler(content);
                });
            }
        };
        this._window.document.xCo= {
            'out' : function(name, data){
                new Promise(function(){
                    com.trigger(name, data);
                }).then();
            },
            'in' : function(type, content){
                new Promise(function(){
                    console.log(window.self);
                }).then();
            },
            start : function(){
                console.log('starting communication...');
                com._init_();
            }
        };
        
//      inject scripts
        var document= window.document;
        if(options.contentScriptFile){
            if(options.contentScriptFile instanceof Array){
                options.contentScriptFile.forEach(function(item){
                    var script= document.body.appendChild(document.createElement('script'));
                    script.src= item;
                });
            }else{
                var script= document.body.appendChild(document.createElement('script'));
                script.src= options.contentScriptFile;
            }
        }
    };
    
    $$.exports.Window.prototype= {
        port : {
            on : function(){
                
            },
            emit : function(){
                
            }
        }  
    };
});
