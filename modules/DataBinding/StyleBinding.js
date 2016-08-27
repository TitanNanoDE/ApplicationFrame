/**
 * @module DataBinding/StyleBinding
 */

import { Make } from '../../util/make';
import { ObjectParser, assignExpression } from './Parser';

import Binding from './Binding';
import RenderEngine from './RenderEngine';

/**
 * @param {StyleBinding} container - binding container
 * @param {ScopePrototype} scope - the scope for this binding
 * @return {void}
 */
let readStyleProperties = function(container, scope) {
    Object.keys(container.bindings).forEach(styleKey => {
        let style = window.getComputedStyle(container.parentNode);
        let dimensions = container.parentNode.getBoundingClientRect();

        if(styleKey.split('.')[0] === 'dimensions') {
            let value = dimensions[styleKey.split('.')[1]];

            assignExpression(container.bindings[styleKey], scope, value);
        } else {
            assignExpression(container.bindings[styleKey], scope, style[styleKey]);
        }
    });
}

let StyleBinding = Make(/** @lends module:DataBinding/StyleBinding~StyleBinding# */{
    bindings: null,

    /**
     * @constructs
     * @extends {module:DataBinding.Binding}
     *
     * @return {void}
     */
    _make: function() {
        this.bindings = ObjectParser(this.bindings);
    },

    update: function(scope) {
        RenderEngine.schedulePostRenderTask(readStyleProperties.bind(null, this, scope));
    }
}, Binding).get();

/**
 * @member StyleBinding
 * @type {module:DataBinding/StyleBinding~StyleBinding}
 * @static
 */
export default StyleBinding;
