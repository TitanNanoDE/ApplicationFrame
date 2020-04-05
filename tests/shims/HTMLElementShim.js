const HTMLElementShim = {
    _meta: {
        invocations: [],
    },

    constructor: function HTMLElementShim() {
        this._meta.invocations.push(this);
    }
};

HTMLElementShim.constructor.prototype = HTMLElementShim;

module.exports = HTMLElementShim.constructor;
