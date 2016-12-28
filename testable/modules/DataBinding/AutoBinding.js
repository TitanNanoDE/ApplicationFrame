'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _make = require('../../util/make.js');

var _Binding = require('./Binding.js');

var _Binding2 = _interopRequireDefault(_Binding);

var _Parser = require('./Parser.js');

var _Template = require('./Template.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let AutoBinding = (0, _make.Make)( /** @lends module:DataBinding.AutoBinding.prototype*/{

    scopeName: '',

    /** @type {HTMLTemplateNode} */
    template: null,

    /** @type {boolean} */
    _isBound: false,

    /**
     * An auto binding instanciates a template and binds it
     * to a property of the current scope.
     *
     * @constructs
     * @extends module:DataBinding.Binding
     * @return {void}
     */
    _make: function () {},

    /** @type module:DataBinding.ScopePrototype */
    _scope: null,

    update: function (scope) {
        if (!this._isBound) {
            let subScope = (0, _Parser.parseExpression)(this.scopeName, scope);

            setTimeout(() => {
                let scopeHolder = null;
                let scopeObjName = null;

                if (this.scopeName.lastIndexOf('.') > 0) {
                    scopeHolder = this.scopeName.split('.');
                    scopeObjName = scopeHolder.pop();
                    scopeHolder = (0, _Parser.parseExpression)(scopeHolder.join('.'), scope);

                    scopeHolder[scopeObjName] = (0, _Template.makeTemplate)(this.template, subScope, true);

                    this._scope = scopeHolder[scopeObjName];
                } else {
                    this._scope = (0, _Template.makeTemplate)(this.template, subScope, true);
                }
            }, 0);

            this._isBound = true;
        }
    },

    /**
     * destroys this binding. This binding needs to be destroied before
     * it is deleted, since it creates a new scope.
     *
     * @return {void}
     */
    destory: function () {
        if (this._scope) {
            return this._scope.__destroy__(true);
        } else {
            return [0, 0];
        }
    }

}, _Binding2.default).get();

exports.default = AutoBinding;