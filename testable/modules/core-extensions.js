'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.config = exports.coreExtension = undefined;

var _make = require('util/make');

var apply = function ($$) {
    "use strict";

    var ListExtension = (0, _make.Make)({
        last: function () {
            return this[this.length - 1];
        },

        find: $$.Array.prototype.find,
        indexOf: $$.Array.prototype.indexOf,
        map: $$.Array.prototype.map
    });

    ['Array', 'NodeList', 'TouchList'].forEach(function (type) {
        if ($$[type]) {
            $$[type].prototype = (0, _make.Make)(ListExtension, $$[type].prototype);
        }
    });
}; // core extensions for the default ApplicationFrame modules - copyright by TitanNano / Jovan Gerodetti - http://www.titannano.de

var coreExtension = exports.coreExtension = {
    apply: apply
};

var config = exports.config = {
    main: 'coreExtensions',
    author: 'Jovan Gerodetti',
    version: '0.2'
};