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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxvZ2dlci5qcyJdLCJuYW1lcyI6WyJlcnJvciIsImFyZ3MiLCJsZXZlbCIsImxlbmd0aCIsIk51bWJlciIsInBvcCIsInN0YWNrVHJhY2UiLCJFcnJvciIsInN0YWNrIiwic3BsaXQiLCJzbGljZSIsInB1c2giLCJqb2luIiwiY29uc29sZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7O2tCQUVlO0FBQ1hBLFdBQVEsVUFBUyxHQUFHQyxJQUFaLEVBQWlCO0FBQ3JCLFlBQUlDLFFBQVEsQ0FBWjs7QUFFQSxZQUFHLHdCQUFhRCxLQUFLQSxLQUFLRSxNQUFMLEdBQWMsQ0FBbkIsQ0FBYixFQUFvQ0MsTUFBcEMsQ0FBSCxFQUErQztBQUMzQ0Ysb0JBQVFELEtBQUtJLEdBQUwsRUFBUjtBQUNIOztBQUVESCxpQkFBUyxDQUFUOztBQUVBLFlBQUlJLGFBQWMsSUFBSUMsS0FBSixFQUFELENBQWNDLEtBQWQsQ0FBb0JDLEtBQXBCLENBQTBCLElBQTFCLENBQWpCOztBQUVBSCxxQkFBYUEsV0FBV0ksS0FBWCxDQUFpQlIsS0FBakIsRUFBd0JJLFdBQVdILE1BQW5DLENBQWI7O0FBRUFGLGFBQUtVLElBQUwsQ0FBVSxTQUFTTCxXQUFXTSxJQUFYLENBQWdCLElBQWhCLENBQW5COztBQUVBQyxnQkFBUWIsS0FBUixDQUFjLEdBQUdDLElBQWpCO0FBQ0g7QUFqQlUsQyIsImZpbGUiOiJMb2dnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBoYXNQcm90b3R5cGUgfSBmcm9tICcuL21ha2UuanMnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgZXJyb3IgOiBmdW5jdGlvbiguLi5hcmdzKXtcbiAgICAgICAgdmFyIGxldmVsID0gMDtcblxuICAgICAgICBpZihoYXNQcm90b3R5cGUoYXJnc1thcmdzLmxlbmd0aCAtIDFdLCBOdW1iZXIpKXtcbiAgICAgICAgICAgIGxldmVsID0gYXJncy5wb3AoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldmVsICs9IDE7XG5cbiAgICAgICAgdmFyIHN0YWNrVHJhY2UgPSAobmV3IEVycm9yKCkpLnN0YWNrLnNwbGl0KCdcXG4nKTtcblxuICAgICAgICBzdGFja1RyYWNlID0gc3RhY2tUcmFjZS5zbGljZShsZXZlbCwgc3RhY2tUcmFjZS5sZW5ndGgpO1xuXG4gICAgICAgIGFyZ3MucHVzaCgnXFxuXFxuJyArIHN0YWNrVHJhY2Uuam9pbignXFxuJykpO1xuXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoLi4uYXJncyk7XG4gICAgfVxufTtcbiJdfQ==
