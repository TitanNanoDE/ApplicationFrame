import { Make } from '../../util/make.js';
import Binding from './Binding.js';
import { parseExpression } from './Parser.js';
import { bindNode } from './Bind.js';
import { polyInvoke, getPolyParent } from './Util.js';

let TemplateRepeatBinding = Make(/** @lends TemplateRepeatBinding.prototype*/{

    /**
     * @type {WeakMap}
     */
    itemNodeList : null,

    /**
     * @type {WeakMap}
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
     * @param  {[type]} polyParent [description]
     * @param  {[type]} item       [description]
     * @param  {[type]} index      [description]
     * @return {[type]}            [description]
     */
    renderItem : function(model, scope, itemName, fragment, polyParent, item, index){
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

        fragment.appendChild(node);
    },

    update : function(scope){
        let [itemName, link, expression] = this.originalNodeValue.split(' ');
        let model = parseExpression(expression, scope);
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
                        polyInvoke(getPolyParent(this.marker, polyParent)).removeChild(this.itemNodeList.get(item));
                    } else {
                        polyInvoke(this.marker.parentNode).removeChild(this.itemNodeList.get(item));
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
                    polyInvoke(getPolyParent(this.marker, polyParent)).insertBefore(fragment, this.marker.nextElementSibling);
                } else {
                    polyInvoke(this.marker.parentNode).insertBefore(fragment, this.marker.nextElementSibling);
                }
            } else {
                if (polyParent) {
                    polyInvoke(getPolyParent(this.marker, polyParent)).appendChild(fragment);
                } else {
                    polyInvoke(this.marker.parentNode).appendChild(fragment);
                }
            }
        }
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
