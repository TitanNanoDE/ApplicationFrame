'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/** @lends Catalog# */
let Catalog = {

    /**
     * @private
     * @type {Function[]}
     */
    _listeners: null,

    /**
     * Stores key value pairs and emits events when ever a pair is assigned
     *
     * @constructs
     *
     * @return {void}
     */
    _make: function () {
        this._listeners = [];

        this._make = null;
    },

    /**
     * gives the ability to register an callback as soon as a event is fired
     *
     * @param  {string} event    the event to wait for
     * @param  {Function} listener the callback function
     *
     * @return {Promise} resloves when the event fires
     */
    on: function (event, listener) {
        var self = this;

        return new Promise(function (success) {
            if (listener.length > 0) self._listeners.push({ event: event, listener: listener, success: success });else success();
        });
    },

    /**
     * assigns a new pair
     *
     * @param {string} key   the key for the assignment
     * @param {*} value any value can be stored
     *
     * @return {void}
     */
    add: function (key, value) {
        this[key] = value;
        var object = this;
        this._listeners.forEach(function (item) {

            if (item.event == 'available') {
                var ready = 0;
                item.listener.forEach(function (item) {
                    if (Object.keys(object).indexOf(item) > -1) ready++;
                });

                if (ready == item.listener.length) {
                    item.success();
                }
            }
        });
    }
};

