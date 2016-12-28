'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _make = require('../../util/make');

var _Parser = require('./Parser');

var _Binding = require('./Binding');

var _Binding2 = _interopRequireDefault(_Binding);

var _RenderEngine = require('./RenderEngine');

var _RenderEngine2 = _interopRequireDefault(_RenderEngine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @param {StyleBinding} container - binding container
 * @param {ScopePrototype} scope - the scope for this binding
 * @return {void}
 */
/**
 * @module DataBinding/StyleBinding
 */

let readStyleProperties = function (container, scope) {
    Object.keys(container.bindings).forEach(styleKey => {
        let style = window.getComputedStyle(container.parentNode);
        let dimensions = container.parentNode.getBoundingClientRect();

        if (styleKey.split('.')[0] === 'dimensions') {
            let value = dimensions[styleKey.split('.')[1]];

            (0, _Parser.assignExpression)(container.bindings[styleKey], scope, value);
        } else {
            (0, _Parser.assignExpression)(container.bindings[styleKey], scope, style[styleKey]);
        }
    });
};

let StyleBinding = (0, _make.Make)( /** @lends module:DataBinding/StyleBinding~StyleBinding# */{
    bindings: null,

    /**
     * @constructs
     * @extends {module:DataBinding.Binding}
     *
     * @return {void}
     */
    _make: function () {
        this.bindings = (0, _Parser.ObjectParser)(this.bindings);
    },

    update: function (scope) {
        _RenderEngine2.default.schedulePostRenderTask(readStyleProperties.bind(null, this, scope));
    }
}, _Binding2.default).get();

/**
 * @member StyleBinding
 * @type {module:DataBinding/StyleBinding~StyleBinding}
 * @static
 */
exports.default = StyleBinding;