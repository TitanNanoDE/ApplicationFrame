/**
 * DataBinding Module
 *
 * @module DataBinding
 * @default module:DataBinding.DataBinding
 */

import { makeTemplate } from './DataBinding/Template.js';
import { polyInvoke } from './DataBinding/Util.js';
import { bindNode } from './DataBinding/Bind.js';
import ViewPort from './DataBinding/ViewPort.js';
import './DataBinding/IfBinding.js';
import './DataBinding/ElementToScopeBinding.js';
import './DataBinding/AttributeBinding.js';

NodeList.prototype.forEach = NamedNodeMap.prototype.forEach = Array.prototype.forEach;

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

/**
 * [DataBinding description]
 *
 * @type {module:DataBinding.ModuleInterface}
 */
export let DataBinding = {
    makeTemplate : makeTemplate,
    bindNode : bindNode,
    ViewPort : ViewPort,
};

export default DataBinding;

/**
 * @interface ModuleInterface
 * @borrows module:DataBinding/Bind.bindNode as bindNode
 * @borrows module:DataBinding/Template.makeTemplate as makeTemplate
 * @borrows module:DataBinding/ViewPort.ViewPort
 * @static
 *
 */
