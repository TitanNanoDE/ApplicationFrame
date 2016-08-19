import { Make, hasPrototype } from '../../util/make.js';
import { ObjectParser, parseExpression, assignExpression } from './Parser.js';
import { attributeNames } from './Mapping.js';
import { selectElement, polyInvoke } from './Util.js';
import AutoBinding from './AutoBinding.js';
import Binding from './Binding.js';
import BindingRegistry from './BindingRegistry.js';
import ClassBinding from './ClassBinding.js';
import EnabledBinding from './EnabledBinding.js';
import RenderEngine from './RenderEngine';
import ScopePrototype from './ScopePrototype.js';
import StyleBinding from './StyleBinding';
import TemplateRepeatBinding from './TemplateRepeatBinding.js';
import TwoWayBinding from './TwoWayBinding.js';

/**
 * Contains all scope, scopeInfo pairs.
 *
 * @type {WeakMap}
 */
let scopeList = new Map();

/**
 * @type {ScopePrototype[]}
 */
let scopeIndex = [];

/**
 * @type {Array[]}
 */
export let watcherList = new Map();

/**
 * @type {Object}
 */
let expressionTracking = {};

/**
 * applies the binding to the node for the given scope.
 *
 * @param {Node|string} node - the node which should be bound
 * @param {Object} scope - the scope which should be bound to
 * @param {boolean} isolated - indicates if this scope should be recycled isolated
 * @return {ScopePrototype} - the scope this node is bound to
 */
