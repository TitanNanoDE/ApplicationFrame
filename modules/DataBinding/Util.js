import { Mixin, hasPrototype } from '../../util/make.js';

/**
 * selects a dom node by the given query.
 *
 * @deprecated don't use this anymore, polyMask is deprecated.
 * @param {string} query
 * @param {Node} context
 * @return {Node}
 */
export let selectElement = function(query, context){
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
 * @param {string} query
 * @param {Node} context
 * @return {NodeList}
 */
export let selectAllElements = function(query, context) {
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
}

export let unwrapPolymerNode = function(node) {
    if (!hasPrototype(node, Node)) {
        return Mixin(node, node.node);
    }

    return node;
}

/**
 * polyMask
 *
 * @deprecated this method shouldn't be used anymore. Use polyInvoke
 * @param {Node} node - the dom node to mask
 * @return {Node} - returns the masked node
 */
export let polyMask = function(node){
    let polyNode = {};

    let additions = {
        get bare (){
            return node;
        }
    };

    if (window.Polymer) {
        polyNode = window.Polymer.dom(node);
    }

    return Mixin(polyNode, node, additions);
};

/**
 * Tries to call Polymers dom() function if available, to keep them in the loop.
 *
 * @param {Node} node - the node we want to take care of.
 * @return {Node} - the dom node, maybe wrapped.
 */
export let polyInvoke = function(node) {

    if (window.Polymer) {
        node = window.Polymer.dom(node);
    }

    return node;
}

export let getPolyParent = function(node, parentName){
    while (node && node.localName !== parentName) {
        node = node.parentNode;
    }

    return node;
}
