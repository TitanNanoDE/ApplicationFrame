/** @lends Catalog# */
let Catalog = {

    /**
     * @private
     * @type {Function[]}
     */
    _listeners : null,

    /**
     * Stores key value pairs and emits events when ever a pair is assigned
     *
     * @constructs
     *
     * @return {void}
     */
    _make : function(){
        this._listeners = [];

        this._make = null;
    },

    /**
     * gives the ability to register an callback as soon as a event is fired
     *
     * @param  {string} event    the event to wait for
     * @param  {Function} listener the callback function
     *
     * @return {Promise} resloves when the event fires
     */
    on : function(event, listener){
        var self= this;

        return new Promise(function(success){
            if(listener.length > 0)
                self._listeners.push({ event : event, listener : listener, success : success });
            else
                success();
        });
    },

    /**
     * assigns a new pair
     *
     * @param {string} key   the key for the assignment
     * @param {*} value any value can be stored
     *
     * @return {void}
     */
    add : function(key, value){
        this[key]= value;
        var object= this;
        this._listeners.forEach(function(item){

            if(item.event == 'available'){
                var ready= 0;
                item.listener.forEach(function(item){
                    if(Object.keys(object).indexOf(item) > -1)
                        ready++;
                });

                if(ready == item.listener.length){
                    item.success();
                }
            }
        });
    }
};

export default Catalog;
