/**
 * @module ApplicationFrame
 * @version 0.1.0
 * @deprecated
 * @copyright by TitanNano / Jovan Gerodetti - {@link http://www.titannano.de}
 */

"use strict";

// import { Make } from './util/make.js';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.$_ = exports.$ = undefined;

var _functions = require('./util/functions.js');

var _Engine = require('./core/objects/Engine.js');

var _Engine2 = _interopRequireDefault(_Engine);

var _make = require('./util/make.js');

var _Application = require('./core/prototypes/Application.js');

var _Application2 = _interopRequireDefault(_Application);

var _EventTarget = require('./core/prototypes/EventTarget.js');

var _EventTarget2 = _interopRequireDefault(_EventTarget);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let $$ = typeof window == 'object' ? window : global;

/**
 * @param {navigator.userAgent} userAgentString - the userAgent string.
 * @return {UserAgent} - a userAgent object.
 */
let userAgentParser = function (userAgentString) {
	let items = [];
	let current = '';
	let enabled = true;
	let version = '';
	let engines = ['Gecko', 'AppleWebKit', 'Firefox', 'Safari', 'Chrome', 'OPR', 'Trident'];
	let found = [];
	let record = {};

	for (let i = 0; i < userAgentString.length; i++) {
		if (userAgentString[i] == ' ' && enabled) {
			items.push(current);
			current = '';
		} else if (userAgentString[i] == '(') {
			enabled = false;
		} else if (userAgentString[i] == ')') {
			enabled = true;
		} else {
			current += userAgentString[i];
		}
	}
	items.push(current);

	items.forEach(item => {
		if (item.indexOf(';') > -1) {
			record.platform = item;
		} else if (item.indexOf('/') > -1) {
			item = item.split('/');
			if (item[0] == 'Version') {
				version = item[1];
			} else {
				item.push(engines.indexOf(item[0]));
				found.push(item);
			}
		}
	});

	if (found.length == 1) {
		record.engine = found[0][0];
		record.engineVersion = found[0][1];
	} else if (found.length > 1) {
		found.sort((a, b) => {
			if (a[2] < b[2]) return 0;else return 1;
		});
		record.engine = found[found.length - 1][0];
		record.engineVersion = found[found.length - 1][1];
	} else {
		record.engine = 'unknown';
		record.engineVersion = '1';
	}

	record.arch = 'x32';

	record.platform.substring(1, record.platform.length - 2).split('; ').forEach(item => {
		if (item.indexOf('OS X') > -1) {
			record.platform = item;
			record.arch = 'x64';
		} else if (item.indexOf('Windows') > -1) {
			record.platform = item;
		} else if (item.indexOf('Linux') > -1) {
			record.platform = item;
		} else if (item.indexOf('WOW64') > -1 || item.indexOf('Win64') > -1 || item.indexOf('x64') > -1) {
			record.arch = 'x64';
		} else if (item.indexOf('/') > -1) {
			if (engines.indexOf(item.split('/')[0]) > -1) {
				record.engine = item.split('/')[0];
				record.engineVersion = item.split('/')[1];
			}
		} else if (item.indexOf(':') < 0) {
			record.platform = item;
		}
	});

	if (version !== '') {
		record.engineVersion = version;
	}

	return record;
};

// find out which engine is used
if ($$.navigator) {
	_Engine2.default.info.type = 'Web';
	_functions.objectExtend.apply(_Engine2.default.info, [userAgentParser(navigator.userAgent)]);

	//  check if touchscreen is supported
	$$.navigator.isTouch = 'ontouchstart' in $$;

	// check if current platform is the Mozilla Add-on runtime
} else if ($$.exports && $$.require && $$.module) {
	let system = $$.require('sdk/system');
	_functions.objectExtend.apply(_Engine2.default.info, [{
		engine: system.name,
		engineVersion: system.version,
		platform: system.platform + ' ' + system.platformVersion,
		type: 'MozillaAddonSDK',
		arch: system.architecture
	}]);

	// check if current platform is the Node.js runtime
} else if ($$.process && $$.process.versions && $$.process.env && $$.process.pid) {
	_functions.objectExtend.apply(_Engine2.default.info, [{
		engine: $$.process.name,
		engineVersion: $$.process.versions.node,
		platform: $$.process.platform,
		arch: $$.process.arch,
		type: 'Node'
	}]);
}

/**
 * @type {module:Engine~Engine.getLibraryItem}
 * @static
 */
let $ = exports.$ = _Engine2.default.getLibraryItem;

/**
 * @type {module:Engine~Engine.getScope}
 * @static
 */
let $_ = exports.$_ = _Engine2.default.getScope;

exports.default = {
	Util: {
		Make: _make.Make,
		hasPrototype: _make.hasPrototype,
		Mixin: _make.Mixin
	},

	Prototypes: {
		Application: _Application2.default,
		EventTarget: _EventTarget2.default
	}
};