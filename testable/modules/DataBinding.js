'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DataBinding = undefined;

var _Template = require('./DataBinding/Template.js');

var _Util = require('./DataBinding/Util.js');

var _Bind = require('./DataBinding/Bind.js');

var _ViewPort = require('./DataBinding/ViewPort.js');

var _ViewPort2 = _interopRequireDefault(_ViewPort);

require('./DataBinding/IfBinding.js');

require('./DataBinding/ElementToScopeBinding.js');

require('./DataBinding/AttributeBinding.js');

require('./DataBinding/HtmlBinding.js');

require('./DataBinding/CloakBinding.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

NodeList.prototype.forEach = NamedNodeMap.prototype.forEach = Array.prototype.forEach; /**
                                                                                        * DataBinding Module
                                                                                        *
                                                                                        * @module DataBinding
                                                                                        * @default module:DataBinding.DataBinding
                                                                                        */

let style = document.createElement('style');

style.innerHTML = `
    [bind-display="false"] {
        display: none !important;
    }

    [bind-visible="false"] {
        visibility: hidden;
    }
`;

(0, _Util.polyInvoke)(document.head).appendChild(style);

/**
 * [DataBinding description]
 *
 * @type {module:DataBinding.ModuleInterface}
 */
let DataBinding = exports.DataBinding = {
    makeTemplate: _Template.makeTemplate,
    bindNode: _Bind.bindNode,
    ViewPort: _ViewPort2.default
};

exports.default = DataBinding;

/**
 * @interface ModuleInterface
 * @borrows module:DataBinding/Bind.bindNode as bindNode
 * @borrows module:DataBinding/Template.makeTemplate as makeTemplate
 * @borrows module:DataBinding/ViewPort.ViewPort
 * @static
 *
 */