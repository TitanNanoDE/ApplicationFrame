'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.destoryScope = exports.recycle = exports.bindNode = exports.watcherList = undefined;

var _make = require('../../util/make.js');

var _Parser = require('./Parser.js');

var _Mapping = require('./Mapping.js');

var _Util = require('./Util.js');

var _AutoBinding = require('./AutoBinding.js');

var _AutoBinding2 = _interopRequireDefault(_AutoBinding);

var _Binding = require('./Binding.js');

var _Binding2 = _interopRequireDefault(_Binding);

var _BindingRegistry = require('./BindingRegistry.js');

var _BindingRegistry2 = _interopRequireDefault(_BindingRegistry);

var _ClassBinding = require('./ClassBinding.js');

var _ClassBinding2 = _interopRequireDefault(_ClassBinding);

var _EnabledBinding = require('./EnabledBinding.js');

var _EnabledBinding2 = _interopRequireDefault(_EnabledBinding);

var _RenderEngine = require('./RenderEngine');

var _RenderEngine2 = _interopRequireDefault(_RenderEngine);

var _ScopePrototype = require('./ScopePrototype.js');

var _ScopePrototype2 = _interopRequireDefault(_ScopePrototype);

var _StyleBinding = require('./StyleBinding');

var _StyleBinding2 = _interopRequireDefault(_StyleBinding);

var _TemplateRepeatBinding = require('./TemplateRepeatBinding.js');

var _TemplateRepeatBinding2 = _interopRequireDefault(_TemplateRepeatBinding);

var _TwoWayBinding = require('./TwoWayBinding.js');

var _TwoWayBinding2 = _interopRequireDefault(_TwoWayBinding);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Contains all scope, scopeInfo pairs.
 *
 * @type {WeakMap}
 */
/**
 * @module DataBinding/Bind
 */

let scopeList = new Map();

/**
 * @type {ScopePrototype[]}
 */
let scopeIndex = [];

/**
 * @type {Array[]}
 */
let watcherList = exports.watcherList = new Map();

/**
 * @type {Object}
 */
let expressionTracking = {};

/**
 * applies the binding to the node for the given scope.
 *
 * @function
 * @param {Node|string} node - the node which should be bound
 * @param {Object} scope - the scope which should be bound to
 * @param {boolean} isolated - indicates if this scope should be recycled isolated
 * @return {module:DataBinding~ScopePrototype} the scope this node is bound to
 */
let bindNode = exports.bindNode = function (node, scope, isolated) {
    scope = (0, _make.hasPrototype)(scope, _ScopePrototype2.default) ? scope : (0, _make.Make)(scope, _ScopePrototype2.default)();
    node = (0, _make.hasPrototype)(node, Node) ? node : document.querySelector(node);

    scopeList.set(scope, {
        node: node,
        bindings: []
    });

    scopeIndex.push(scope);

    checkNode(node, scope);
    recycle(isolated ? scope : false);

    return scope;
};

/**
 * Travels through a node and it's children searching for binding expressions
 *
 * @param {Node} node - the node to check
 * @param {module:DataBinding.ScopePrototype} scope - the scope this node should be bound to
 * @param {Node} parentNode - the parent of the provided node
 * @return {void}
 */
