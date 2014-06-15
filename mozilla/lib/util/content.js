(function(w, d){
    w.self= {
        _handlers: [],
        emit : function(type, content){
            d.xCo.out(type, content);
        },
        on : function(type, handler){
            this._handlers.push({
                type : type,
                handler : handler
            });
        },
        _trigger : function(type, content){
            this._handlers.forEach(function(item){
                if(item.type == type)
                    item.handler(content);
            });
        }
    };
})(window, document);