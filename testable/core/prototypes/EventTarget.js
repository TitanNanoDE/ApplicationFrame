"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
/** @lends EventTarget# */
let EventTarget = {

    /** @type {Object} */
    _listeners: null,

    /**
     * @constructs
     *
     * @return {void}
     */
    _make: function () {
        this._listeners = {};
    },

    /**
     * registers a new listener for the given event.
     *
     * @param {string} type the type of event
     * @param {function} listener callback to execute when the event fires
     *
     * @return {void}
     */
    on: function (type, listener) {
        if (!this._listeners[type]) {
            this._listeners[type] = [];
        }

        this._listeners[type].push(listener);
    },

    /**
     * emmits a new event on this object
     *
     * @param {string} type the type of event
     * @param {*} data data to send to the callbacks
     *
     * @return {void}
     */
    emit: function (type, data) {
        if (this._listeners[type]) {
            setTimeout(() => this._listeners[type].forEach(listener => listener.apply(this, [data])), 0);
        }
    }
};

exports.default = EventTarget;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByb3RvdHlwZXMvRXZlbnRUYXJnZXQuanMiXSwibmFtZXMiOlsiRXZlbnRUYXJnZXQiLCJfbGlzdGVuZXJzIiwiX21ha2UiLCJvbiIsInR5cGUiLCJsaXN0ZW5lciIsInB1c2giLCJlbWl0IiwiZGF0YSIsInNldFRpbWVvdXQiLCJmb3JFYWNoIiwiYXBwbHkiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQSxJQUFJQSxjQUFjOztBQUVkO0FBQ0FDLGdCQUFhLElBSEM7O0FBS2Q7Ozs7O0FBS0FDLFdBQVEsWUFBVTtBQUNkLGFBQUtELFVBQUwsR0FBa0IsRUFBbEI7QUFDSCxLQVphOztBQWNkOzs7Ozs7OztBQVFBRSxRQUFLLFVBQVNDLElBQVQsRUFBZUMsUUFBZixFQUF3QjtBQUN6QixZQUFJLENBQUMsS0FBS0osVUFBTCxDQUFnQkcsSUFBaEIsQ0FBTCxFQUE0QjtBQUN4QixpQkFBS0gsVUFBTCxDQUFnQkcsSUFBaEIsSUFBd0IsRUFBeEI7QUFDSDs7QUFFRCxhQUFLSCxVQUFMLENBQWdCRyxJQUFoQixFQUFzQkUsSUFBdEIsQ0FBMkJELFFBQTNCO0FBQ0gsS0E1QmE7O0FBOEJkOzs7Ozs7OztBQVFBRSxVQUFPLFVBQVNILElBQVQsRUFBZUksSUFBZixFQUFvQjtBQUN2QixZQUFJLEtBQUtQLFVBQUwsQ0FBZ0JHLElBQWhCLENBQUosRUFBMkI7QUFDdkJLLHVCQUFXLE1BQ1AsS0FBS1IsVUFBTCxDQUFnQkcsSUFBaEIsRUFBc0JNLE9BQXRCLENBQThCTCxZQUMxQkEsU0FBU00sS0FBVCxDQUFlLElBQWYsRUFBcUIsQ0FBQ0gsSUFBRCxDQUFyQixDQURKLENBREosRUFHRyxDQUhIO0FBSUg7QUFDSjtBQTdDYSxDQUFsQjs7a0JBZ0RlUixXIiwiZmlsZSI6InByb3RvdHlwZXMvRXZlbnRUYXJnZXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiogQGxlbmRzIEV2ZW50VGFyZ2V0IyAqL1xubGV0IEV2ZW50VGFyZ2V0ID0ge1xuXG4gICAgLyoqIEB0eXBlIHtPYmplY3R9ICovXG4gICAgX2xpc3RlbmVycyA6IG51bGwsXG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RydWN0c1xuICAgICAqXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBfbWFrZSA6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHRoaXMuX2xpc3RlbmVycyA9IHt9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZWdpc3RlcnMgYSBuZXcgbGlzdGVuZXIgZm9yIHRoZSBnaXZlbiBldmVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIHRoZSB0eXBlIG9mIGV2ZW50XG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gbGlzdGVuZXIgY2FsbGJhY2sgdG8gZXhlY3V0ZSB3aGVuIHRoZSBldmVudCBmaXJlc1xuICAgICAqXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBvbiA6IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKXtcbiAgICAgICAgaWYgKCF0aGlzLl9saXN0ZW5lcnNbdHlwZV0pIHtcbiAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVyc1t0eXBlXSA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBlbW1pdHMgYSBuZXcgZXZlbnQgb24gdGhpcyBvYmplY3RcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIHRoZSB0eXBlIG9mIGV2ZW50XG4gICAgICogQHBhcmFtIHsqfSBkYXRhIGRhdGEgdG8gc2VuZCB0byB0aGUgY2FsbGJhY2tzXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGVtaXQgOiBmdW5jdGlvbih0eXBlLCBkYXRhKXtcbiAgICAgICAgaWYgKHRoaXMuX2xpc3RlbmVyc1t0eXBlXSkge1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PlxuICAgICAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVyc1t0eXBlXS5mb3JFYWNoKGxpc3RlbmVyID0+XG4gICAgICAgICAgICAgICAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIFtkYXRhXSlcbiAgICAgICAgICAgICksIDApO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgRXZlbnRUYXJnZXQ7XG4iXX0=
