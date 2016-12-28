'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _make = require('../../util/make.js');

var _Mapping = require('./Mapping.js');

var _Parser = require('./Parser.js');

var _Util = require('./Util.js');

var _Binding = require('./Binding.js');

var _Binding2 = _interopRequireDefault(_Binding);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @class TwoWayBinding
 * @extends module:DataBinding.Binding
 * @memberof module:DataBinding
 */

let TwoWayBinding = (0, _make.Make)( /** @lends module:DataBinding.TwoWayBinding# */{
    /**
     * the last known view value
     *
     * @type {string}
     */
    currentValue: '',

    /**
     * @type {Node}
     */
    parentNode: null,

    /**
     * @type {boolean}
     */
    indirect: false,

    /**
     * @type {string}
     */
    viewBinding: '',

    update: function (scope) {
        // the current value on the scope
        let value = (0, _Parser.parseExpression)(this.properties[0], scope);

        if (!this.indirect) {
            let attribute = _Mapping.attributeNames.rename(this.node.name);

            (0, _Util.polyInvoke)(this.parentNode).setAttribute(attribute, value);
        } else {
            // the current view value
            //let viewValue = parseExpression(this.viewBinding, this.parentNode);

            // check if our current scope value is different from the last value.
            // Then check if the view value doesn't have unassigned changes.
            // Only apply the scope value to the view if both rules apply.
            if (value !== this.currentValue) {
                (0, _Parser.assignExpression)(this.viewBinding, this.parentNode, value);

                if ((0, _Parser.parseExpression)(this.viewBinding, this.parentNode) === value) {
                    this.currentValue = value;
                }

                if (document.activeElement === this.parentNode) {
                    let range = document.createRange();
                    let selection = window.getSelection();

                    range.selectNodeContents(this.parentNode);
                    range.collapse(false);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }
        }
    }
}, _Binding2.default).get();

exports.default = TwoWayBinding;