exports.default = Catalog;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByb3RvdHlwZXMvQ2F0YWxvZy5qcyJdLCJuYW1lcyI6WyJDYXRhbG9nIiwiX2xpc3RlbmVycyIsIl9tYWtlIiwib24iLCJldmVudCIsImxpc3RlbmVyIiwic2VsZiIsIlByb21pc2UiLCJzdWNjZXNzIiwibGVuZ3RoIiwicHVzaCIsImFkZCIsImtleSIsInZhbHVlIiwib2JqZWN0IiwiZm9yRWFjaCIsIml0ZW0iLCJyZWFkeSIsIk9iamVjdCIsImtleXMiLCJpbmRleE9mIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBO0FBQ0EsSUFBSUEsVUFBVTs7QUFFVjs7OztBQUlBQyxnQkFBYSxJQU5IOztBQVFWOzs7Ozs7O0FBT0FDLFdBQVEsWUFBVTtBQUNkLGFBQUtELFVBQUwsR0FBa0IsRUFBbEI7O0FBRUEsYUFBS0MsS0FBTCxHQUFhLElBQWI7QUFDSCxLQW5CUzs7QUFxQlY7Ozs7Ozs7O0FBUUFDLFFBQUssVUFBU0MsS0FBVCxFQUFnQkMsUUFBaEIsRUFBeUI7QUFDMUIsWUFBSUMsT0FBTSxJQUFWOztBQUVBLGVBQU8sSUFBSUMsT0FBSixDQUFZLFVBQVNDLE9BQVQsRUFBaUI7QUFDaEMsZ0JBQUdILFNBQVNJLE1BQVQsR0FBa0IsQ0FBckIsRUFDSUgsS0FBS0wsVUFBTCxDQUFnQlMsSUFBaEIsQ0FBcUIsRUFBRU4sT0FBUUEsS0FBVixFQUFpQkMsVUFBV0EsUUFBNUIsRUFBc0NHLFNBQVVBLE9BQWhELEVBQXJCLEVBREosS0FHSUE7QUFDUCxTQUxNLENBQVA7QUFNSCxLQXRDUzs7QUF3Q1Y7Ozs7Ozs7O0FBUUFHLFNBQU0sVUFBU0MsR0FBVCxFQUFjQyxLQUFkLEVBQW9CO0FBQ3RCLGFBQUtELEdBQUwsSUFBV0MsS0FBWDtBQUNBLFlBQUlDLFNBQVEsSUFBWjtBQUNBLGFBQUtiLFVBQUwsQ0FBZ0JjLE9BQWhCLENBQXdCLFVBQVNDLElBQVQsRUFBYzs7QUFFbEMsZ0JBQUdBLEtBQUtaLEtBQUwsSUFBYyxXQUFqQixFQUE2QjtBQUN6QixvQkFBSWEsUUFBTyxDQUFYO0FBQ0FELHFCQUFLWCxRQUFMLENBQWNVLE9BQWQsQ0FBc0IsVUFBU0MsSUFBVCxFQUFjO0FBQ2hDLHdCQUFHRSxPQUFPQyxJQUFQLENBQVlMLE1BQVosRUFBb0JNLE9BQXBCLENBQTRCSixJQUE1QixJQUFvQyxDQUFDLENBQXhDLEVBQ0lDO0FBQ1AsaUJBSEQ7O0FBS0Esb0JBQUdBLFNBQVNELEtBQUtYLFFBQUwsQ0FBY0ksTUFBMUIsRUFBaUM7QUFDN0JPLHlCQUFLUixPQUFMO0FBQ0g7QUFDSjtBQUNKLFNBYkQ7QUFjSDtBQWpFUyxDQUFkOztrQkFvRWVSLE8iLCJmaWxlIjoicHJvdG90eXBlcy9DYXRhbG9nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqIEBsZW5kcyBDYXRhbG9nIyAqL1xubGV0IENhdGFsb2cgPSB7XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtGdW5jdGlvbltdfVxuICAgICAqL1xuICAgIF9saXN0ZW5lcnMgOiBudWxsLFxuXG4gICAgLyoqXG4gICAgICogU3RvcmVzIGtleSB2YWx1ZSBwYWlycyBhbmQgZW1pdHMgZXZlbnRzIHdoZW4gZXZlciBhIHBhaXIgaXMgYXNzaWduZWRcbiAgICAgKlxuICAgICAqIEBjb25zdHJ1Y3RzXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIF9tYWtlIDogZnVuY3Rpb24oKXtcbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzID0gW107XG5cbiAgICAgICAgdGhpcy5fbWFrZSA9IG51bGw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGdpdmVzIHRoZSBhYmlsaXR5IHRvIHJlZ2lzdGVyIGFuIGNhbGxiYWNrIGFzIHNvb24gYXMgYSBldmVudCBpcyBmaXJlZFxuICAgICAqXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSBldmVudCAgICB0aGUgZXZlbnQgdG8gd2FpdCBmb3JcbiAgICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gbGlzdGVuZXIgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlfSByZXNsb3ZlcyB3aGVuIHRoZSBldmVudCBmaXJlc1xuICAgICAqL1xuICAgIG9uIDogZnVuY3Rpb24oZXZlbnQsIGxpc3RlbmVyKXtcbiAgICAgICAgdmFyIHNlbGY9IHRoaXM7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHN1Y2Nlc3Mpe1xuICAgICAgICAgICAgaWYobGlzdGVuZXIubGVuZ3RoID4gMClcbiAgICAgICAgICAgICAgICBzZWxmLl9saXN0ZW5lcnMucHVzaCh7IGV2ZW50IDogZXZlbnQsIGxpc3RlbmVyIDogbGlzdGVuZXIsIHN1Y2Nlc3MgOiBzdWNjZXNzIH0pO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHN1Y2Nlc3MoKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGFzc2lnbnMgYSBuZXcgcGFpclxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSAgIHRoZSBrZXkgZm9yIHRoZSBhc3NpZ25tZW50XG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBhbnkgdmFsdWUgY2FuIGJlIHN0b3JlZFxuICAgICAqXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBhZGQgOiBmdW5jdGlvbihrZXksIHZhbHVlKXtcbiAgICAgICAgdGhpc1trZXldPSB2YWx1ZTtcbiAgICAgICAgdmFyIG9iamVjdD0gdGhpcztcbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24oaXRlbSl7XG5cbiAgICAgICAgICAgIGlmKGl0ZW0uZXZlbnQgPT0gJ2F2YWlsYWJsZScpe1xuICAgICAgICAgICAgICAgIHZhciByZWFkeT0gMDtcbiAgICAgICAgICAgICAgICBpdGVtLmxpc3RlbmVyLmZvckVhY2goZnVuY3Rpb24oaXRlbSl7XG4gICAgICAgICAgICAgICAgICAgIGlmKE9iamVjdC5rZXlzKG9iamVjdCkuaW5kZXhPZihpdGVtKSA+IC0xKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVhZHkrKztcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGlmKHJlYWR5ID09IGl0ZW0ubGlzdGVuZXIubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zdWNjZXNzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBDYXRhbG9nO1xuIl19