export let bindNode = function(node, scope, isolated) {
	scope = hasPrototype(scope, ScopePrototype) ? scope : Make(scope, ScopePrototype)();
    node = hasPrototype(node, Node) ? node : document.querySelector(node);

	scopeList.set(scope, {
		node : node,
		bindings : []
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
 * @param {ScopePrototype} scope - the scope this node should be bound to
 * @param {Node} parentNode - the parent of the provided node
 * @return {void}
 */
let checkNode = function(node, scope, parentNode) {
    let dataRegex = /{{[^{}]*}}/g;
    let scopeInfo = scopeList.get(scope);

	if (node.nodeName == '#text' || node.nodeType === 2) {
    	let text = node.value || polyInvoke(node).textContent,
            variables = text.match(dataRegex),
            visibilityBinding = (node.name === attributeNames.get('visible')),
            transparencyBinding = (node.name === attributeNames.get('transparent')),
            enabledAttribute = node.name === attributeNames.get('enabled'),
            classes = (node.name === attributeNames.get('classes')),
            modelBinding = node.name === attributeNames.get('model'),
            autoBinding = node.name === 'bind',
            twoWay = (node.name === attributeNames.get('value') || modelBinding),
            styleBinding = (node.name === 'bind-style');

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
        } else if (BindingRegistry.get(node.name) && BindingRegistry.get(node.name).test()) {
            Make(BindingRegistry.get(node.name))({
                text: text,
                variables: variables,
                scope: scope,
                scopeInfo: scopeInfo,
                node: node,
                parentNode: parentNode,
            });
        } else if (variables || singleBinding) {
            bindSimple(text, node, variables, scopeInfo, singleBinding, parentNode);
        }

    } else if(node.localName === 'template'){
        let repeatedTemplate = (node.hasAttribute('replace') &&
                                node.hasAttribute('repeat')) ||
                                node.hasAttribute('bind-repeat');

        node.attributes.forEach(child => checkNode(child, scope, node));

        if (repeatedTemplate) {
            bindTemplateRepeat(node, scopeInfo);
        }
    } else {
        if (node.attributes) {
            node.attributes.forEach((child) => checkNode(child, scope, node));

            let events = node.getAttribute(attributeNames.get('events'));

        	if (events !== null) {
        		bindEvents(events, node, scope);

				polyInvoke(node).removeAttribute(attributeNames.get('events'));
       		}
        }

        node.childNodes.forEach((node) => { return checkNode(node, scope); });
    }
};

/**
 * creates a two way binding
 *
 * @param {string} text - the attribute text
 * @param {ScopePrototype} scope - the scope for this binding
 * @param {Object} scopeInfo - the scopeInfo for this binding
 * @param {Node} node - the attribute node
 * @param {Node} parentNode - the actual node
 * @param {boolean} indirect - indicates if this binding is indirect
 * @return {void}
 */
let bindTwoWay = function(text, scope, scopeInfo, node, parentNode, indirect){
    let property = text.replace(/[{}]/g, '');
    let value = parseExpression(property, scope);
    let [event, viewBinding, eventBinding, preventDefault] = (parentNode.getAttribute(attributeNames.get('modelEvent')) || '').split(':');

    /** @type {TwoWayBinding} */
    let binding = Make({
        properties : [property],
        originalNodeValue : text,
        currentValue : value,
        node : node,
        parentNode : parentNode,
        indirect : indirect,
        viewBinding : viewBinding,
    }, TwoWayBinding).get();

    scopeInfo.bindings.push(binding);

    if (node.name === attributeNames.get('model')) {
        parentNode.addEventListener(event, e => {
            if (preventDefault === 'true') {
                e.preventDefault();
            }

            console.log(e);
            let value = parseExpression(eventBinding, e);
            compareTwoWay(value, scope, binding);
        });
    } else if(node.name === attributeNames.get('value')) {
        parentNode.addEventListener('keyup', e => {
            e.preventDefault();
            compareTwoWay(getElementValue(e.target), scope, binding);
        });
    }
};

/**
 * Compares for changes in the UI in a two way binding
 *
 * @param {string} newValue - the new value to compare
 * @param {ScopePrototype} scope - the scope of the comparison
 * @param {TwoWayBinding} binding - the binding to compare
 * @return {void}
 */
let compareTwoWay = function(newValue, scope, binding){
    if (binding.currentValue !== newValue) {
        assignExpression(binding.properties[0], scope, newValue);
        binding.currentValue = newValue;

        console.log('update from view:', scope);

        recycle();
    }
}

/**
 * creates a simple binding
 *
 * @param {string} text
 * @param {Node} node
 * @param {string[]} variables
 * @param {ScopePrototype} scope
 * @param {ScopeInfo} scopeInfo
 * @param {boolean} singleExpression - indicates if text contains only one expression
 * @return {void}
 */
let bindSimple = function(text, node, variables, scopeInfo, singleExpression, parentNode){
    /** @type {Binding} */
    let binding = Make({
        originalNodeValue : text,
        node : node,
        parentNode : parentNode,
        singleExpression : singleExpression,
        properties : variables ? variables.map(item => item.replace(/[{}]/g, '')) : []
    }, Binding).get();

    scopeInfo.bindings.push(binding);
}

let bindClasses = function(text, node, scopeInfo, parentNode) {
    let binding = Make({
        originalNodeValue : text,
        node : node,
        classes : ObjectParser(text),
        parentNode : parentNode
    }, ClassBinding).get();

    scopeInfo.bindings.push(binding);
};

let bindEnabled = function(text, scopeInfo, parentNode) {
    let binding = Make({
        originalNodeValue : text,
        parentNode : parentNode
    }, EnabledBinding)();

    scopeInfo.bindings.push(binding);
};

let bindTemplateRepeat = function(template, scopeInfo) {
    let text = template.hasAttribute('bind-repeat') ?
                            template.getAttribute('bind-repeat') :
                            template.getAttribute('repeat');

    let marker = document.createComment(`repeat ${template.id} with ${text}`);
    let binding = Make({
        originalNodeValue : text,
        template : template,
        marker : marker,
    }, TemplateRepeatBinding)();

    console.log('replace template with marker');
    polyInvoke(template.parentNode).replaceChild(marker, template);
    scopeInfo.bindings.push(binding);
};

/**
 * Binds the events specified for a Node
 *
 * @param {string[]} events - a string representation of the object with all the event / expression pairs.
 * @param {Node} node - the node on which the event listeners should be registered.
 * @param {ScopePrototype} scope - the data scope on which the binding happens.
 * @return {void}
 */
let bindEvents = function(events, node, scope){
	events = ObjectParser(events);

	Object.keys(events).forEach(name => {
		let method = events[name];

        if (scope.$methods && scope.$methods[method.trim()]) {
            node.addEventListener(name.trim(), e => {
                scope.$methods[method.trim()].apply(scope, [e]);

                scope.__apply__();
            });
        } else {
            method = parseExpression(method.trim(), scope);

            node.addEventListener(name.trim(), e => {
                let canceled = false;

                e.cancleRecycle = function(){
                    canceled = true;
                }

                method.apply(scope, [e]);

                if (!canceled)
                    scope.__apply__();
            });
        }
	});
};

let bindAuto = function(text, scopeInfo, template) {
    let binding = Make({
        scopeName : text,
        template : template
    }, AutoBinding)();

    scopeInfo.bindings.push(binding);
}


let bindStyle = function(text, scopeInfo, scope, parentNode) {
    let binding = Make({
        bindings: text,
        parentNode: parentNode,
    }, StyleBinding)(scope);

    scopeInfo.bindings.push(binding);
}

let executeWatchers = function(scope) {
    watcherList.get(scope) && watcherList.get(scope).forEach(watcher => {
        let value = parseExpression(watcher.expression, scope);

        expressionTracking[watcher.expression] = expressionTracking[watcher.expression] || { value : '', newValue : '' };

        if (expressionTracking[watcher.expression].value !== value) {
            watcher.cb.apply(scope, [value]);

            expressionTracking[watcher.expression].newValue = value;
        }
    });
}

/**
 * Checks every binding for the given scope and updates every value.
 *
 * @param {ScopePrototype} scope? - the scope to recycle
 * @return {void}
 */
export let recycle = function (scope) {
    RenderEngine.scheduleRenderTask(() => {
        let t0 = window.performance.now();

        if (scope) {
            executeWatchers(scope);
            scopeList.get(scope).bindings.forEach(binding => binding.update(scope));

        } else {
            scopeIndex.forEach(scope => {
                executeWatchers(scope);
    	        scopeList.get(scope).bindings.forEach(binding => binding.update(scope));
            });
        }

        Object.keys(expressionTracking).forEach(expr => {
            expr = expressionTracking[expr];

            expr.value = expr.newValue;
        });

        let t1 = window.performance.now();
        let duration = ((t1 - t0) / 1000);
        let color = null;

        if (duration >= 0.033) {
            color = 'red';
        } else if (duration >= 0.016) {
            color = 'yellow';
        } else {
            color = 'green';
        }

        color = `color: ${color};`;
        duration = duration.toFixed(2);

        if (scope) {
            console.log(`scope recycled in %c${duration}s`, color);
        } else {
            console.log(`full recycle in %c${duration}s`, color);
        }
    }, scope || 'DataBindingRecycle');
};

export let destoryScope = function(scope, inProgress) {
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
        console.log(`${scopes} scopes and ${bindings} bindings cleaned!`);
    }
};

/**
 * Returns the value of an DOM Node
 *
 * @param {Node} node - the node to fetch the value from
 * @return {*} - value of this node
 */
let getElementValue = function(node){
    if (node.localName === 'input') {
        return node.value;
    } else {
        return 'UNKNOWN NODE!';
    }
}