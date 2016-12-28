'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.config = exports.classes = undefined;

var _Accessor = require('./prototypes/Accessor.js');

var _Accessor2 = _interopRequireDefault(_Accessor);

var _AsyncLoop = require('./prototypes/AsyncLoop.js');

var _AsyncLoop2 = _interopRequireDefault(_AsyncLoop);

var _AsyncQueue = require('./prototypes/AsyncQueue.js');

var _AsyncQueue2 = _interopRequireDefault(_AsyncQueue);

var _EventManager = require('./prototypes/EventManager.js');

var _EventManager2 = _interopRequireDefault(_EventManager);

var _Prototype = require('./prototypes/Prototype.js');

var _Prototype2 = _interopRequireDefault(_Prototype);

var _Mixin = require('./prototypes/Mixin.js');

var _Mixin2 = _interopRequireDefault(_Mixin);

var _make = require('../../util/make.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var classes = exports.classes = {
    AsyncLoop: _AsyncLoop2.default,
    AsyncQueue: _AsyncQueue2.default,
    EventManager: _EventManager2.default,
    Prototype: _Prototype2.default,
    Accessor: _Accessor2.default,
    Make: _make.Make,
    Mixin: _Mixin2.default
}; /*****************************************************************
    * Classes.js v1.1  part of the ApplicationFrame                 *
    * © copyright by Jovan Gerodetti (TitanNano.de)                 *
    * The following Source is licensed under the Appache 2.0        *
    * License. - http://www.apache.org/licenses/LICENSE-2.0         *
    *****************************************************************/

var config = exports.config = {
    main: 'classes',
    author: 'Jovan Gerodetti',
    version: 'v1.1'
};