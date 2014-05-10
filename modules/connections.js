// connections.js v. 0.1 part of the Application Frame

$('new')({
    name :'connections',
    object : {
        classes : {
            Server : function(type, url){
                this._type= type;
                this._url= url;
                this._lastMessage= null;
                this._open= false;
                this._xhr= new $$.XMLHttpRequest();
            }
        },
        
        statics : {
            UPSTREAM_NORMAL : 0,
            DOWNSTREAM_NORMAL : 1
        }
    },
    _init : function(me){
        me.classes.Server.prototype= {
            get url(){
                return this._url;
            },
            
            get lastMessage(){
                return this._lastMessage;
            },
            
            get open(){
                return this._open;
            },
            
            push : function(message){
                var me= this;
                return new $$.Promise(function(setVaule, setError){
                    me._xhr.open('POST', this._url, true);
                    me.send(message);
                    me._xhr.onreadystatechange= function(e){
                        if(e.readyState == 4){
                            if(e.status == 200){
                                setVaule(e);
                            }else{
                                setError(e);
                            }
                        me._lastMessage= e.statusText;
                        }
                    };
                });
            }
        };
    }
});
