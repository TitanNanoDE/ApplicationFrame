import { Make } from '../../util/make.js';
import { parseExpression } from './Parser.js';
import Binding from './Binding.js';
import RenderEngine from './RenderEngine';

let ClassBinding = Make(/** @lends module:DataBinding.ClassBinding.prototype */{

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
     * @extends {module:DataBinding.Binding}
     */
    _make : Binding._make,

    /**
     * applies a class to the parent node, based on the binding values.
     *
     * @param  {module:DataBinding.ScopePrototype} scope the scope to operate on.
     * @param  {Object} classes class-expression-map
     * @param  {string} key     the class name to apply
     *
     * @return {void}
     */
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

        let applyAssync = Object.keys(classes).filter(key => key.indexOf('!') !== 0);

        if (applyAssync.length > 0) {
            RenderEngine.scheduleRenderTask(() => {
                applyAssync.forEach(this.applyClass.bind(this, scope, classes));
            });
        }
    }

}, Binding).get();

export default ClassBinding;
