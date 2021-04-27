const HTMLElementShim = {
    _meta: {
        invocations: [],
    },

    _attributes: null,

    setAttribute(name, value) {
        const oldValue = this._attributes.get(name);

        this._attributes.set(name, value);

        if (this.attributeChangedCallback) {
            this.attributeChangedCallback(name, oldValue, value);
        }
    },

    removeAttribute(name) {
        const oldValue = this._attributes.get(name);

        this._attributes.delete(name);

        if (this.attributeChangedCallback) {
            this.attributeChangedCallback(name, oldValue, null);
        }
    },

    getAttribute(name) {
        return this._attributes.get(name);
    },

    constructor: function HTMLElementShim() {
        this._meta.invocations.push(this);
        this._attributes = new Map();
    }
};

HTMLElementShim.constructor.prototype = HTMLElementShim;

module.exports = HTMLElementShim.constructor;
