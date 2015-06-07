export var Make = function(object, prototype) {
    if(arguments.length < 2){
        prototype = object;
        object = {};
    }

    Object.setPrototye(object, prototype);


    return function(...args){
        var make = prototype.make || prototype._make || function(){};

        make.apply(object, args);

        return object;
    };
};
