'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * The make module consits of Make, getPrototypeOf and mixin.
 * See the documentation for each method to see what is does.
 * This module is part of the ApplicationFrame.
 * @module Make
 * @author Jovan Gerodetti
 * @copyright Jovan Gerodetti
 * @version 1.0
 */

/**
 * Internal function to apply one objects propteries to a target object.
 *
 * @param {Object} target
 * @param {Object} source
 * @inner
 */
var apply = function (target, source) {
    Object.keys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });

    return target;
};

/**
 * Creates a new object with the given prototype.
 * If two arguments are passed in, the properties of the first object will be
 * applied to the new object.
 *
 * @param {Object} object
 * @param {Object} prototype
 * @return {function}
 */
var Make = exports.Make = function (object, prototype) {
    if (arguments.length < 2) {
        prototype = object;
        object = null;
    }

    if (object === null) {
        object = Object.create(prototype);
    } else {
        object = apply(Object.create(prototype), object);
    }

    var m = function (...args) {
        var make = object.make || object._make || function () {};

        make.apply(object, args);

        return object;
    };

    m.get = function () {
        return object;
    };

    return m;
};

/**
 * This method checks if the given prototype is in the prototype chain of
 * the given target object.
 *
 * @param {Object} object
 * @param {Object} prototype
 * @return {boolean}
 */
var hasPrototype = exports.hasPrototype = function (object, prototype) {
    var p = Object.getPrototypeOf(object);

    while (p !== null && p !== undefined) {
        if (typeof prototype == 'function') prototype = prototype.prototype;

        if (p == prototype) return true;else p = Object.getPrototypeOf(p);
    }

    return false;
};

/**
 * Creates a new prototype mixing all the given prototypes. Incase two or more
 * prototypes contain the same propterty, the new prototype will return
 * the propterty of the first prototype in the list which contains it.
 *
 * @param {...Object} prototypes - the porotype object to combine
 * @return {Proxy} - the resulting proxy object
 */
var Mixin = exports.Mixin = function (...prototypes) {

    return new Proxy(prototypes, MixinTrap);
};

/**
 * Internal function to find a proptery in a list of prototypes.
 *
 * @param {Object[]} prototypes
 * @param {string} key
 * @return {Object}
 */
var findProperty = function (prototypes, key) {
    for (var i = 0; i < prototypes.length; i++) {
        var item = prototypes[i];

        if (item && item[key]) {
            return item;
        }
    }

    return undefined;
};

/**
 * Traps to create a mixin.
 */