let checkNode = function (node, scope, parentNode) {
    let dataRegex = /{{[^{}]*}}/g;
    let scopeInfo = scopeList.get(scope);

    if (node.nodeName == '#text' || node.nodeType === 2) {
        let text = node.value || (0, _Util.polyInvoke)(node).textContent,
            variables = text.match(dataRegex),
            visibilityBinding = node.name === _Mapping.attributeNames.get('visible'),
            transparencyBinding = node.name === _Mapping.attributeNames.get('transparent'),
            enabledAttribute = node.name === _Mapping.attributeNames.get('enabled'),
            classes = node.name === _Mapping.attributeNames.get('classes'),
            modelBinding = node.name === _Mapping.attributeNames.get('model'),
            autoBinding = node.name === 'bind',
            twoWay = node.name === _Mapping.attributeNames.get('value') || modelBinding,
            styleBinding = node.name === 'bind-style';

        let singleBinding = visibilityBinding || transparencyBinding;

        if (twoWay) {
            bindTwoWay(text, scope, scopeInfo, node, parentNode, modelBinding);
        } else if (classes) {
            bindClasses(text, node, scopeInfo, parentNode);
        } else if (enabledAttribute) {
            bindEnabled(text, scopeInfo, parentNode);
        } else if (autoBinding) {
            bindAuto(text, scopeInfo, parentNode);
        } else if (styleBinding) {
            bindStyle(text, scopeInfo, scope, parentNode);
        } else if (_BindingRegistry2.default.get(node.name) && _BindingRegistry2.default.get(node.name).test()) {
            (0, _make.Make)(_BindingRegistry2.default.get(node.name))({
                text: text,
                variables: variables,
                scope: scope,
                scopeInfo: scopeInfo,
                node: node,
                parentNode: parentNode
            });
        } else if (variables || singleBinding) {
            bindSimple(text, node, variables, scopeInfo, singleBinding, parentNode);
        }
    } else if (node.localName === 'template') {
        let repeatedTemplate = node.hasAttribute('replace') && node.hasAttribute('repeat') || node.hasAttribute('bind-repeat');

        node.attributes.forEach(child => checkNode(child, scope, node));

        if (repeatedTemplate) {
            bindTemplateRepeat(node, scopeInfo);
        }
    } else {
        if (node.attributes) {
            node.attributes.forEach(child => checkNode(child, scope, node));

            let events = node.getAttribute(_Mapping.attributeNames.get('events'));

            if (events !== null) {
                bindEvents(events, node, scope);

                (0, _Util.polyInvoke)(node).removeAttribute(_Mapping.attributeNames.get('events'));
            }
        }

        node.childNodes.forEach(node => {
            return checkNode(node, scope);
        });
    }
};

/**
 * creates a two way binding
 *
 * @param {string} text - the attribute text
 * @param {module:DataBinding.ScopePrototype} scope - the scope for this binding
 * @param {Object} scopeInfo - the scopeInfo for this binding
 * @param {Node} node - the attribute node
 * @param {Node} parentNode - the actual node
 * @param {boolean} indirect - indicates if this binding is indirect
 * @return {void}
 */
let bindTwoWay = function (text, scope, scopeInfo, node, parentNode, indirect) {
    let expression = text.replace(/[{}]/g, '');
    let value = (0, _Parser.parseExpression)(expression, scope);
    let [eventType, viewBinding, eventBinding, preventDefault] = (parentNode.getAttribute(_Mapping.attributeNames.get('modelEvent')) || '').split(':');
    let debounce = null;

    /** @type {TwoWayBinding} */
    let binding = (0, _make.Make)({
        properties: [expression],
        originalNodeValue: text,
        //      disable this so the value gets applied to the DOM the first time
        //        currentValue : value,
        node: node,
        parentNode: parentNode,
        indirect: indirect,
        viewBinding: viewBinding
    }, _TwoWayBinding2.default).get();

    scopeInfo.bindings.push(binding);

    if (node.name === _Mapping.attributeNames.get('model')) {
        parentNode.addEventListener(eventType, event => {
            if (preventDefault === 'true') {
                event.preventDefault();
            }

            if (debounce) {
                clearTimeout(debounce);
            }

            debounce = setTimeout(() => {
                // read current value in view
                let value = (0, _Parser.parseExpression)(eventBinding, event);

                compareTwoWay(value, scope, binding);
            }, 300);
        });
    } else if (node.name === _Mapping.attributeNames.get('value')) {
        parentNode.addEventListener('keyup', e => {
            e.preventDefault();

            if (debounce) {
                clearTimeout(debounce);
            }

            debounce = setTimeout(() => {
                compareTwoWay(getElementValue(e.target), scope, binding);
            }, 200);
        });
    }
};

/**
 * Compares for changes in the UI in a two way binding
 *
 * @param {string} newValue - the new value to compare
 * @param {module:DataBinding.ScopePrototype} scope - the scope of the comparison
 * @param {TwoWayBinding} binding - the binding to compare
 * @return {void}
 */
let compareTwoWay = function (newValue, scope, binding) {
    if (binding.currentValue !== newValue) {
        (0, _Parser.assignExpression)(binding.properties[0], scope, newValue);
        binding.currentValue = newValue;

        console.log('update from view:', scope);

        recycle();
    }
};

