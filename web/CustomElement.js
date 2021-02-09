import { HTMLElement } from '../core/nativePrototype';

const symbolsStore = new WeakMap();
const pCreate = Symbol('CustomElement.create');

const getAttributeCallbackName = function(attributeName) {
    return `on${attributeName[0].toUpperCase()}${attributeName.substring(1)}Changed`;

};

const invokeCallback = function(attributeSymbols, attribute, element, newValue, oldValue) {
    const callback = attributeSymbols[getAttributeCallbackName(attribute)];

    if (!element[callback] || typeof element[callback] !== 'function') {
        return newValue;
    }

    return element[callback](newValue, oldValue);
};

const normalizeAttributeConfig = function(config) {
    if (typeof config === 'string') {
        config = { type: config };
    }

    config = Object.assign({ type: 'string', reflectChanges: false }, config);

    return config;
};

const typeCast = function(value, type) {
    if (type === 'string') {
        return value.toString();
    }

    if (type === 'boolean') {
        return value !== null && value !== undefined && value !== false;
    }

    if (type === 'number') {
        return parseFloat(value) || 0;
    }

    if (type === 'int') {
        return parseInt(value) || 0;
    }

    return value;
};

const reflectToAttribute = function(attribute, element, value, type) {
    if (!value) {
        element.removeAttribute(attribute);

        return;
    }

    if (type === 'boolean') {
        element.setAttribute(attribute, '');

        return;
    }

    element.setAttribute(attribute, value);
};

export const CustomElementMeta = {

    attributes: {},

    name: 'unnamed-custom-element',

    prepare(prototype) {
        if (prototype.constructor === CustomElement.constructor) {
            const constructorName = this.name.split('-')
                .map(word => word[0].toUpperCase() + word.substr(0))
                .join('');

            prototype.constructor = function(...args) {
                return CustomElement.constructor.apply(this, args);
            };

            Object.defineProperty(prototype.constructor, 'name', {
                value: constructorName,
                writable: false
            });
        }

        prototype.constructor.prototype = prototype;

        Object.defineProperty(prototype.constructor, 'observedAttributes', {
            value: Object.keys(this.attributes),
            writable: false,
        });

        const attributeSymbols = this.symbols;

        Object.entries(this.attributes).forEach(([attribute, config]) => {
            const privateAttributeStore = attributeSymbols[attribute];

            config = normalizeAttributeConfig(config);

            prototype[privateAttributeStore] = null;

            Object.defineProperty(prototype, attribute, {
                get() {
                    return this[privateAttributeStore];
                },

                set(value) {
                    const old = this[privateAttributeStore];

                    value = typeCast(value, config.type);

                    if (this[attributeSymbols.onPropertyChanged]) {
                        this[attributeSymbols.onPropertyChanged](attribute, old, value);
                    }

                    value = invokeCallback(attributeSymbols, attribute, this, value, old);

                    this[privateAttributeStore] = value;

                    if (config.reflectChanges) {
                        reflectToAttribute(attribute, this, value, config.type);
                    }
                }
            });
        });

        return prototype;
    },

    get symbols() {
        const store = symbolsStore.has(this) ? symbolsStore.get(this) : {};

        if (!store.onPropertyChanged) {
            store.onPropertyChanged = Symbol(`${this.name}.onPropertyChanged`);
        }

        if (!store.create) {
            store.create = pCreate;
        }

        Object.keys(this.attributes)
            .forEach(name => {
                if (store[name]) {
                    return;
                }

                const callbackName = getAttributeCallbackName(name);

                store[name] = Symbol(`${this.name}.${name}`);
                store[callbackName] = Symbol(`${this.name}.${callbackName}`);
            });

        symbolsStore.set(this, store);

        return Object.assign({}, store);
    }
};

export const CustomElement = {

    constructor: function CustomElement() {
        const instance = HTMLElement.constructor.apply(this);

        instance[pCreate]();

        return instance;
    },

    [pCreate]() {},

    attributeChangedCallback(attribute, oldValue, newValue) {
        if (!(attribute in this) || this[attribute] === newValue) {
            return;
        }

        this[attribute] = newValue;
    },

    connectedCallback() {
        Array.from(this.attributes)
            .forEach(attribute => {
                const oldValue = this[attribute.name];
                const newValue = attribute.value;

                if (oldValue === newValue) {
                    return;
                }

                this.attributeChangedCallback(attribute.name, oldValue, newValue);
            });
    },

    __proto__: HTMLElement,
};

export default CustomElement;
