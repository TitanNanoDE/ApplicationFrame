'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.importTemplate = undefined;

var _make = require('../../util/make.js');

var _NetworkRequest = require('../../core/prototypes/NetworkRequest.js');

var _NetworkRequest2 = _interopRequireDefault(_NetworkRequest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import { polyInvoke } from './Util.js';


/*let FakeTemplate = {
    _markup : '',
    _fragment: null,

    _make : function(markup) {
        this._markup = markup;
    },

    get content() {
        if (!this._fragment) {
            this._fragment = new DocumentFragment();
            let container = document.createElement('div');

            polyInvoke(container).innerHTML = this._markup;

            [].forEach.apply(container.childNodes, [element => {
                polyInvoke(this._fragment).appendChild(element);
            }]);
        }
        return this._fragment;
    }
};*/

/**
 * imports a template node from an external HTML file.
 *
 * @function
 * 
 * @param {string} source the url of the file that holds the template to import
 * @param {HTMLTemplateElement} template the template element to contain the import
 *
 * @return {HTMLTemplateElement} returns the provided template node, but now holding the imported nodes.
 */
let importTemplate = exports.importTemplate = function (source, template) {
    let request = (0, _make.Make)(_NetworkRequest2.default)(source, {});

    return request.send().then(markup => {
        template.innerHTML = markup;

        return template;
    });
};