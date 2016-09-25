import { Make } from '../../util/make.js';
import { ObjectParser, parseExpression } from './Parser.js';
import Binding from './Binding.js';
import BindingRegistry from './BindingRegistry.js';

const AttributeBinding = Make({

    name: 'bind-attr',

    config: null,

    _make: function({ parentNode, scopeInfo, text }) {
        Binding._make.apply(this);

        this.parentNode = parentNode;
        this.config = ObjectParser(text);

        scopeInfo.bindings.push(this);
    },

    update: function(scope) {
        let attrName = this.config.name;
        let attrValue = this.config.value ? parseExpression(this.config.value, scope) : '';
        let attrEnabled = this.config.enabled ? parseExpression(this.config.enabled, scope) : true;


        if (attrEnabled) {
            this.parentNode.setAttribute(attrName, attrValue);
        } else {
            this.parentNode.removeAttribute(attrName);
        }
    }

}, Binding).get();

BindingRegistry.register(AttributeBinding);

export default AttributeBinding;
