// net.js v0.2 part of the Application Frame

'use strict';

export default {
	net : (function(){

		var Socket= function(type, url, options){
			this._type= type;
			this._url= url;
			this._lastMessage= null;
			this._open= false;
			this._options= options;
		};
		
		Socket.prototype= {
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
                var xhr= new $$.XMLHttpRequest(this._options);
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
                    if(self._type == Socket.HTTP_POST){
                        xhr.open('POST', self._url, true);
                        xhr.send(message);
                    }else if(self._type == Socket.HTTP_GET){
                        xhr.open('GET', self._url + '?' + message, true);
                        xhr.send();
                    }
                });
            }
        };
		        
		Socket.HTTP_GET= 'http_get';
    	Socket.HTTP_POST= 'http_post';
    	Socket.HTTP= 'http_post';
        
		var request= function(url, options){
			return new Promise(function(okay, fail){
				var xhr= new $$.XMLHttpRequest(options);
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
		};
		
        var require= function(url){
			var xhr= new $$.XMLHttpRequest();
			xhr.open('GET', url, false);
			xhr.send();
			if(xhr.status == 200)
				return xhr.responseText;
			else
           		return null;
		};
		
		return {
			Socket : Socket,
			request : request,
			require : require
		};

    })()
};
