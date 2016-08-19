//import CryptoJS from '../libs/CryptoJS-SHA-3.js';
import { makeTemplate } from './DataBinding/Template.js';
import { polyInvoke } from './DataBinding/Util.js';
import { bindNode } from './DataBinding/Bind.js';
import ViewPort from './DataBinding/ViewPort.js';
import './DataBinding/IfBinding.js';
import './DataBinding/ElementToScopeBinding.js';

/**
 * @module DataBinding
 * @version 1.0
 * @author Jovan Gerodetti
 */

NodeList.prototype.forEach = NamedNodeMap.prototype.forEach = Array.prototype.forEach;


/**
 * calculates the hash of an Object.
 *
 * @memberof Object.prototype
 */
/**Object.prototype.toString = function(){

    let data = Object.keys(this).map(function(key){
    	return key + '=' + this[key];
    }.bind(this)).join('&');

    let hash = CryptoJS.SHA3(data, { outputLength: 224 });

    return hash.toString(CryptoJS.enc.Base64);
};**/

let style = document.createElement('style');

style.innerHTML = `
    [bind-display="false"] {
        display: none !important;
    }

    [bind-visible="false"] {
        visibility: hidden;
    }
`;

polyInvoke(document.head).appendChild(style);

export let DataBinding = {
    makeTemplate : makeTemplate,
    bindNode : bindNode,
    ViewPort : ViewPort,
};

export let config = {
    main : 'DataBinding',
    author : 'Jovan Gerodetti'
}
