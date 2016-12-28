'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.makeTemplate = undefined;

var _make = require('../../util/make.js');

var _Bind = require('./Bind.js');

var _Util = require('./Util.js');

var _TemplateLoader = require('./TemplateLoader.js');

var _Parser = require('./Parser');

var _RenderEngine = require('./RenderEngine');

var _RenderEngine2 = _interopRequireDefault(_RenderEngine);

var _ScopePrototype = require('./ScopePrototype.js');

var _ScopePrototype2 = _interopRequireDefault(_ScopePrototype);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Instanciates a template based on a specified element.
 *
 * @param  {HTMLTemplateElement}               template    the template to instanciate
 * @param  {module:DataBinding.ScopePrototype} scope       the scope to operate on
 * @param  {Application}                       application the application this binding belongs to
 * @param  {Node}                              item        the original node
 *
 * @return {void}
 */
let makeElementFromTemplate = function (template, scope, application, item) {
    _RenderEngine2.default.schedulePostRenderTask(() => {
        let node = document.importNode(template.content, true);
        let placeholder = node.querySelector('bind-placeholder');

        item.attributes.forEach(attr => {
            (0, _Util.polyInvoke)(node.firstElementChild).setAttribute(attr.name, attr.value);
        });

        if (placeholder) {
            let node = item.firstElementChild;
            (0, _Util.polyInvoke)(placeholder.parentNode).replaceChild(item.firstElementChild, placeholder);

            [].forEach.apply(item.children, [item => {
                (0, _Util.polyInvoke)(node.parentNode).appendChild(item);
            }]);
        }

        node.firstElementChild.className = template.id + ' ' + node.firstElementChild.className;

        scope = scope();

        [].map.apply(node.firstElementChild.attributes, [item => {
            if (item.name.search(/^scope\-/) > -1) {
                scope[item.name.replace(/^scope\-/, '')] = item.value;
            }
        }]);

        if (template.hasAttribute('component')) {
            scope.element = node.firstElementChild;
        }

        scope = (0, _Bind.bindNode)(node, scope);

        (0, _Util.polyInvoke)(item.parentNode).replaceChild(node, item);

        if (application) {
            application.emit(`newElement:${ template.id }`, scope);
        }
    });
};

/**
 * creates a new instance of an HTML template and applies the binding with
 * the given scope.
 *
 * @function
 *
 * @param {Node|string} template - the template to render
 * @param {ScopePrototype} scope - the scope for this template to bind to
 * @param {Application} [application] - the application this template belongs to
 * @param {ScopePrototype} [parentScope] - the surounding scope of this template node
 *
 * @return {Object} - collection of scope and rendered element
 */
/**
 * @module DataBinding/Template
 */

let makeTemplate = exports.makeTemplate = function (template, scope, application, parentScope) {
    template = typeof template === 'string' ? document.querySelector(template) : template;

    if (template.hasAttribute('src') && !template.processed) {
        let source = template.getAttribute('src');

        if (parentScope) {
            let value = (0, _Parser.parseExpression)(source, parentScope);

            source = value && value != '' ? value : source;
        }

        scope = (0, _make.Make)(scope, _ScopePrototype2.default)();

        (0, _TemplateLoader.importTemplate)(source, template).then(template => {
            template.processed = true;
            makeTemplate(template, scope, application, parentScope);
        });

        return scope;
    } else if (template.hasAttribute('bind-element')) {
        let makeElement = makeElementFromTemplate.bind(this, template, scope, application);
        let list = document.querySelectorAll(template.id);

        [].forEach.apply(list, [makeElement]);

        new MutationObserver(mutations => {
            mutations.forEach(item => {
                if (item.addedNodes.length > 0) {
                    let list = [].map.apply(item.addedNodes, [node => {
                        return node.querySelectorAll ? [].slice.apply(node.querySelectorAll(template.id)) : [];
                    }]).reduce((prev, next) => prev.concat(next), []);

                    list = list.concat([].filter.apply(item.addedNodes, [node => node.localName === template.id]));

                    [].forEach.apply(list, [makeElement]);
                }
            });
        }).observe(document.body, {
            childList: true,
            subtree: true
        });
    } else {
        let node = document.importNode(template.content, true);
        let isReplace = template.hasAttribute('replace');
        let isInsert = template.hasAttribute('insert');

        scope = (0, _Bind.bindNode)(node, scope);

        if (isReplace || isInsert) {
            let elementList = [].slice.apply(node.childNodes);

            scope.__cleanElements__ = function () {
                elementList.forEach(node => {
                    node.parentNode && node.parentNode.removeChild(node);
                });
            };
        }

        let parentNode = template.parentNode;

        if (template.getAttribute('poly-parent')) {
            let parentName = template.getAttribute('poly-parent');

            parentNode = (0, _Util.getPolyParent)(template, parentName);
        }

        if (isReplace) {
            console.log('replace template');

            (0, _Util.polyInvoke)(parentNode).replaceChild(node, template);
        } else if (isInsert) {
            (0, _Util.polyInvoke)(parentNode).insertBefore(node, template);
        }

        return { node: node, scope: scope };
    }
};