/**
 * creates a simple binding
 *
 * @param {string} text the initial text of the node
 * @param {Node} node the text or attribute node of the binding
 * @param {string[]} variables list of expressions
 * @param {Object} scopeInfo meta data of the current scope
 * @param {boolean} singleExpression - indicates if text contains only one expression
 * @param {Node} parentNode the element that contains the text node or attribute
 *
 * @return {void}
 */
let bindSimple = function (text, node, variables, scopeInfo, singleExpression, parentNode) {
    /** @type {Binding} */
    let binding = (0, _make.Make)({
        originalNodeValue: text,
        node: node,
        parentNode: parentNode,
        singleExpression: singleExpression,
        properties: variables ? variables.map(item => item.replace(/[{}]/g, '')) : []
    }, _Binding2.default).get();

    scopeInfo.bindings.push(binding);
};

/**
 * binds an object expression to node.className.
 *
 * @param  {string} text      the initial text value of the binding node
 * @param  {Node}   node        the binding node
 * @param  {Object} scopeInfo the meta data of the current scope
 * @param  {Node}   parentNode  the parent of the binding node
 *
 * @return {void}
 */
let bindClasses = function (text, node, scopeInfo, parentNode) {
    let binding = (0, _make.Make)({
        originalNodeValue: text,
        node: node,
        classes: (0, _Parser.ObjectParser)(text),
        parentNode: parentNode
    }, _ClassBinding2.default).get();

    scopeInfo.bindings.push(binding);
};

/**
 * binds an expression to the disabled attribute.
 *
 * @param  {string} text       the initial value of the binding node
 * @param  {Object} scopeInfo  the meta data of the current scope
 * @param  {Node}   parentNode the parent of the binding node
 *
 * @return {void}
 */
let bindEnabled = function (text, scopeInfo, parentNode) {
    let binding = (0, _make.Make)({
        originalNodeValue: text,
        parentNode: parentNode
    }, _EnabledBinding2.default)();

    scopeInfo.bindings.push(binding);
};

/**
 * binds a template to an array or list. The template is repeated for each list item.
 *
 * @param  {Node}   template  the template node
 * @param  {Object} scopeInfo the meta data of the current scope
 *
 * @return {void}
 */
let bindTemplateRepeat = function (template, scopeInfo) {
    let text = template.hasAttribute('bind-repeat') ? template.getAttribute('bind-repeat') : template.getAttribute('repeat');

    let marker = document.createComment(`repeat ${ template.id } with ${ text }`);
    let binding = (0, _make.Make)({
        originalNodeValue: text,
        template: template,
        marker: marker
    }, _TemplateRepeatBinding2.default)();

    console.log('replace template with marker');
    (0, _Util.polyInvoke)(template.parentNode).replaceChild(marker, template);
    scopeInfo.bindings.push(binding);
};

/**
 * Binds the events specified for a Node
 *
 * @param {string[]}                          events a string representation of the object with all the event / expression pairs.
 * @param {Node}                              node   the node on which the event listeners should be registered.
 * @param {module:DataBinding~ScopePrototype} scope  the data scope on which the binding happens.
 * @return {void}
 */
let bindEvents = function (events, node, scope) {
    events = (0, _Parser.ObjectParser)(events);

    Object.keys(events).forEach(name => {
        let [method, modifier] = events[name].split('|');

        if (scope.$methods && scope.$methods[method.trim()]) {
            node.addEventListener(name.trim(), e => {
                scope.$methods[method.trim()].apply(scope, [e]);

                scope.__apply__();
            });
        } else {
            method = (0, _Parser.parseExpression)(method.trim(), scope);

            node.addEventListener(name.trim(), e => {
                let canceled = false;

                e.cancleRecycle = function () {
                    canceled = true;
                };

                method.apply(scope, [e]);

                if (!canceled) scope.__apply__();
            }, modifier === 'capture');
        }
    });
};

/**
 * automatically binds a template to a property of the current scope
 *
 * @param  {string} text      the binding text
 * @param  {Object} scopeInfo the meta data of the current scope
 * @param  {Node}   template  the template node
 *
 * @return {void}
 */
