import { Make } from '../../util/make.js';
import { parseExpression } from './Parser.js';
import Binding from './Binding.js';
import RenderEngine from './RenderEngine';

let ClassBinding = Make(/** @lends ClassBinding.prototype*/{

    /**
     * @type {Object}
     */
    classes : null,

    /**
     * @type {Node}
     */
    parentNode : null,

    /**
     * @constructs
     * @extends {Binding}
     */
    _make : Binding._make,

    applyClass : function(scope, classes, key) {
        let expression = classes[key];
        let value = parseExpression(expression, scope);

        key = (key[0] === '!') ? key.substr(1) : key;

        if (value) {
            this.parentNode.classList.add(key);
        } else {
            this.parentNode.classList.remove(key);
        }
    },

    update : function(scope){
        let classes = JSON.parse(JSON.stringify(this.classes));

        Object.keys(classes)
            .filter(key => key.indexOf('!') === 0)
            .forEach(this.applyClass.bind(this, scope, classes));

        RenderEngine.scheduleRenderTask(() => {
            Object.keys(classes)
                .filter(key => key.indexOf('!') !== 0)
                .forEach(this.applyClass.bind(this, scope, classes));
        });
    }

}, Binding).get();

export default ClassBinding;
