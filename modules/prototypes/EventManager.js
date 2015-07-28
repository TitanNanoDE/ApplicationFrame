export default {
    listeners : null,

    _make : function(){
        this.listeners = [];

        this._make = null;
    },

	addEventListener : function(type, listener, useCapture){
		this.listeners.push({
			type : type,
			listener : listener,
			useCapture : useCapture
		});
	},

	dispatchEvent : function(event){
		this.listeners.forEach(item => {
			if(item.type === event.type){
				item.listener(event);
			}
		});
	}
};
