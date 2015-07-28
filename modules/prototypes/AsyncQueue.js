export default {
    queue : null,
    active : false,
    processor : null,

    _make : function(processor){
        this._processor = processor;

        this._make = null;
    },

    next : function(){
        if(this.queue.length > 0){
            this.integrate(...this.queue.shift());
            this.next();
        }else{
            this.active= false;
        }
    },

    push : function(...args){
        var self= this;
		return new Promise(function(done){
            args.push(done);
            this.queue.push(args);

            if(!this.active){
                this.active= true;
                this.next();
            }
		}.bind(this)).then(value => self.next());
	}
};
