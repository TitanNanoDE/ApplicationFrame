'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _make = require('./make.js');

exports.default = {
    error: function (...args) {
        var level = 0;

        if ((0, _make.hasPrototype)(args[args.length - 1], Number)) {
            level = args.pop();
        }

        level += 1;

        var stackTrace = new Error().stack.split('\n');

        stackTrace = stackTrace.slice(level, stackTrace.length);

        args.push('\n\n' + stackTrace.join('\n'));

        console.error(...args);
    }
};