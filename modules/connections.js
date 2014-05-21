// connections.js v. 0.1 part of the Application Frame

$('new')({
    name :'connections',
    object : {
        classes : {
            Socket : function(type, url){
                this._type= type;
                this._url= url;
                this._lastMessage= null;
                this._open= false;
            }
        },
        functions : {
            request : function(url){
                var { Promise } = $('classes');
                return new Promise(function(okay, fail){
                    var xhr= new $$.XMLHttpRequest();
                    xhr.onreadystatechange= function(){
                        if(this.readyState == 4){
                            if(this.status == 200)
                                okay(this.responseText);
                            else
                                fail({ status : this.status, statusText : this.statusText });
                        }
                    };
                    xhr.open('GET', url, true);
                    xhr.send();
                });
            },
            require : function(){
                var xhr= new $$.XMLHttpRequest();
                xhr.open('GET', url, false);
                xhr.send();
                if(xhr.status == 200)
                    return this.responseText;
                else
                    return null;
            }
        }
    },
    _init : function(me){
        var { Promise } = $('classes');
        me.classes.Socket.prototype= {
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
                var self= this;
                var xhr= new $$.XMLHttpRequest();
                return new Promise(function(setValue, setError){
                    xhr.onreadystatechange= function(){
                        if(this.readyState == 4){
                            if(this.status == 200){
                                setValue(this.responseText);
                            }else{
                                setError({status : this.status, statusText : this.statusText});
                            }
                        self._lastMessage= this.statusText;
                        }
                    };
                    if(self._type == me.classes.Socket.HTTP_POST){
                        xhr.open('POST', self._url, true);
                        xhr.send(message);
                    }else if(self._type == me.classes.Socket.HTTP_GET){
                        xhr.open('GET', self._url + '?' + message, true);
                        xhr.send();
                    }
                });
            }
        };
    me.classes.Socket.HTTP_GET= 'http_get';
    me.classes.Socket.HTTP_POST= 'http_post';
    me.classes.Socket.HTTP= 'http_post';
    }
});
