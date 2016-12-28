'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _DataBinding = require('../DataBinding.js');

var _make = require('../../util/make.js');

var _Util = require('./Util.js');

var _RenderEngine = require('./RenderEngine');

var _RenderEngine2 = _interopRequireDefault(_RenderEngine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @module DataBinding/ViewPort
 */

const LIST_HAS_ITEMS = 0;

/** @lends module:DataBinding/ViewPort.ViewPortInstance# */
let ViewPortInstance = {

    /**
     * @private
     * @type {module:DataBinding.ScopePrototype}
     */
    _scope: null,

    /**
     * @private
     * @type {boolean}
     */
    _bound: false,

    /**
     * @private
     * @type {module:DataBinding.ScopePrototype}
     */
    _innerScope: null,

    /**
     * @private
     * @type {HTMLTemplateElement}
     */
    _originalTemplate: null,

    /**
     * @private
     * @type {Application}
     */
    _application: null,

    /**
     * @constructs
     *
     * @param  {module:DataBinding.ScopePrototype} scope    the scope of this viewport instance
     * @param  {Application} application the application this viewport instance belongs to
     *
     * @return {void}
     */
    _make: function (scope, application) {
        this._scope = scope;
        this._application = application;
    },

    /**
     * binds the ViewPort to a scope so it can be filled with content
     *
     * @param  {Object} context a collection of properties to configure the viewport
     *
     * @return {Promise.<module:DataBinding/ViewPort.ViewPortInstance>}  promise for when the viewport is bound
     */
    bind: function (context) {
        return new Promise((done, error) => {
            if (!this._bound) {
                _RenderEngine2.default.schedulePostRenderTask(() => {
                    this._scope.templateUrl = context.template;
                    this._scope.overflow = '';
                    this._scope.__apply__();

                    if (!this._originalTemplate) {
                        this._originalTemplate = this._scope.element.firstElementChild;
                    }

                    this._innerScope = _DataBinding.DataBinding.makeTemplate(this._originalTemplate, context.scope || {}, this._application, this._scope);

                    this._bound = true;

                    context.scope = this._innerScope;

                    done(this);
                });
            } else {
                error('ViewPort: viewport is already bound!');
            }
        });
    },

    /**
     * updates the inner scope of the viewport
     *
     * @param  {...*} args arguments to be passed on to {@link module:DataBinding.ScopePrototype#__apply__}
     *
     * @return {void}
     */
    update: function (...args) {
        return this._innerScope.__apply__(...args);
    },

    /**
     * the scope if ViewPort content
     *
     * @type {module:DataBinding.ScopePrototype}
     */
    get scope() {
        return this._innerScope;
    },

    destory: function () {
        if (this._bound) {
            this._innerScope.__destroy__();

            while (this._scope.element.children.length > LIST_HAS_ITEMS) {
                (0, _Util.polyInvoke)(this._scope.element).removeChild(this._scope.element.firstChild);
            }

            (0, _Util.polyInvoke)(this._scope.element).appendChild(this._originalTemplate);
            this._bound = false;
            this._originalTemplate.processed = false;
        }
    },

    /**
     * enables the viewport content to overflow the viewports bounds
     *
     * @return {void}
     */
    alowOverflow: function () {
        this._scope.overflow = 'overflow';
        this._scope.__apply__();
    }
};

/**
 * the interface for the ViewPort module
 *
 * @namespace
 * @static
 */
let ViewPort = {

    /**
     * all instanciated ViewPorts
     *
     * @private
     * @type {Map.<module:DataBinding.ScopePrototype>}
     */
    _elements: new Map(),

    /**
     * the applicaion the viewports are registered to
     *
     * @private
     * @type {Application}
     */
    _application: null,

    /**
     * @constructs
     * @param {Application} application - the application this viewport belongs to.
     * @return {void}
     */
    _make: function (application) {
        let style = (0, _Util.polyInvoke)(document.head).appendChild(document.createElement('style'));
        let template = document.createElement('template');

        (0, _Util.polyInvoke)(style).innerHTML = `
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
        (0, _Util.polyInvoke)(template).setAttribute('bind-element', '');
        (0, _Util.polyInvoke)(template).setAttribute('component', '');

        (0, _Util.polyInvoke)(template).innerHTML = `
            <div class="custom-element {{overflow}}">
                <template src="templateUrl" replace></template>
            </div>
        `;

        application.on('newElement:view-port', scope => {
            this._elements[scope.name] = (0, _make.Make)(ViewPortInstance)(scope, application);
            application.emit(`viewPort:ready:${ scope.name }`);
        });

        this._application = application;

        _DataBinding.DataBinding.makeTemplate(template, () => {
            return {};
        }, application);
    },

    /**
     * fetches a viewPort instance by a name
     *
     * @param  {string} name the name to look for
     *
     * @return {Promise.<module:DataBinding.ScopePrototype>}  the matching scope
     */
    getInstance: function (name) {
        return new Promise(success => {
            if (this._elements[name]) {
                success(this._elements[name]);
            } else {
                this._application.on(`viewPort:ready:${ name }`, () => success(this._elements[name]));
            }
        });
    },

    /**
     * destorys an viewPort instance
     *
     * @param  {module:DataBinding/ViewPort.ViewPortInstance} instance the instance to destroy
     *
     * @return {void}
     */
    free: function (instance) {
        this._elements[instance._scope.name] = null;

        instance._scope.__destroy__();
    }
};

exports.default = ViewPort;