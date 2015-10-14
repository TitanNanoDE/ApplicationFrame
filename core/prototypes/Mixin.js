import { Make } from '../../util/make.js';

var Mixin = function(){
};

var findProperty = function(prototypes, key) {
    for (var i = 0; i < this.prototypes.length; i++) {
        var item = this.prototypes[i];

        if (item[key]) {
            return item[key];
        }
    }

    return undefined;
};

var MixinTrap = {

    'get' : function(target, key) {
        var object = findProperty(target, key);

        return (object ? object[key] : null);
    },

    'set' : function(target, key, value) {
        var object = findProperty(target, key);

        if (object) {
            object[key] = value;
        }
    }
};
