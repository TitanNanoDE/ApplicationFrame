export default {
    privateMap : null,

    _make : function(){
        this.privateMap = new WeakMap();
    },

    attributes : function(target, object){
        if(!object){
            return { public : target, private : this.privateMap.get(target) };
        }else{
            this.privateMap.set(target, object);
            return { public : target, private : object };
        }
    }
};
