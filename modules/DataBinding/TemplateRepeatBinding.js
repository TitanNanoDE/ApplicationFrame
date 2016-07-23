import { Make } from '../../util/make.js';
import { bindNode } from './Bind.js';
import { getPolyParent, polyInvoke } from './Util.js';
import { parseExpression } from './Parser.js';
import Binding from './Binding.js';

let AdvancedWeakMap = {
    _weakMapStore : null,
    _objFallBackStore : null,

    _make : function(){
        this._weakMapStore = new WeakMap();
        this._objFallBackStore = {};
    },

    get : function(object) {
        if (typeof object !== 'object') {
            return this._objFallBackStore[object];
        } else {
            return this._weakMapStore.get(object);
        }
    },

    set : function(object, value) {
        if (typeof object !== 'object') {
            return this._objFallBackStore[object] = value;
        } else {
            return this._weakMapStore.set(object, value);
        }
    },

    has : function(object) {
        if (typeof object !== 'object') {
            return object in this._objFallBackStore;
        } else {
            return this._weakMapStore.has(object);
        }
    },

    delete : function(object) {
        if (typeof object !== 'object') {
            delete this._objFallBackStore[object];
        } else {
            this._weakMapStore.delete(object);
        }
    }
}

let TemplateRepeatBinding = Make(/** @lends TemplateRepeatBinding.prototype*/{

    /**
     * @type {WeakMap<Node>}
     */
    itemNodeList : null,

    /**
     * @type {WeakMap<ScopePrototype>}
     */
    itemScopeList : null,

    /**
     * @type {Node}
     */
    template : null,

    /**
     * @type {Node}
     */
    marker : null,

    /**
     * @type {Array}
     */
    modelBackup : null,

    /**
     * @constructs
     * @extends {Binding}
     * @return {void}
     */
    _make : function(){
        Binding._make.apply(this);

        this.itemNodeList = Make(AdvancedWeakMap)();
        this.itemScopeList = Make(AdvancedWeakMap)();
        this.modelBackup = [];
    },

    renderItem : function(model, scope, itemName, cursor, polyParent, item, index){
        let node = null;

        if (this.itemNodeList.has(item)) {
            node = this.itemNodeList.get(item);
            let childScope = this.itemScopeList.get(item);

            childScope.$first = index === 0;
            childScope.$last = model.length -1 === index;
            childScope.$index = index;
        } else {
            let childScope = Make({
                $first : index === 0,
                $last : model.length-1 === index,
                $index : index,
                __parentScope__ : scope,
            }, scope).get();

            childScope[itemName] = item;

            node = document.importNode(this.template.content, true).firstElementChild;
            bindNode(node, childScope, true);

            this.itemNodeList.set(item, node);
            this.itemScopeList.set(item, childScope);
        }

        if (cursor.value && cursor.value.parentNode) {
            if (node !== cursor.value) {
                if (polyParent) {
                    polyInvoke(getPolyParent(cursor.value, polyParent)).insertBefore(node, cursor.value);
                } else {
                    polyInvoke(cursor.value.parentNode).insertBefore(node, cursor.value);
                }
            } else {
                cursor.value = cursor.value.nextElementSibling;
            }
        } else {
            if (polyParent) {
                polyInvoke(getPolyParent(this.marker.parentNode, polyParent)).appendChild(node);
            } else {
                polyInvoke(this.marker.parentNode).appendChild(node);
            }
        }
    },

    update : function(scope){
        let [itemName, link, expression] = this.originalNodeValue.split(' ');
        let model = parseExpression(expression, scope);
        let polyParent = this.template.getAttribute('bind-polymer-parent');

        if (link !== 'in') {
            console.console.error('DataBinding: invalide expression', this.originalNodeValue);
            return;
        }

        model = model && Array.isArray(model) ? model : [];

        this.modelBackup.forEach(item => {
            if (model.indexOf(item) < 0) {
                if (polyParent) {
                    polyInvoke(getPolyParent(this.marker, polyParent)).removeChild(this.itemNodeList.get(item));
                } else {
                    polyInvoke(this.marker.parentNode).removeChild(this.itemNodeList.get(item));
                    this.itemNodeList.delete(item);
                }
            }
        });

        this.modelBackup = model.slice();

        if (window.Polymer) {
            window.Polymer.dom.flush();
        }

        let cursor = {
            value : this.marker.nextElementSibling
        };

        model.forEach(this.renderItem.bind(this, model, scope, itemName, cursor, polyParent));
    },

    destory : function(){
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

}, Binding).get();

export default TemplateRepeatBinding;
