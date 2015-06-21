export var Make = function(object, prototype) {
    if(arguments.length < 2){
        prototype = object;
        object = {};
    }

    Object.setPrototypeOf(object, prototype);


    var m = function(...args){
        var make = prototype.make || prototype._make || function(){};

        make.apply(object, args);

        return object;
    };

    m.get = function(){ return object; };

    return m;
};

export var hasPrototype = function(object, prototype){
    var p = Object.getPrototypeOf(object);

    while(p !== null){
        if(typeof prototype == 'function')
            prototype = prototype.prototype;

        if(p == prototype)
            return true;
        else
            p = Object.getPrototypeOf(p);
    }

    return false;
};
