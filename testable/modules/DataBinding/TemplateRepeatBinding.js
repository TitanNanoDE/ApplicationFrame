'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _make = require('../../util/make.js');

var _Binding = require('./Binding.js');

var _Binding2 = _interopRequireDefault(_Binding);

var _Parser = require('./Parser.js');

var _Bind = require('./Bind.js');

var _Util = require('./Util.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let TemplateRepeatBinding = (0, _make.Make)( /** @lends module:DataBinding.TemplateRepeatBinding# */{

    /**
     * @type {WeakMap}
     */
    itemNodeList: null,

    /**
     * @type {WeakMap}
     */
    itemScopeList: null,

    /**
     * @type {Node}
     */
    template: null,

    /**
     * @type {Node}
     */
    marker: null,

    /**
     * @type {Array}
     */
    modelBackup: null,

    /**
     * @constructs
     * @extends {Binding}
     * @return {void}
     */
    _make: function () {
        _Binding2.default._make.apply(this);

        this.itemNodeList = new Map();
        this.itemScopeList = new Map();
        this.modelBackup = [];
    },

    /**
     * renders one model item to the DOM
     *
     * @param  {*} model      [description]
     * @param  {ScopePrototype} scope      [description]
     * @param  {string} itemName   [description]
     * @param  {DocumentFragment} fragment   [description]
     * @param  {Node} polyParent [description]
     * @param  {Object} item       [description]
     * @param  {number} index      [description]
     * @return {void}            [description]
     */
    renderItem: function (model, scope, itemName, fragment, polyParent, item, index) {
        let node = null;

        if (this.itemNodeList.has(item)) {
            node = this.itemNodeList.get(item);
            let childScope = this.itemScopeList.get(item);

            childScope.$first = index === 0;
            childScope.$last = model.length - 1 === index;
            childScope.$index = index;
        } else {
            let childScope = (0, _make.Make)({
                $first: index === 0,
                $last: model.length - 1 === index,
                $index: index,
                __parentScope__: scope
            }, scope).get();

            childScope[itemName] = item;

            node = document.importNode(this.template.content, true).firstElementChild;
            (0, _Bind.bindNode)(node, childScope, true);

            this.itemNodeList.set(item, node);
            this.itemScopeList.set(item, childScope);
        }

        fragment.appendChild(node);
    },

    update: function (scope) {
        let [itemName, link, expression] = this.originalNodeValue.split(' ');
        let model = (0, _Parser.parseExpression)(expression, scope);
        let polyParent = this.template.getAttribute('bind-polymer-parent');
        let dirty = false;

        if (link !== 'in') {
            console.console.error('DataBinding: invalide expression', this.originalNodeValue);
            return;
        }

        model = model && Array.isArray(model) ? model : [];
        dirty = this.modelBackup.length !== model.length;

        if (!dirty) {
            for (let i = 0; i < model.length; i++) {
                if (model[i] !== this.modelBackup[i]) {
                    dirty = true;
                    break;
                }
            }
        }

        if (dirty) {
            this.modelBackup.forEach(item => {
                if (model.indexOf(item) < 0) {
                    if (polyParent) {
                        (0, _Util.polyInvoke)((0, _Util.getPolyParent)(this.marker, polyParent)).removeChild(this.itemNodeList.get(item));
                    } else {
                        let node = this.itemNodeList.get(item);

                        // if the node doesn't exist something went totally wrong... but it happens :/
                        if (node) {
                            (0, _Util.polyInvoke)(this.marker.parentNode).removeChild(node);
                        }
                    }

                    this.itemScopeList.delete(item);
                    this.itemNodeList.delete(item);
                }
            });

            this.modelBackup = model.slice();

            if (window.Polymer) {
                window.Polymer.dom.flush();
            }

            /** @type {DocumentFragment} */
            let fragment = new DocumentFragment();

            model.forEach(this.renderItem.bind(this, model, scope, itemName, fragment, polyParent));

            if (this.marker.nextElementSibling) {
                if (polyParent) {
                    (0, _Util.polyInvoke)((0, _Util.getPolyParent)(this.marker, polyParent)).insertBefore(fragment, this.marker.nextElementSibling);
                } else {
                    (0, _Util.polyInvoke)(this.marker.parentNode).insertBefore(fragment, this.marker.nextElementSibling);
                }
            } else {
                if (polyParent) {
                    (0, _Util.polyInvoke)((0, _Util.getPolyParent)(this.marker, polyParent)).appendChild(fragment);
                } else {
                    (0, _Util.polyInvoke)(this.marker.parentNode).appendChild(fragment);
                }
            }

            scope.__apply__();
        }
    },

    destory: function () {
        let count = this.modelBackup.reduce((prev, item) => {
            let [scopes, bindings] = prev;
            let scope = this.itemScopeList.get(item);
            let [scopes_add, bindings_add] = scope.__destroy__(true);

            return [scopes + scopes_add, bindings + bindings_add];
        }, [0, 0]);

        this.itemScopeList = null;
        this.itemNodeList = null;

        return count;
    }

}, _Binding2.default).get();

exports.default = TemplateRepeatBinding;