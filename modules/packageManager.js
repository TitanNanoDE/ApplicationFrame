//Package Manager v0.1 © copyright by TitanNano / Jovan Gerodetti - titannano.de

'use strict';

$('new')({
    name : 'packages',
    constructor : function(){
        this.unpack= function(pack){
            pack.files.forEach(function(item, index){
                if(item.content.length === item.length){
                    var buffer= $$.lib.b64.decode(item.content);
                    var blob= new $$.Blob([buffer], { type : item.type });
                    var file= new $$.TNFile(item.path.substring(item.path.lastIndexOf('/')+1, item.path.indexOf('.')), item.path.substr(item.path.indexOf('.')+1), blob);
                    file.saveTo({path : 'packages/'+pack.name+item.path.substring(0, item.path.lastIndexOf('/')+1)});
                }else{
                    throw 'Failed to unpack "'+pack.name+'": wrong length for item '+index+'!!';
                }
            });
        };
        this.Package= function(name){
            $$.prototyping(this, [$$.EventManager]);
            var object= this;
            this.name= name;
            this.files= [];
            this.fileCount= 0;
            this.ready=  true;
            var queue= [];
            var setReady= function(){
                object.ready= true;
                var event= new $$.CustomEvent('ready');
                object.dispatchEvent(event);
            };
            var setWorking= function(){
                object.ready= false;
                var event= new $$.CustomEvent('working');
                object.dispatchEvent(event);
            };
            var loop= function(){
                setWorking();
                var item= queue.shift();
                if(typeof item.object === "string"){
                    var block= {
                        path : this.path,
                        content : $$.btoa(object),
                        type : "text/plain",
                        length : $$.btoa(object).length
                    };
                    object.files.push(block);
                    if(queue.length > 0){
                        loop();
                    }else{
                        setReady();
                    }
                }else if(item.object instanceof $$.Blob){
                    var reader= new $$.FileReader();
                    reader.onloadend= function(event){
                        var content= event.target.result.substring(event.target.result.indexOf(',')+1);
                        var block= {
                            path : item.path,
                            content : content,
                            type : event.target.result.substring(event.target.result.indexOf(':')+1, event.target.result.indexOf(';')-1),
                            length: content.length
                        };
                        object.files.push(block);
                        if(queue.length > 0){
                            loop();
                        }else{
                            setReady();
                        }
                    };
                    reader.readAsDataURL(item.object);
                }
            };
            this.push= function(object, path){
                queue.push({object : object, path : path});
                if(this.ready){
                    loop();
                }
            };
        };
        
        this.pack= function(pack){
           if(pack.ready){
               delete(pack.ready);
               delete(pack.progress);
               delete(pack.onready);
               delete(pack.onprogress);
               pack.fileCount= pack.files.length;
               return JSON.stringify(pack, null, '  ');
           }else{
               $$.console.warn("Package \""+pack.name+"\" is not read!!");
           }
        };
		
        this.get= function(pack, relativePath, callback){
            $('fileSystem').getStaticFilePointerFromPath({path : 'packages/'+pack+relativePath}, callback);
        };
        
        this.download= function(path){
            var request= new $$.XMLHttpRequest();
            request.open('GET', path, true);
            var manager= this;
            request.onreadystatechange= function(){
                if(request.readyState == 4){
                    var pack= JSON.parse(request.responseText);
                    manager.unpack(pack);
                }
            };   
            request.send();
        };
    }
});
/*
example package

{
	name : "example",
	files : [{
				path : "/example/icon.png",
				content : base64String,
				type : "image/png",
				length : 12
			},
			{
				path : "/scripts/main.js",
				content : base64String,
				type : "text/javascript",
				length 212
			}],
	fileCount : 2
	
}

*/