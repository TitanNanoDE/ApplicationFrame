"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (...types) {
	var prototype = {};
	types.forEach(function (item) {
		var x = item.prototype || item;
		for (var i in x) {
			Object.defineProperty(prototype, i, Object.getOwnPropertyDescriptor(x, i));
		}
	});
	return prototype;
};