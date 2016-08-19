import { DataBinding } from '../DataBinding.js';
import { Make } from '../../util/make.js';
import { polyInvoke } from './Util.js';
import RenderEngine from './RenderEngine';

const LIST_HAS_ITEMS = 0;

/**
 * @lends {ViewPortInstance.Prototype}
 */
let ViewPortInstance = {
    _scope : null,
    _bound : false,
    _innerScope : null,
    _originalTemplate : null,

    /** @type {Application} */
    _application : null,

    /**
     * @constructs
     * @param  {ScopePrototype} scope    the scope of this viewport instance
     * @param  {Application} application the application this viewport instance belongs to
     * @return {[type]}             [description]
     */
    _make : function(scope, application) {
        this._scope = scope;
        this._application = application;
    },

    bind : function(context) {
        return new Promise((done, error) => {
            if (!this._bound) {
                RenderEngine.schedulePostRenderTask(() => {
                    this._scope.templateUrl = context.template;
                    this._scope.overflow = '';
                    this._scope.__apply__();

                    if (!this._originalTemplate) {
                        this._originalTemplate = this._scope.element.firstElementChild;
                    }

                    this._innerScope = DataBinding.makeTemplate(
                        this._originalTemplate,
                        context.scope || {},
                        this._application,
                        this._scope
                    );

                    this._bound = true;

                    context.scope = this._innerScope;

                    done(this);
                });
            } else {
                error('ViewPort: viewport is already bound!');
            }
        });
    },

    update : function(...args) {
        return this._innerScope.__apply__(...args);
    },

    get scope() {
        return this._innerScope;
    },

    destory : function(){
        if (this._bound) {
            this._innerScope.__destroy__();

            while (this._scope.element.children.length > LIST_HAS_ITEMS) {
                polyInvoke(this._scope.element).removeChild(this._scope.element.firstChild);
            }

            polyInvoke(this._scope.element).appendChild(this._originalTemplate);
            this._bound = false;
            this._originalTemplate.processed = false;
        }
    },

    alowOverflow : function() {
        this._scope.overflow = 'overflow';
        this._scope.__apply__();
    },
};

let ViewPort = {

    _elements : new Map(),

    /** @type {Application} */
    _application : null,

    /**
     * @constructs
     * @param {Application} application - the application this viewport belongs to.
     * @return {void}
     */
    _make : function(application){
        let style = polyInvoke(document.head).appendChild(document.createElement('style'));
        let template = document.createElement('template');

        polyInvoke(style).innerHTML = `
            .view-port {
                position: relative;
                left: 0;
                top: 0;
                height: 100%;
                width: 100%;
                display: flex;
                flex-direction: column;
                overflow: auto;
            }

            .view-port.overflow {
                overflow: visible;
            }
        `;

        template.id = 'view-port';
        polyInvoke(template).setAttribute('bind-element', '');
        polyInvoke(template).setAttribute('component', '');

        polyInvoke(template).innerHTML = `
            <div class="custom-element {{overflow}}">
                <template src="templateUrl" replace></template>
            </div>
        `;

        application.on('newElement:view-port', (scope) => {
            this._elements[scope.name] = Make(ViewPortInstance)(scope, application);
            application.emit(`viewPort:ready:${scope.name}`);
        });

        this._application = application;

        DataBinding.makeTemplate(template, () => { return {} }, application);
    },

    getInstance : function(name){
        return new Promise((success) => {
            if (this._elements[name]) {
                success(this._elements[name]);
            } else {
                this._application.on(`viewPort:ready:${name}`, () => success(this._elements[name]));
            }
        });
    },

    free : function(instance){
        this._elements[instance._scope.name] = null;

        instance._scope.__destroy__();
    }
};

export default ViewPort;
