'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _make = require('../../util/make.js');

var _Parser = require('./Parser.js');

var _Binding = require('./Binding.js');

var _Binding2 = _interopRequireDefault(_Binding);

var _RenderEngine = require('./RenderEngine');

var _RenderEngine2 = _interopRequireDefault(_RenderEngine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let ClassBinding = (0, _make.Make)( /** @lends module:DataBinding.ClassBinding.prototype */{

    /**
     * @type {Object}
     */
    classes: null,

    /**
     * @type {Node}
     */
    parentNode: null,

    /**
     * @constructs
     * @extends {module:DataBinding.Binding}
     */
    _make: _Binding2.default._make,

    /**
     * applies a class to the parent node, based on the binding values.
     *
     * @param  {module:DataBinding.ScopePrototype} scope the scope to operate on.
     * @param  {Object} classes class-expression-map
     * @param  {string} key     the class name to apply
     *
     * @return {void}
     */
    applyClass: function (scope, classes, key) {
        let expression = classes[key];
        let value = (0, _Parser.parseExpression)(expression, scope);

        key = key[0] === '!' ? key.substr(1) : key;

        if (value) {
            this.parentNode.classList.add(key);
        } else {
            this.parentNode.classList.remove(key);
        }
    },

    update: function (scope) {
        let classes = JSON.parse(JSON.stringify(this.classes));

        Object.keys(classes).filter(key => key.indexOf('!') === 0).forEach(this.applyClass.bind(this, scope, classes));

        let applyAssync = Object.keys(classes).filter(key => key.indexOf('!') !== 0);

        if (applyAssync.length > 0) {
            _RenderEngine2.default.scheduleRenderTask(() => {
                applyAssync.forEach(this.applyClass.bind(this, scope, classes));
            });
        }
    }

}, _Binding2.default).get();

exports.default = ClassBinding;