import { Make } from '../../util/make.js';
import Binding from './Binding.js';
import { parseExpression } from './Parser.js';
import { bindNode } from './Bind.js';
import { polyMask, getPolyParent } from './Util.js';

let TemplateRepeatBinding = Make(/** @lends TemplateRepeatBinding.prototype*/{

    /**
     * @type {WeakMap<Node>}
     */
    itemNodeList : null,

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
     */
    _make : function(){
        Binding._make.apply(this);

        this.itemNodeList = new WeakMap();
        this.modelBackup = [];
    },

    update : function(scope){
        let [itemName, link, expression] = this.originalNodeValue.split(' ');
        let model = parseExpression(expression, scope);
        let polyParent = this.template.getAttribute('bind-polymer-parent');

        if (link !== 'in') {
            console.console.error('DataBinding: invalide expression', this.originalNodeValue);
            return;
        }

        if (Array.isArray(model)) {

            this.modelBackup.forEach(item => {
                if (model.indexOf(item) < 0) {
                    if (polyParent) {
                        getPolyParent(this.marker, polyParent).removeChild(this.itemNodeList.get(item));
                    } else {
                        polyMask(this.marker.parentNode).removeChild(this.itemNodeList.get(item));
                        this.itemNodeList.delete(item);
                    }
                }
            });

            this.modelBackup = model.slice();

            if (window.Polymer) {
                window.Polymer.dom.flush();
            }

            let cursor = this.marker.nextElementSibling;

            model.forEach((item, index) => {
                let node = null;

                if (this.itemNodeList.has(item)) {
                    node = this.itemNodeList.get(item);
                } else {
                    /**
                     * @todo update this meta info on each recycle not only when we create a new scope.
                     */
                    let childScope = Make({
                        $first : index === 0,
                        $last : model.length-1 === index,
                        $index : index
                    }, scope).get();

                    childScope[itemName] = item;

                    node = this.template.content.cloneNode(true).firstElementChild;
                    bindNode(node, childScope, true);

                    this.itemNodeList.set(item, node);
                }

                if (cursor && cursor.parentNode){
                    if (node !== cursor) {
                        if (polyParent) {
                            getPolyParent(cursor.parentNode, polyParent).insertBefore(node, cursor);
                        } else {
                            polyMask(cursor.parentNode).insertBefore(node, cursor);
                        }
                    } else {
                        cursor = cursor.nextElementSibling;
                    }
                } else {
                    if (polyParent) {
                        getPolyParent(this.marker.parentNode, polyParent).appendChild(node);
                    } else {
                        polyMask(this.marker.parentNode).appendChild(node);
                    }
                }
            });
        }
    }

}, Binding).get();

export default TemplateRepeatBinding;
