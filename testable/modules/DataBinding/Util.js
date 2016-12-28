'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.nodeIsVisible = exports.sanitizeText = exports.getPolyParent = exports.polyInvoke = exports.polyMask = exports.unwrapPolymerNode = exports.selectAllElements = exports.selectElement = undefined;

var _make = require('../../util/make.js');

/**
 * selects a dom node by the given query.
 *
 * @function
 * @deprecated don't use this anymore, polyMask is deprecated.
 *
 * @param {string} query the query selector to search for on the DOM
 * @param {Node} [context] the node to start the searching on
 *
 * @return {Node} the first node that matches the selector
 */
let selectElement = exports.selectElement = function (query, context) {
    let node = null;

    if (context) {
        node = context.querySelector(query);
    } else {
        node = document.querySelector(query);
    }

    node = polyMask(node);

    return node;
};

/**
 * @function
 * @deprecated don't use anymore. Use {@link document.querySelectorAll}
 *
 * @param {string} query the query to look for
 * @param {Node} context the node to start the searching on
 *
 * @return {NodeList} the node list with all matching nodes
 */
let selectAllElements = exports.selectAllElements = function (query, context) {
    let nodeList = null;

    if (context) {
        nodeList = context.querySelectorAll(query);
    } else {
        nodeList = document.querySelectorAll(query);
    }

    if (window.Polymer) {
        nodeList = [].map.apply(nodeList, [polyMask]);
    }

    return nodeList;
};

/**
 * attempts to extract the original node from an polymer node
 *
 * @function
 * @deprecated there is no need to use this function anymore
 *
 * @param {Node} node the node to unwrap
 *
 * @return {Node} a mixin exposing the original node
 */
let unwrapPolymerNode = exports.unwrapPolymerNode = function (node) {
    if (!(0, _make.hasPrototype)(node, Node)) {
        return (0, _make.Mixin)(node, node.node);
    }

    return node;
};

/**
 * creates a mixin of the node and a wrapped version from Polymer
 *
 * @function
 * @deprecated this method shouldn't be used anymore. Use polyInvoke
 *
 * @param {Node} node the dom node to mask
 *
 * @return {Node} returns the masked node
 */
let polyMask = exports.polyMask = function (node) {
    let polyNode = {};

    let additions = {
        get bare() {
            return node;
        }
    };

    if (window.Polymer) {
        polyNode = window.Polymer.dom(node);
    }

    return (0, _make.Mixin)(polyNode, node, additions);
};

/**
 * Tries to call Polymers dom() function if available, to keep them in the loop.
 *
 * @param {Node} node the node we want to take care of.
 * @return {Node} the dom node, maybe wrapped.
 */
let polyInvoke = exports.polyInvoke = function (node) {

    if (window.Polymer) {
        node = window.Polymer.dom(node);
    }

    return node;
};

/**
 * attempts to find a parent node with a particular node name
 *
 * @function
 *
 * @param {Node} node the base node
 * @param {string} parentName the node name to search for
 *
 * @return {Node} the node we where searching for
 */
let getPolyParent = exports.getPolyParent = function (node, parentName) {
    while (node && node.localName !== parentName) {
        node = node.parentNode;
    }

    return node;
};

let sanitizeText = exports.sanitizeText = function (rawText) {
    let text = rawText.replace(/\&nbsp\;/g, '\u00a0').replace(/<br>/, '\n');

    // html escape
    text = document.createTextNode(text).textContent;

    //fix legal HTML
    text = text.replace(/\n/g, '<br>').replace(/  /g, ' &nbsp;');

    return text;
};

/**
 * checks if a node is currenty visible on the viewport
 *
 * @param  {Node} node - the node to check
 * @return {boolean} - the visibility status of the node
 */
let nodeIsVisible = exports.nodeIsVisible = function (node) {
    return node.offsetHeight === 0 && node.offsetWidth === 0;
};