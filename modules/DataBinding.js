import './DataBinding/ObjectParser.js';

/**
 * @module DataBinding
 * @version 1.0
 * @author Jovan Gerodetti
 */

import CryptoJS from '../libs/CryptoJS-SHA-3.js';
import { Make } from '../util/Make.js';

NodeList.prototype.forEach = NamedNodeMap.prototype.forEach = Array.prototype.forEach;

/**
 * Contains all scope, scopeInfo pairs.
 *
 * @type {WeakMap}
 */
let scopeList = new WeakMap();

/**
 * Contains all the attribute names
 *
 * @type {Object}
 */
let attributeNames = {
    events : 'events',
    visible : 'visible',
    classes : 'class',
    prefix : 'bind',

    get : function(key){
        return `${this.prefix}-${this[key]}`;
    }
};

/**
 * calculates the hash of an Object.
 *
 * @memberof Object.prototype
 */
Object.prototype.toString = function(){

    let data = Object.keys(this).map(function(key){
    	return key + '=' + this[key];
    }.bind(this)).join('&');

    let hash = CryptoJS.SHA3(data, { outputLength: 224 });

    return hash.toString(CryptoJS.enc.Base64);
};

/**
 * Prototype for data binding scopes.
 */
let ScopePrototype = {

    /**
     * will apply the current state of the bound model.
     *
     * @param {function} fn
     */
	__apply__ : function(fn){
        if (fn) {
            fn();
        }

		return recycle(this, scopeList[this]);
	}
};

/**
 * creates a new instance of an HTML template and applies the binding with
 * the given scope.
 *
 * @param {Node} node
 * @param {ScopePrototype} scope
 * @return {Object}
 */
export let makeTemplate = function (node, scope) {
    node = node.content.cloneNode(true);

	scope = bindNode(node, scope);

    return {　node : node, scope : scope };
};

/**
 * applies the binding to the node for the given scope.
 *
 * @param {Node} node
 * @param {ScopePrototype} scope
 * @return {ScopePrototype}
 */
export let bindNode = function(node, scope) {
	scope = Make(scope, ScopePrototype)();

	scopeList[scope] = {
		node : node,
		bindings : []
	};

	checkNode(node, scope);

	return scope;
};

/**
 * @param {string[]} events
 * @param {Node} node
 * @param {ScopePrototype} scope
 */
let bindEvents = function(events, node, scope){
	let eventRegex = /{[A-Za-z0-9\-_\.: \(\)]*}/g;

	events = events.match(eventRegex);

	events.forEach(function(event){
		console.log(event);
		event = event.replace(/[{}]/g, '');
		let [name, method] = event.split(':');

		node.addEventListener(name.trim(), scope.$methods[method.trim()]);
	});
};

/**
 * @param {Node} node
 * @param {ScopePrototype} scope
 */
let checkNode = function(node, scope) {
    let dataRegex = /{{[A-Za-z0-9\-_\.\(\)]*}}/g;
    let scopeInfo = scopeList[scope];

	if (node.nodeName == '#text' || node.nodeType === 2) {
    	let text = node.textContent,
            raw = text,
            variables = text.match(dataRegex);

        if (variables) {
            let  data = {
                properties : [],
                content : raw,
                node : node,
                twoWay : node.nodeType === 2 && node.localName == 'input'
            };

        	variables.forEach((item) => {
    			let string = item;

    			item = item.replace(/[{}]/g, '');
   				console.log(item);

                data.properties.push(item);

    			item = parseExpression(item, scope);

	        	text = text.replace(string, item);
			});

            scopeInfo.bindings.push(data);
        }

        node.textContent = text;
    } else {
        if (node.attributes) {
            node.attributes.forEach((node) => { checkNode(node, scope); });

            let events = node.getAttribute(attributeNames.get('events'));

        	if (events !== null) {
        		bindEvents(events, node, scope);

				node.removeAttribute(attributeNames.get('events'));
       		}
        }

        node.childNodes.forEach((node) => { return checkNode(node, scope); });
    }
};


/**
 * Parses a given expression in the context of the given scope.
 *
 * @param {string} expression
 * @param {ScopePrototype} scope
 * @return {ScopePrototype}
 */
let parseExpression = function(expression, scope){
	let chain = expression.split('.');

    chain.forEach(function(item){
        let pos = item.search(/\(\)$/);
    	if (pos > 0) {
        	scope = scope[item.substring(0, pos)]();
        } else {
        	scope = scope[item];
        }
    });

    return scope;
};


/**
 * Checks every binding for the given scope and updates every value.
 *
 * @param {ScopePrototype} scope
 * @param {ScopeInfo} scopeInfo
 */
let recycle = function (scope, scopeInfo) {
	scopeInfo.bindings.forEach(function(binding){
		let text = binding.content;

		binding.forEach(function(item){
			let itemName = item;

			item = parseExpression(item, scope);

			text = text.replace(itemName, item);
		});

		binding.node.textContent = text;
	});
}
