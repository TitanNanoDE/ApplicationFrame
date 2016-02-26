/*****************************************************************
 * fileSystem.js v2.0.0  part of the ApplicationFrame              *
 * © copyright by Jovan Gerodetti (TitanNano.de)                 *
 * The following Source is licensed under the Appache 2.0        *
 * License. - http://www.apache.org/licenses/LICENSE-2.0         *
 *****************************************************************/

'use strict';

import Af from '../af.js';

const DEFAULTSYSTEM = "main";

let $$= (typeof window !== 'undefined') ? window : global;
let db = null;
let { Make } = Af.Util;

export let Plugins = {
    logger : $$.console,
};

let request = new Promise((success, error) => {
    let request = $$.indexedDB.open('ApplicationFrame.FileSystem', 1);

    request.onsuccess = success;
    request.onerror = error;

    /**
     * Upgrade the DB if required!
     */
    request.onupgradeneeded = function(event){
    	var db= event.target.result;
    	var system= DEFAULTSYSTEM;
    	var storage;

    // 	upgrade to version 1
    	if(event.oldVersion < 1){
    		storage = db.createObjectStore(system, { keyPath: "path" });
    		storage.createIndex("name", "name", { unique : false });
    		storage.createIndex("type", "type", { unique : false });
    		storage.createIndex("data", "data", { unique : false });
            storage.createIndex("mimeType", "mimeType", { unique : false });

    	}else{
    		storage= db.transaction(system, "readwrite").objectStore(system);
    	}
    };
});

/**
 * Run this if the DB connection works fine.
 */
db = request.then((e) => {
	Plugins.logger.log("ready!!");

    return e.target.result;
});

/**
 * Run this in case we got some problem!
 */
request.catch(() => {
	Plugins.logger.error("Unable to connect to the IndexedDB!!");
});

// export
let DbFile = {
    name : '',
    type : null,
    data : null,
    mimeType : null,

    _make : function(name, type, data){
        this.name= name;
        this.type= type;
        this.data= data;
        this.mimeType= this.data.type || "text/plain";

        this._make = null;
    },

    saveTo : function(args){
		var system= args.system || "main";
		var path= args.path || "";
		saveFileTo({file : this, path : path, system : system});
	}
};

var DbItemFile = {
    name : '',
    type : null,
    data : null,
    path : '',
    mimeType : null,

    _make : function(name, type, data, path, mimeType){
        this.name= name;
        this.type= type;
        this.data= data;
        this.path= path;
        this.mimeType= mimeType;

        this._make = null;
    }
};

/**
 * Saves a file to the given path in the given file system.
 *
 * @param {DbFile} file
 * @param {string} path
 * @param {string} [system]
 */
var saveFileTo = function({ file, path, system = DEFAULTSYSTEM }){
    return db.then(db => {
        let storage = db.transaction(system, "readwrite").objectStore(system);
    	file = Make(DbItemFile)(file.name, file.type, file.data, `${path}${file.name}.${file.type}`, file.mimeType);
    	let request = storage.put(file);

        return request;
    }).then(() => {
        Plugins.logger.log('Saved file', file, 'to', path);
    }, () => {
        Plugins.logger.error(`FileSystem error writing file '${file.path}'!!`);
    });
};

/**
 * Returns the file from the given path in the given system.
 *
 * @param {string} path
 * @param {string} system
 */
var openFile = function({ system = DEFAULTSYSTEM, path }){
    return db.then(db => {
        let storage = db.transaction(system, "readonly").objectStore(system);
        let request = storage.get(path);

        return request;
    }).then((event) => {
        Plugins.logger.log(event);
        return Make(DbFile)(event.target.result.name, event.target.result.type, event.target.result.data);
    }, () => Plugins.logger.error(`FileSystem error while reading File '${path}'`));
};

var removeFile= function(args){
    return db.then(db => {
        let system = args.system || DEFAULTSYSTEM;
        let storage = db.transaction(system, "readwrite").objectStore(system);
        let request = storage.delete(args.path);

        return request;
    }).then(() => true, () => false);
};

var getStaticFilePointerFromPath= function({ system = DEFAULTSYSTEM, path }){
    return db.then(db => {
        let storage= db.transaction(system, "readonly").objectStore(system);
        let request= storage.get(path);

        return request;
    }).then(event => {
        var url= "";

        if(event.target.result && ( (event.target.result.data instanceof $$.Blob) || (event.target.result.data instanceof $$.File) )){
            url= $$.URL.createObjectURL(event.target.result.data);
        } else if(event.target.result) {
            url= $$.URL.createObjectURL(new $$.Blob([event.target.result.data], {type : event.target.result.mimeType}));
        }

        return {url : url, status : 1};
    }, () => { status : 0 });
};

var getStaticFilePointerFromFile = function(DbFile){
// @ToDo: implement this!! basically just call URL.createObjectURL...
};

/**
 * Returns the fileSystem index, a list of all file paths in this filesystem.
 *
 * @param {string} [system]
 */
let getFileList = function({ system = DEFAULTSYSTEM }){
    return db.then(db => {
        let storage= db.transaction([system], "readonly").objectStore(system);
        let list= [];

        return new Promise((success) => {
            storage.openCursor().onsuccess = (event) => {
                var cursor= event.target.result;

                if (cursor) {
                    Plugins.logger.log(cursor.key);
                    list.push(cursor.key);
                    cursor.continue();
                } else {
                    success(list.sort());
                }
            }
        });
    });
};

let getFileListSince = function({ path, system = DEFAULTSYSTEM }){

	return this.getFileList({ system : system }).then(list => {
		let nList = [];

        path = (path[path.length] !== '/') ? (path + '/') : path;

        list.forEach(function(item){
			if (item.indexOf(path) === 0) {
				nList.push(item.replace(path, ''));
			}
		});

		return nList;
	});
};

export default {
    saveFileTo : saveFileTo,
    openFile : openFile,
    removeFile : removeFile,
    getStaticFilePointerFromPath : getStaticFilePointerFromPath,
    getFileList : getFileList,
    getFileListSince : getFileListSince,
    DbFile : DbFile
};

export var config = {
    main : 'fileSystem',
    author : 'Jovan Gerodetti',
    version : 'v1.1'
};
