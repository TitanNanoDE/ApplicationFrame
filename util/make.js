export var Make = function(object, prototype) {
    if(arguments.length < 2){
        prototype = object;
        object = {};
    }

    Object.setPrototypeOf(object, prototype);


    return function(...args){
        var make = prototype.make || prototype._make || function(){};

        make.apply(object, args);

        return object;
    };
};

export var hasPrototype = function(object, prototype){
    var p = Object.getPrototypeOf(object);
    while(p !== null){
        if(p == prototype)
            return true;
        else
            p = Object.getPrototypeOf(p);
    }

    return false;
};