let bindAuto = function (text, scopeInfo, template) {
    let binding = (0, _make.Make)({
        scopeName: text,
        template: template
    }, _AutoBinding2.default)();

    scopeInfo.bindings.push(binding);
};

/**
 * binds visual properties to the scope
 *
 * @param  {string}                            text       the binding text
 * @param  {Object}                            scopeInfo  the meta data of the scope
 * @param  {module:DataBinding~ScopePrototype} scope      the current scope
 * @param  {Node}                              parentNode the parent of the binding node
 *
 * @return {void}
 */
let bindStyle = function (text, scopeInfo, scope, parentNode) {
    let binding = (0, _make.Make)({
        bindings: text,
        parentNode: parentNode
    }, _StyleBinding2.default)(scope);

    scopeInfo.bindings.push(binding);
};

/**
 * executes every watcher for the given scope.
 *
 * @param  {module:DataBinding~ScopePrototype} scope the current scope
 *
 * @return {void}
 */
let executeWatchers = function (scope) {
    watcherList.get(scope) && watcherList.get(scope).forEach(watcher => {
        let value = (0, _Parser.parseExpression)(watcher.expression, scope);

        expressionTracking[watcher.expression] = expressionTracking[watcher.expression] || { value: '', newValue: '' };

        if (expressionTracking[watcher.expression].value !== value) {
            watcher.cb.apply(scope, [value]);

            expressionTracking[watcher.expression].newValue = value;
        }
    });
};

/**
 * Checks every binding for the given scope and updates every value.
 *
 * @function
 * @param {module:DataBinding~ScopePrototype} [scope] the scope to recycle
 *
 * @return {void}
 */
let recycle = exports.recycle = function (scope) {

    _RenderEngine2.default.scheduleRenderTask(() => {
        let t0 = window.performance.now();

        try {
            if (scope) {
                executeWatchers(scope);
                scopeList.get(scope).bindings.forEach( /** @type {Binding} */binding => {
                    binding.update(scope);
                });
            } else {
                scopeIndex.forEach(scope => {
                    executeWatchers(scope);
                    scopeList.get(scope).bindings.forEach( /** @type {Binding} */binding => {
                        binding.update(scope);
                    });
                });
            }

            Object.keys(expressionTracking).forEach(expr => {
                expr = expressionTracking[expr];

                expr.value = expr.newValue;
            });
        } catch (e) {
            console.error(e);
        }

        let t1 = window.performance.now();
        let duration = (t1 - t0) / 1000;
        let color = null;

        if (duration >= 0.033) {
            color = 'red';
        } else if (duration >= 0.016) {
            color = 'yellow';
        } else {
            color = 'green';
        }

        color = `color: ${ color };`;
        duration = duration.toFixed(2);

        if (scope) {
            console.log(`scope recycled in %c${ duration }s`, color);
        } else {
            console.log(`full recycle in %c${ duration }s`, color);
        }
    }, scope || 'DataBindingRecycle');
};

/**
 * destories a scope.
 *
 * @function
 * @param {module:DataBinding~ScopePrototype} scope the scope to destory
 * @param {boolean} inProgress                indicates if this is an initial call or not.
 *
 * @return {void}
 */
let destoryScope = exports.destoryScope = function (scope, inProgress) {
    console.log(scopeList);
    let scopeInfo = scopeList.get(scope);

    let [scopes, bindings] = scopeInfo.bindings.reduce((prev, binding) => {
        let [scopes, bindings] = prev;

        if (binding.destory) {
            let [scopes_add, bindings_add] = binding.destory();

            scopes += scopes_add;
            bindings += bindings_add;
        }

        return [scopes, bindings];
    }, [0, 0]);

    bindings += scopeInfo.bindings.length;
    scopes += 1;

    scopeList.delete(scope);
    scopeIndex.splice(scopeIndex.indexOf(scope), 1);
    watcherList.delete(scope);

    if (inProgress) {
        return [scopes, bindings];
    } else {
        console.log(`${ scopes } scopes and ${ bindings } bindings cleaned!`);
    }
};

/**
 * Returns the value of an DOM Node
 *
 * @param {Node} node the node to fetch the value from
 *
 * @return {string} value of this node
 */
let getElementValue = function (node) {
    if (node.localName === 'input') {
        return node.value;
    } else {
        return 'UNKNOWN NODE!';
    }
};