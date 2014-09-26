// connections.js v.0.1 part of the Application Frame

$('new')({
    name :'connections',
    object : {
        classes : {
            Socket : function(type, url, options){
                this._type= type;
                this._url= url;
                this._lastMessage= null;
                this._open= false;
                this._options= options;
            },
            
            OAuthClient : function(name, host, key, secred, options){
               this._host= host;
               this._key= key;
               this._options= options;
               this._secred= secred;
               this._name= name;
               this._token= $$.localStorage.getItem('af.oauth.'+ this._name +'.token') || '';
               this._tokenSecred= $$.localStorage.getItem('af.oauth.'+ this._name +'.tokenSecred') || '';
            }
        },
        functions : {
            request : function(url, options){
                var Promise = $('classes').Promise;
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
            },
            require : function(url){
                var xhr= new $$.XMLHttpRequest();
                xhr.open('GET', url, false);
                xhr.send();
                if(xhr.status == 200)
                    return xhr.responseText;
                else
                    return null;
            }
        }
    },
    _init : function(me){
        var Promise = $('classes').Promise;
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
                    if(self._type == me.classes.Socket.HTTP_POST){
                        xhr.open('POST', self._url, true);
                        xhr.send(message);
                    }else if(self._type == me.classes.Socket.HTTP_GET){
                        xhr.open('GET', self._url + '?' + message, true);
                        xhr.send();
                    }
                });
            },
			
			request : function(url, message){
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
                    if(self._type == me.classes.Socket.HTTP_POST){
                        xhr.open('POST', self._url + url,  true);
                        xhr.send(message);
                    }else if(self._type == me.classes.Socket.HTTP_GET){
                        xhr.open('GET', self._url + url + '?' + message, true);
                        xhr.send();
                    }
                });
			}
        };
       me.classes.Socket.HTTP_GET= 'http_get';
       me.classes.Socket.HTTP_POST= 'http_post';
       me.classes.Socket.HTTP= 'http_post';
       
       me.classes.OAuthClient.prototype= {
           request : function(url, data){
               var self= this;
               
               return new $$.Promise(function(success, failed){
                   var response= (new OAuthRequest('POST', url, data, self)).send();
                   response.then(function(data){
					   success(data.responseText);
				   });
                   response.catch(failed);
               });
           },
           
           get : function(url, data){
               var self= this;
               
               return new $$.Promise(function(success, failed){
                   var response= (new OAuthRequest('GET', url, data, self)).send();
                   response.then(function(data){
					   success(data.responseText);
				   });
                   response.catch(failed);
               });
           },
		   
		   download : function(url, notDefaultHost){
			   var self= this;
			   
			   return new $$.Promise(function(success, failed){
				  var request= new OAuthRequest('GET', url, null, self, notDefaultHost);
				  request.responseType= 'blob';
				  var response= request.send();
				   
				  response.then(function(data){
					  success(data.response);
				  });
				  response.catch(failed);
			   });
		   },
           
           requestToken : function(url, callback_url){
               var self= this;
               
               return new $$.Promise(function(success, failed){
                   var request= new OAuthRequest('POST', url, null, self);
                   request.oauthHeader.oauth_callback= callback_url;
                   var response= request.send();
                   
                   response.then(function(data){
                       var data= data.responseText.split('&');
                       self._token= data[0].split('=')[1];
                       self._tokenSecred= data[1].split('=')[1];
                       
                       success();
                   });
                   response.catch(failed);
               });
           },
           
           verify : function(url, verifier){
               var self= this;

               return new $$.Promise(function(success){
                   var request= new OAuthRequest('POST', url, null, self);
                   
                   request.oauthHeader.oauth_verifier= verifier;
                   var response= request.send();
                   
                   response.then(function(data){
                       var data= data.responseText.split('&');
                       self._token= data[0].split('=')[1];
                       self._tokenSecred= data[1].split('=')[1];
                       
                       $$.localStorage.setItem('af.oauth.'+ self._name +'.token', self._token);
                       $$.localStorage.setItem('af.oauth.'+ self._name +'.tokenSecred', self._tokenSecred);
                       
                       success(data[2].split('=')[1]);
                   });
               });
           },
           
           authenticate : function(url){
               $$.open(this._host + url + '?oauth_token=' + this._token);
           },
           
           isLoggedIn : function(){
               return (this._token !== '');
           },
		   
		   exposeToken : function(){
			   return [this._token, this._tokenSecred];
		   }
       };
        
       var OAuthRequest= function(method, url, data, client, notDefaultHost){
           this._client= client;
           this._data= data;
           this._method= method;
		   this.responseType= '';
           this.oauthHeader= {
               'oauth_consumer_key' : client._key,
               'oauth_nonce' : createOAuthNonce(),
               'oauth_signature_method' : 'HMAC-SHA1',
               'oauth_timestamp' : $$.Date.now().toString().substr(0, 10),
               'oauth_version' : '1.0'
           };
		   
		   if(!notDefaultHost)
			   this._url= client._host + url;
		   else
			   this._url= url;
		   
           if(client._token !== '') this.oauthHeader.oauth_token= client._token;
       };
       
       OAuthRequest.prototype= {
           send : function(){
               var self= this;
               var data= '';
               var xhr= new $$.XMLHttpRequest(this._client._options);
               
               this.oauthHeader.oauth_signature= createOAuthSignature(this.oauthHeader, this._data, this._method, this._url, this._client._secred, this._client._tokenSecred);
               
               if(this._data){
                   $$.Object.keys(this._data).forEach(function(item){
                       if(data.length > 0) data+= '&';
                       data+= item + '=' + $$.encodeURIComponent(self._data[item]);
                   });
               }
               
               if(data !== '')
                   xhr.open(this._method, this._url + '?' + data, true);
			   else
				   xhr.open(this._method, this._url, true);
               
               xhr.setRequestHeader('Authorization', createOAuthHeader(this.oauthHeader));
			   
			   if(this.responseType !== '')
				   xhr.responseType= this.responseType;
               
               return new $$.Promise(function(success, failed){
                   xhr.onreadystatechange= function(){
                      if(this.readyState == 4){
                          if(this.status == 200){
                              success(this);
                          }else{
                              failed({
								  status : this.status +' - ' + this.statusText,
								  nextTry : this.getResponseHeader('X-Rate-Limit-Reset')
							  });
                          }
                      }  
                   };
                   
                   if(self._method == 'POST')
                       xhr.send(data);
                   else
                       xhr.send();
               });
           } 
       };
           
       var createOAuthSignature= function(header, data, method, url, secred, tokenSecred){
           var hash= {};
           var raw= '';
           var base= '';
               
           $$.Object.keys(header).forEach(function(item){
               hash[$$.encodeURIComponent(item)]= $$.encodeURIComponent(header[item]);
           });
               
           if(data){
               $$.Object.keys(data).forEach(function(item){
                   hash[$$.encodeURIComponent(item)]= $$.encodeURIComponent(data[item]); 
               });
           }
               
           $$.Object.keys(hash).sort().forEach(function(item){
               if(raw.length > 0) raw+= '&';
               raw+= item+'='+hash[item];
           });
               
           base+= method + '&' + $$.encodeURIComponent(url) + '&' + $$.encodeURIComponent(raw);
           var key= secred + '&' + tokenSecred;
           
//           console.log(raw);
//           console.log(base);
//           console.log(key);
               
           hash= $$.CryptoJS.HmacSHA1(base, key);
               
           return $$.btoa(hash.toString($$.CryptoJS.enc.Latin1));
       };
           
       var createOAuthHeader= function(object){
           var header= '';
           $$.Object.keys(object).sort().forEach(function(item){
               if(header.length > 0) header+= ',';
               header+= item+'="'+ $$.encodeURIComponent(object[item]) +'"';
           });
           return 'OAuth ' + header;
       };
         
       var createOAuthNonce= function(){
          var nonce= '';
          for(var i= 0; i <= 32; i++){
             nonce+= $$.String.fromCharCode(Math.round(Math.random() * 25) + 97);
          }
          return $$.btoa(nonce);
       };
    }
});
