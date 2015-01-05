//fileSystem v0.1 © copyright by TitanNano / Jovan Gerodetti - titannano.de

"use strict";

var db;
var request= $$.indexedDB.open("pf.filesystem", 2);

request.onsuccess= function(){
	db= request.result;
	$$.console.log("ready!!");
};

request.onerror= function(){
	$$.console.error("Fehler beim verbinden mit der Datenbank!!");
};
        
request.onupgradeneeded= function(event){
	var db= event.target.result;
	var system= DEFAULTSYSTEM;
	var storage;
            
// 	upgrade to version 1
	if(event.oldVersion < 1){
		storage = db.createObjectStore(system, { keyPath: "path" });
		storage.createIndex("name", "name", { unique : false });
		storage.createIndex("type", "type", { unique : false });
		storage.createIndex("data", "data", { unique : false });
	}else{
		storage= db.transaction(system, "readwrite").objectStore(system);
	}
	
//  upgrade to version 2
	if(event.oldVersion < 2){
		storage.createIndex("mimeType", "mimeType", { unique : false });
	}
};

// export
var TNFile= function(name, type, data){
	this.name= name;
	this.type= type;
	this.data= data;
	this.saveTo= function(args){
		var system= args.system || "main";
		var path= args.path || "";
		saveFileTo({file : this, path : path, system : system});
	};
	this.mimeType= this.data.type || "text/plain";
};
	
var DBItemFile= function(name, type, data, path, mimeType){
	this.name= name;
	this.type= type;
	this.data= data;
	this.path= path;
	this.mimeType= mimeType;
};
	
const DEFAULTSYSTEM= "main";

//export
var saveFileTo= function(args){
	var system= args.system || this.DEFAULTSYSTEM;
	var storage= db.transaction(system, "readwrite").objectStore(system);
	var file= new DBItemFile(args.file.name, args.file.type, args.file.data, args.path+args.file.name+'.'+args.file.type);
	var request= storage.delete(file.path);
	request.onsuccess= function(){
		try{
			storage.add(file).onerror= function(){
				throw 'FileSystem error while adding File "'+file.path+'"!!';
			};
		}catch(error){
			throw "File could not be saved. Probably because of an incompatible datatype!! ("+error+")";
		}
	};
	request.onerror= function(){
		throw 'FileSystem error while removing File "'+file.path+'"!!';
	};
};

var openFile= function(args, callback){
	var system= args.system || this.DEFAULTSYSTEM;
	var storage= db.transaction(system, "readonly").objectStore(system);
	var request= storage.get(args.path);
	request.onerror= function(){
		throw "FileSystem error while reading File \""+args.path+"\"";
	};
	request.onsuccess= function(event){
		$$.console.log(event);
		callback(new $$.PFFile(event.target.result.name, event.target.result.type, event.target.result.data));
	};
};

var removeFile= function(args, callback){
	var system= args.system || this.DEFAULTSYSTEM;
	var storage= db.transaction(system, "readwrite").objectStore(system);
	var request= storage.delete(args.path);
	request.onerror= function(){
		callback(false);
	};
	request.onsuccess= function(){
		callback(true);
	};
};
            
var getStaticFilePointerFromPath= function(args, callback){
	var system= args.system || this.DEFAULTSYSTEM;
	var storage= db.transaction(system, "readonly").objectStore(system);
	var request= storage.get(args.path);
	request.onsuccess= function(event){
		var url= "";
		if(event.target.result && ( (event.target.result.data instanceof $$.Blob) || (event.target.result.data instanceof $$.File) )){
			url= $$.URL.createObjectURL(event.target.result.data);
		}else if(event.target.result){
			url= $$.URL.createObjectURL(new $$.Blob(["test"], {type : event.target.result.mimeType}));
		}
		callback({url : url, status : 1});
	};
	request.onerror= function(){
		callback({status : 0});
                };
};

var getStaticFilePointerFromFile= function(){
};
		
var getFileList= function(args, callback){
	var system= args.system || this.DEFAULTSYSTEM;
	var storage= db.transaction(system, "readonly").objectStore(system);
	var list= [];
	storage.openCursor().onsuccess= function(event){
		var cursor= event.target.result;
		if(cursor){
			$$.console.log(cursor.key);
			list.push(cursor.key);
			cursor.continue();
		}else{
			callback(list.sort());
		}
	};
};

var getFileListSince= function(args, callback){
	var path= args.path;
	this.getFileList({system : args.system}, function(list){
		var nList= [];
		list.forEach(function(item){
			if(item.indexOf(path) > -1){
				nList.push(item.replace(path, ''));
			}
		});
		callback(nList);
	});
};

export default {
	fileSystem : {
		saveFileTo : saveFileTo,
		openFile : openFile,
		removeFile : removeFile,
		getStaticFilePointerFromPath : getStaticFilePointerFromPath,
		getFileList : getFileList,
		getFileListSince : getFileList,
		TNFile : TNFile
	},

	config : {
		main : 'fileSystem',
		author : 'Jovan Gerodetti',
		version : 'v1.1'
	}
};