var MixinTrap = {

    'get': function (prototypes, key) {
        var object = findProperty(prototypes, key);

        if (object && typeof object[key] === 'function') {
            return object[key].bind(object);
        }

        return object ? object[key] : null;
    },

    'set': function (prototypes, key, value) {
        var object = findProperty(prototypes, key);

        if (object) {
            object[key] = value;
        } else {
            prototypes[0][key] = value;
        }

        return true;
    }
};
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ha2UuanMiXSwibmFtZXMiOlsiYXBwbHkiLCJ0YXJnZXQiLCJzb3VyY2UiLCJPYmplY3QiLCJrZXlzIiwiZm9yRWFjaCIsImtleSIsImRlZmluZVByb3BlcnR5IiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yIiwiTWFrZSIsIm9iamVjdCIsInByb3RvdHlwZSIsImFyZ3VtZW50cyIsImxlbmd0aCIsImNyZWF0ZSIsIm0iLCJhcmdzIiwibWFrZSIsIl9tYWtlIiwiZ2V0IiwiaGFzUHJvdG90eXBlIiwicCIsImdldFByb3RvdHlwZU9mIiwidW5kZWZpbmVkIiwiTWl4aW4iLCJwcm90b3R5cGVzIiwiUHJveHkiLCJNaXhpblRyYXAiLCJmaW5kUHJvcGVydHkiLCJpIiwiaXRlbSIsImJpbmQiLCJ2YWx1ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTs7Ozs7Ozs7OztBQVdBOzs7Ozs7O0FBT0EsSUFBSUEsUUFBUSxVQUFVQyxNQUFWLEVBQWtCQyxNQUFsQixFQUEwQjtBQUNsQ0MsV0FBT0MsSUFBUCxDQUFZRixNQUFaLEVBQW9CRyxPQUFwQixDQUE0QixVQUFTQyxHQUFULEVBQWE7QUFDckNILGVBQU9JLGNBQVAsQ0FBc0JOLE1BQXRCLEVBQThCSyxHQUE5QixFQUFtQ0gsT0FBT0ssd0JBQVAsQ0FBZ0NOLE1BQWhDLEVBQXdDSSxHQUF4QyxDQUFuQztBQUNILEtBRkQ7O0FBSUEsV0FBT0wsTUFBUDtBQUNILENBTkQ7O0FBUUE7Ozs7Ozs7OztBQVNPLElBQUlRLHNCQUFPLFVBQVNDLE1BQVQsRUFBaUJDLFNBQWpCLEVBQTRCO0FBQzFDLFFBQUdDLFVBQVVDLE1BQVYsR0FBbUIsQ0FBdEIsRUFBd0I7QUFDcEJGLG9CQUFZRCxNQUFaO0FBQ0FBLGlCQUFTLElBQVQ7QUFDSDs7QUFFRCxRQUFJQSxXQUFXLElBQWYsRUFBcUI7QUFDakJBLGlCQUFTUCxPQUFPVyxNQUFQLENBQWNILFNBQWQsQ0FBVDtBQUNILEtBRkQsTUFFTztBQUNIRCxpQkFBU1YsTUFBTUcsT0FBT1csTUFBUCxDQUFjSCxTQUFkLENBQU4sRUFBZ0NELE1BQWhDLENBQVQ7QUFDSDs7QUFFRCxRQUFJSyxJQUFJLFVBQVMsR0FBR0MsSUFBWixFQUFpQjtBQUNyQixZQUFJQyxPQUFPUCxPQUFPTyxJQUFQLElBQWVQLE9BQU9RLEtBQXRCLElBQStCLFlBQVUsQ0FBRSxDQUF0RDs7QUFFQUQsYUFBS2pCLEtBQUwsQ0FBV1UsTUFBWCxFQUFtQk0sSUFBbkI7O0FBRUEsZUFBT04sTUFBUDtBQUNILEtBTkQ7O0FBUUFLLE1BQUVJLEdBQUYsR0FBUSxZQUFVO0FBQUUsZUFBT1QsTUFBUDtBQUFnQixLQUFwQzs7QUFFQSxXQUFPSyxDQUFQO0FBQ0gsQ0F2Qk07O0FBeUJQOzs7Ozs7OztBQVFPLElBQUlLLHNDQUFlLFVBQVNWLE1BQVQsRUFBaUJDLFNBQWpCLEVBQTJCO0FBQ2pELFFBQUlVLElBQUlsQixPQUFPbUIsY0FBUCxDQUFzQlosTUFBdEIsQ0FBUjs7QUFFQSxXQUFNVyxNQUFNLElBQU4sSUFBY0EsTUFBTUUsU0FBMUIsRUFBb0M7QUFDaEMsWUFBRyxPQUFPWixTQUFQLElBQW9CLFVBQXZCLEVBQ0lBLFlBQVlBLFVBQVVBLFNBQXRCOztBQUVKLFlBQUdVLEtBQUtWLFNBQVIsRUFDSSxPQUFPLElBQVAsQ0FESixLQUdJVSxJQUFJbEIsT0FBT21CLGNBQVAsQ0FBc0JELENBQXRCLENBQUo7QUFDUDs7QUFFRCxXQUFPLEtBQVA7QUFDSCxDQWRNOztBQWdCUDs7Ozs7Ozs7QUFRTyxJQUFJRyx3QkFBUSxVQUFTLEdBQUdDLFVBQVosRUFBdUI7O0FBRXRDLFdBQU8sSUFBSUMsS0FBSixDQUFVRCxVQUFWLEVBQXNCRSxTQUF0QixDQUFQO0FBRUgsQ0FKTTs7QUFNUDs7Ozs7OztBQU9BLElBQUlDLGVBQWUsVUFBU0gsVUFBVCxFQUFxQm5CLEdBQXJCLEVBQTBCO0FBQ3pDLFNBQUssSUFBSXVCLElBQUksQ0FBYixFQUFnQkEsSUFBSUosV0FBV1osTUFBL0IsRUFBdUNnQixHQUF2QyxFQUE0QztBQUN4QyxZQUFJQyxPQUFPTCxXQUFXSSxDQUFYLENBQVg7O0FBRUEsWUFBSUMsUUFBUUEsS0FBS3hCLEdBQUwsQ0FBWixFQUF1QjtBQUNuQixtQkFBT3dCLElBQVA7QUFDSDtBQUNKOztBQUVELFdBQU9QLFNBQVA7QUFDSCxDQVZEOztBQVlBOzs7QUFHQSxJQUFJSSxZQUFZOztBQUVaLFdBQVEsVUFBU0YsVUFBVCxFQUFxQm5CLEdBQXJCLEVBQTBCO0FBQzlCLFlBQUlJLFNBQVNrQixhQUFhSCxVQUFiLEVBQXlCbkIsR0FBekIsQ0FBYjs7QUFFQSxZQUFJSSxVQUFVLE9BQU9BLE9BQU9KLEdBQVAsQ0FBUCxLQUF1QixVQUFyQyxFQUFpRDtBQUM3QyxtQkFBT0ksT0FBT0osR0FBUCxFQUFZeUIsSUFBWixDQUFpQnJCLE1BQWpCLENBQVA7QUFDSDs7QUFFRCxlQUFRQSxTQUFTQSxPQUFPSixHQUFQLENBQVQsR0FBdUIsSUFBL0I7QUFDSCxLQVZXOztBQVlaLFdBQVEsVUFBU21CLFVBQVQsRUFBcUJuQixHQUFyQixFQUEwQjBCLEtBQTFCLEVBQWlDO0FBQ3JDLFlBQUl0QixTQUFTa0IsYUFBYUgsVUFBYixFQUF5Qm5CLEdBQXpCLENBQWI7O0FBRUEsWUFBSUksTUFBSixFQUFZO0FBQ1JBLG1CQUFPSixHQUFQLElBQWMwQixLQUFkO0FBQ0gsU0FGRCxNQUVPO0FBQ0hQLHVCQUFXLENBQVgsRUFBY25CLEdBQWQsSUFBcUIwQixLQUFyQjtBQUNIOztBQUVELGVBQU8sSUFBUDtBQUNIO0FBdEJXLENBQWhCIiwiZmlsZSI6Im1ha2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRoZSBtYWtlIG1vZHVsZSBjb25zaXRzIG9mIE1ha2UsIGdldFByb3RvdHlwZU9mIGFuZCBtaXhpbi5cbiAqIFNlZSB0aGUgZG9jdW1lbnRhdGlvbiBmb3IgZWFjaCBtZXRob2QgdG8gc2VlIHdoYXQgaXMgZG9lcy5cbiAqIFRoaXMgbW9kdWxlIGlzIHBhcnQgb2YgdGhlIEFwcGxpY2F0aW9uRnJhbWUuXG4gKiBAbW9kdWxlIE1ha2VcbiAqIEBhdXRob3IgSm92YW4gR2Vyb2RldHRpXG4gKiBAY29weXJpZ2h0IEpvdmFuIEdlcm9kZXR0aVxuICogQHZlcnNpb24gMS4wXG4gKi9cblxuXG4vKipcbiAqIEludGVybmFsIGZ1bmN0aW9uIHRvIGFwcGx5IG9uZSBvYmplY3RzIHByb3B0ZXJpZXMgdG8gYSB0YXJnZXQgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB0YXJnZXRcbiAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2VcbiAqIEBpbm5lclxuICovXG52YXIgYXBwbHkgPSBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UpIHtcbiAgICBPYmplY3Qua2V5cyhzb3VyY2UpLmZvckVhY2goZnVuY3Rpb24oa2V5KXtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNvdXJjZSwga2V5KSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGFyZ2V0O1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IG9iamVjdCB3aXRoIHRoZSBnaXZlbiBwcm90b3R5cGUuXG4gKiBJZiB0d28gYXJndW1lbnRzIGFyZSBwYXNzZWQgaW4sIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBmaXJzdCBvYmplY3Qgd2lsbCBiZVxuICogYXBwbGllZCB0byB0aGUgbmV3IG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gcHJvdG90eXBlXG4gKiBAcmV0dXJuIHtmdW5jdGlvbn1cbiAqL1xuZXhwb3J0IHZhciBNYWtlID0gZnVuY3Rpb24ob2JqZWN0LCBwcm90b3R5cGUpIHtcbiAgICBpZihhcmd1bWVudHMubGVuZ3RoIDwgMil7XG4gICAgICAgIHByb3RvdHlwZSA9IG9iamVjdDtcbiAgICAgICAgb2JqZWN0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAob2JqZWN0ID09PSBudWxsKSB7XG4gICAgICAgIG9iamVjdCA9IE9iamVjdC5jcmVhdGUocHJvdG90eXBlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBvYmplY3QgPSBhcHBseShPYmplY3QuY3JlYXRlKHByb3RvdHlwZSksIG9iamVjdCk7XG4gICAgfVxuXG4gICAgdmFyIG0gPSBmdW5jdGlvbiguLi5hcmdzKXtcbiAgICAgICAgdmFyIG1ha2UgPSBvYmplY3QubWFrZSB8fCBvYmplY3QuX21ha2UgfHzCoGZ1bmN0aW9uKCl7fTtcblxuICAgICAgICBtYWtlLmFwcGx5KG9iamVjdCwgYXJncyk7XG5cbiAgICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICB9O1xuXG4gICAgbS5nZXQgPSBmdW5jdGlvbigpeyByZXR1cm4gb2JqZWN0OyB9O1xuXG4gICAgcmV0dXJuIG07XG59O1xuXG4vKipcbiAqIFRoaXMgbWV0aG9kIGNoZWNrcyBpZiB0aGUgZ2l2ZW4gcHJvdG90eXBlIGlzIGluIHRoZSBwcm90b3R5cGUgY2hhaW4gb2ZcbiAqIHRoZSBnaXZlbiB0YXJnZXQgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBwcm90b3R5cGVcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCB2YXIgaGFzUHJvdG90eXBlID0gZnVuY3Rpb24ob2JqZWN0LCBwcm90b3R5cGUpe1xuICAgIHZhciBwID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7XG5cbiAgICB3aGlsZShwICE9PSBudWxsICYmIHAgIT09IHVuZGVmaW5lZCl7XG4gICAgICAgIGlmKHR5cGVvZiBwcm90b3R5cGUgPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgIHByb3RvdHlwZSA9IHByb3RvdHlwZS5wcm90b3R5cGU7XG5cbiAgICAgICAgaWYocCA9PSBwcm90b3R5cGUpXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihwKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgcHJvdG90eXBlIG1peGluZyBhbGwgdGhlIGdpdmVuIHByb3RvdHlwZXMuIEluY2FzZSB0d28gb3IgbW9yZVxuICogcHJvdG90eXBlcyBjb250YWluIHRoZSBzYW1lIHByb3B0ZXJ0eSwgdGhlIG5ldyBwcm90b3R5cGUgd2lsbCByZXR1cm5cbiAqIHRoZSBwcm9wdGVydHkgb2YgdGhlIGZpcnN0IHByb3RvdHlwZSBpbiB0aGUgbGlzdCB3aGljaCBjb250YWlucyBpdC5cbiAqXG4gKiBAcGFyYW0gey4uLk9iamVjdH0gcHJvdG90eXBlcyAtIHRoZSBwb3JvdHlwZSBvYmplY3QgdG8gY29tYmluZVxuICogQHJldHVybiB7UHJveHl9IC0gdGhlIHJlc3VsdGluZyBwcm94eSBvYmplY3RcbiAqL1xuZXhwb3J0IHZhciBNaXhpbiA9IGZ1bmN0aW9uKC4uLnByb3RvdHlwZXMpe1xuXG4gICAgcmV0dXJuIG5ldyBQcm94eShwcm90b3R5cGVzLCBNaXhpblRyYXApO1xuXG59O1xuXG4vKipcbiAqIEludGVybmFsIGZ1bmN0aW9uIHRvIGZpbmQgYSBwcm9wdGVyeSBpbiBhIGxpc3Qgb2YgcHJvdG90eXBlcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdFtdfSBwcm90b3R5cGVzXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbnZhciBmaW5kUHJvcGVydHkgPSBmdW5jdGlvbihwcm90b3R5cGVzLCBrZXkpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3RvdHlwZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGl0ZW0gPSBwcm90b3R5cGVzW2ldO1xuXG4gICAgICAgIGlmIChpdGVtICYmIGl0ZW1ba2V5XSkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufTtcblxuLyoqXG4gKiBUcmFwcyB0byBjcmVhdGUgYSBtaXhpbi5cbiAqL1xudmFyIE1peGluVHJhcCA9IHtcblxuICAgICdnZXQnIDogZnVuY3Rpb24ocHJvdG90eXBlcywga2V5KSB7XG4gICAgICAgIHZhciBvYmplY3QgPSBmaW5kUHJvcGVydHkocHJvdG90eXBlcywga2V5KTtcblxuICAgICAgICBpZiAob2JqZWN0ICYmIHR5cGVvZiBvYmplY3Rba2V5XSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgcmV0dXJuIG9iamVjdFtrZXldLmJpbmQob2JqZWN0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAob2JqZWN0ID8gb2JqZWN0W2tleV0gOiBudWxsKTtcbiAgICB9LFxuXG4gICAgJ3NldCcgOiBmdW5jdGlvbihwcm90b3R5cGVzLCBrZXksIHZhbHVlKSB7XG4gICAgICAgIHZhciBvYmplY3QgPSBmaW5kUHJvcGVydHkocHJvdG90eXBlcywga2V5KTtcblxuICAgICAgICBpZiAob2JqZWN0KSB7XG4gICAgICAgICAgICBvYmplY3Rba2V5XSA9IHZhbHVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHJvdG90eXBlc1swXVtrZXldID0gdmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59O1xuIl19
