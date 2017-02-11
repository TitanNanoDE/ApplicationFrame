'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _make = require('../../util/make.js');

var _ApplicationInternal = require('./ApplicationInternal.js');

var _ApplicationInternal2 = _interopRequireDefault(_ApplicationInternal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let Internal = new WeakMap();

/** @lends Application.prototype */
let Application = {

    /**
    * Name of this application so other components can identify the application.
    *
    * @type {string}
    */
    name: '',

    /**
    * Some components may need to know the version of this applicaion.
    *
    * @type {string}
    */
    version: '0.0.0',

    /**
    * @type {string}
    */
    author: '',

    /**
    * @constructs
    *
    * @return {void}
    */
    _make: function () {
        Internal.set(this, (0, _make.Make)(_ApplicationInternal2.default)());
    },

    /**
    * Initializes this application, default interface for components and modules.
    *
    * @return {void}
    */
    init: function () {
        console.log(`Initialzing Application "${ this.name }"!`);
    },

    /**
    * Registers a new event listener for the given event type.
    *
    * @param {string} type the event type
    * @param {function} listener the listener function
    *
    * @return {Application} this application
    */
    on: function (type, listener) {
        let scope = Internal.get(this);

        if (!scope.listeners[type]) {
            scope.listeners[type] = [];
        }

        scope.listeners[type].push(listener);

        return this;
    },

    /**
    * removes a previously attached listener function.
    *
    * @param  {string} type     the listener type
    * @param  {Function} listener the listener function to remove
    *
    * @return {void}
    */
    removeListener: function (type, listener) {
        let scope = Internal.get(this);

        if (scope.listeners[type]) {
            let index = scope.listeners[type].indexOf(listener);

            scope.listeners[type].splice(index, 1);
        }
    },

    /**
    * Emmits a new event on this application.
    *
    * @param {string} type event type
    * @param {Object} data event data
    *
    * @return {void}
    */
    emit: function (type, data) {
        let scope = Internal.get(this);
        let name = this.name ? `${ this.name }:%c ` : '%c%c';

        if (scope.listeners[type]) {
            console.log(`%c${ name }${ type } event emitted`, 'font-weight: 900; text-decoration: underline;', 'font-weight: initial; text-decoration: initial;');

            setTimeout(() => scope.listeners[type].forEach(f => f(data)), 0);
        }
    },

    /**
    * This function will try to terminate the application by emitting the termination event.
    *
    * @param {string} reason - the reason for the termination.
    *
    * @return {void}
    */
    terminate: function (reason) {
        this.emit('terminate', reason);
    }

};

exports.default = Application;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByb3RvdHlwZXMvQXBwbGljYXRpb24uanMiXSwibmFtZXMiOlsiSW50ZXJuYWwiLCJXZWFrTWFwIiwiQXBwbGljYXRpb24iLCJuYW1lIiwidmVyc2lvbiIsImF1dGhvciIsIl9tYWtlIiwic2V0IiwiaW5pdCIsImNvbnNvbGUiLCJsb2ciLCJvbiIsInR5cGUiLCJsaXN0ZW5lciIsInNjb3BlIiwiZ2V0IiwibGlzdGVuZXJzIiwicHVzaCIsInJlbW92ZUxpc3RlbmVyIiwiaW5kZXgiLCJpbmRleE9mIiwic3BsaWNlIiwiZW1pdCIsImRhdGEiLCJzZXRUaW1lb3V0IiwiZm9yRWFjaCIsImYiLCJ0ZXJtaW5hdGUiLCJyZWFzb24iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOztBQUNBOzs7Ozs7QUFFQSxJQUFJQSxXQUFXLElBQUlDLE9BQUosRUFBZjs7QUFFQTtBQUNBLElBQUlDLGNBQWM7O0FBRWQ7Ozs7O0FBS0FDLFVBQU8sRUFQTzs7QUFTZDs7Ozs7QUFLQUMsYUFBVSxPQWRJOztBQWdCZDs7O0FBR0FDLFlBQVMsRUFuQks7O0FBcUJkOzs7OztBQUtBQyxXQUFRLFlBQVU7QUFDZE4saUJBQVNPLEdBQVQsQ0FBYSxJQUFiLEVBQW1CLGdEQUFuQjtBQUNILEtBNUJhOztBQThCZDs7Ozs7QUFLQUMsVUFBTyxZQUFVO0FBQ2JDLGdCQUFRQyxHQUFSLENBQWEsNkJBQTJCLEtBQUtQLElBQUssS0FBbEQ7QUFDSCxLQXJDYTs7QUF3Q2Q7Ozs7Ozs7O0FBUUFRLFFBQUssVUFBU0MsSUFBVCxFQUFlQyxRQUFmLEVBQXdCO0FBQ3pCLFlBQUlDLFFBQVFkLFNBQVNlLEdBQVQsQ0FBYSxJQUFiLENBQVo7O0FBRUEsWUFBSSxDQUFDRCxNQUFNRSxTQUFOLENBQWdCSixJQUFoQixDQUFMLEVBQTRCO0FBQ3hCRSxrQkFBTUUsU0FBTixDQUFnQkosSUFBaEIsSUFBd0IsRUFBeEI7QUFDSDs7QUFFREUsY0FBTUUsU0FBTixDQUFnQkosSUFBaEIsRUFBc0JLLElBQXRCLENBQTJCSixRQUEzQjs7QUFFQSxlQUFPLElBQVA7QUFDSCxLQTFEYTs7QUE0RGQ7Ozs7Ozs7O0FBUUFLLG9CQUFnQixVQUFTTixJQUFULEVBQWVDLFFBQWYsRUFBeUI7QUFDckMsWUFBSUMsUUFBUWQsU0FBU2UsR0FBVCxDQUFhLElBQWIsQ0FBWjs7QUFFQSxZQUFJRCxNQUFNRSxTQUFOLENBQWdCSixJQUFoQixDQUFKLEVBQTJCO0FBQ3ZCLGdCQUFJTyxRQUFRTCxNQUFNRSxTQUFOLENBQWdCSixJQUFoQixFQUFzQlEsT0FBdEIsQ0FBOEJQLFFBQTlCLENBQVo7O0FBRUFDLGtCQUFNRSxTQUFOLENBQWdCSixJQUFoQixFQUFzQlMsTUFBdEIsQ0FBNkJGLEtBQTdCLEVBQW9DLENBQXBDO0FBQ0g7QUFDSixLQTVFYTs7QUE4RWQ7Ozs7Ozs7O0FBUUFHLFVBQU8sVUFBU1YsSUFBVCxFQUFlVyxJQUFmLEVBQW9CO0FBQ3ZCLFlBQUlULFFBQVFkLFNBQVNlLEdBQVQsQ0FBYSxJQUFiLENBQVo7QUFDQSxZQUFJWixPQUFPLEtBQUtBLElBQUwsR0FBYSxJQUFFLEtBQUtBLElBQUssT0FBekIsR0FBaUMsTUFBNUM7O0FBRUEsWUFBSVcsTUFBTUUsU0FBTixDQUFnQkosSUFBaEIsQ0FBSixFQUEyQjtBQUN2Qkgsb0JBQVFDLEdBQVIsQ0FBYSxNQUFJUCxJQUFLLEtBQUVTLElBQUssaUJBQTdCLEVBQ0ksK0NBREosRUFFSSxpREFGSjs7QUFJQVksdUJBQVcsTUFBTVYsTUFBTUUsU0FBTixDQUFnQkosSUFBaEIsRUFBc0JhLE9BQXRCLENBQThCQyxLQUFLQSxFQUFFSCxJQUFGLENBQW5DLENBQWpCLEVBQThELENBQTlEO0FBQ0g7QUFDSixLQWpHYTs7QUFtR2Q7Ozs7Ozs7QUFPQUksZUFBWSxVQUFTQyxNQUFULEVBQWdCO0FBQ3hCLGFBQUtOLElBQUwsQ0FBVSxXQUFWLEVBQXVCTSxNQUF2QjtBQUNIOztBQTVHYSxDQUFsQjs7a0JBZ0hlMUIsVyIsImZpbGUiOiJwcm90b3R5cGVzL0FwcGxpY2F0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTWFrZSB9IGZyb20gJy4uLy4uL3V0aWwvbWFrZS5qcyc7XG5pbXBvcnQgQXBwbGljYXRpb25JbnRlcm5hbCBmcm9tICcuL0FwcGxpY2F0aW9uSW50ZXJuYWwuanMnO1xuXG5sZXQgSW50ZXJuYWwgPSBuZXcgV2Vha01hcCgpO1xuXG4vKiogQGxlbmRzIEFwcGxpY2F0aW9uLnByb3RvdHlwZSAqL1xubGV0IEFwcGxpY2F0aW9uID0ge1xuXG4gICAgLyoqXG4gICAgKiBOYW1lIG9mIHRoaXMgYXBwbGljYXRpb24gc28gb3RoZXIgY29tcG9uZW50cyBjYW4gaWRlbnRpZnkgdGhlIGFwcGxpY2F0aW9uLlxuICAgICpcbiAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgKi9cbiAgICBuYW1lIDogJycsXG5cbiAgICAvKipcbiAgICAqIFNvbWUgY29tcG9uZW50cyBtYXkgbmVlZCB0byBrbm93IHRoZSB2ZXJzaW9uIG9mIHRoaXMgYXBwbGljYWlvbi5cbiAgICAqXG4gICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICovXG4gICAgdmVyc2lvbiA6ICcwLjAuMCcsXG5cbiAgICAvKipcbiAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgKi9cbiAgICBhdXRob3IgOiAnJyxcblxuICAgIC8qKlxuICAgICogQGNvbnN0cnVjdHNcbiAgICAqXG4gICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICovXG4gICAgX21ha2UgOiBmdW5jdGlvbigpe1xuICAgICAgICBJbnRlcm5hbC5zZXQodGhpcywgTWFrZShBcHBsaWNhdGlvbkludGVybmFsKSgpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgKiBJbml0aWFsaXplcyB0aGlzIGFwcGxpY2F0aW9uLCBkZWZhdWx0IGludGVyZmFjZSBmb3IgY29tcG9uZW50cyBhbmQgbW9kdWxlcy5cbiAgICAqXG4gICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICovXG4gICAgaW5pdCA6IGZ1bmN0aW9uKCl7XG4gICAgICAgIGNvbnNvbGUubG9nKGBJbml0aWFsemluZyBBcHBsaWNhdGlvbiBcIiR7dGhpcy5uYW1lfVwiIWApO1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICogUmVnaXN0ZXJzIGEgbmV3IGV2ZW50IGxpc3RlbmVyIGZvciB0aGUgZ2l2ZW4gZXZlbnQgdHlwZS5cbiAgICAqXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSB0aGUgZXZlbnQgdHlwZVxuICAgICogQHBhcmFtIHtmdW5jdGlvbn0gbGlzdGVuZXIgdGhlIGxpc3RlbmVyIGZ1bmN0aW9uXG4gICAgKlxuICAgICogQHJldHVybiB7QXBwbGljYXRpb259IHRoaXMgYXBwbGljYXRpb25cbiAgICAqL1xuICAgIG9uIDogZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpe1xuICAgICAgICBsZXQgc2NvcGUgPSBJbnRlcm5hbC5nZXQodGhpcyk7XG5cbiAgICAgICAgaWYgKCFzY29wZS5saXN0ZW5lcnNbdHlwZV0pIHtcbiAgICAgICAgICAgIHNjb3BlLmxpc3RlbmVyc1t0eXBlXSA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgc2NvcGUubGlzdGVuZXJzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAqIHJlbW92ZXMgYSBwcmV2aW91c2x5IGF0dGFjaGVkIGxpc3RlbmVyIGZ1bmN0aW9uLlxuICAgICpcbiAgICAqIEBwYXJhbSAge3N0cmluZ30gdHlwZSAgICAgdGhlIGxpc3RlbmVyIHR5cGVcbiAgICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBsaXN0ZW5lciB0aGUgbGlzdGVuZXIgZnVuY3Rpb24gdG8gcmVtb3ZlXG4gICAgKlxuICAgICogQHJldHVybiB7dm9pZH1cbiAgICAqL1xuICAgIHJlbW92ZUxpc3RlbmVyOiBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgICBsZXQgc2NvcGUgPSBJbnRlcm5hbC5nZXQodGhpcyk7XG5cbiAgICAgICAgaWYgKHNjb3BlLmxpc3RlbmVyc1t0eXBlXSkge1xuICAgICAgICAgICAgbGV0IGluZGV4ID0gc2NvcGUubGlzdGVuZXJzW3R5cGVdLmluZGV4T2YobGlzdGVuZXIpO1xuXG4gICAgICAgICAgICBzY29wZS5saXN0ZW5lcnNbdHlwZV0uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAqIEVtbWl0cyBhIG5ldyBldmVudCBvbiB0aGlzIGFwcGxpY2F0aW9uLlxuICAgICpcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIGV2ZW50IHR5cGVcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIGV2ZW50IGRhdGFcbiAgICAqXG4gICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICovXG4gICAgZW1pdCA6IGZ1bmN0aW9uKHR5cGUsIGRhdGEpe1xuICAgICAgICBsZXQgc2NvcGUgPSBJbnRlcm5hbC5nZXQodGhpcyk7XG4gICAgICAgIGxldCBuYW1lID0gdGhpcy5uYW1lID8gYCR7dGhpcy5uYW1lfTolYyBgIDogJyVjJWMnO1xuXG4gICAgICAgIGlmIChzY29wZS5saXN0ZW5lcnNbdHlwZV0pIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAlYyR7bmFtZX0ke3R5cGV9IGV2ZW50IGVtaXR0ZWRgLFxuICAgICAgICAgICAgICAgICdmb250LXdlaWdodDogOTAwOyB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTsnLFxuICAgICAgICAgICAgICAgICdmb250LXdlaWdodDogaW5pdGlhbDsgdGV4dC1kZWNvcmF0aW9uOiBpbml0aWFsOycpO1xuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHNjb3BlLmxpc3RlbmVyc1t0eXBlXS5mb3JFYWNoKGYgPT4gZihkYXRhKSksIDApO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICogVGhpcyBmdW5jdGlvbiB3aWxsIHRyeSB0byB0ZXJtaW5hdGUgdGhlIGFwcGxpY2F0aW9uIGJ5IGVtaXR0aW5nIHRoZSB0ZXJtaW5hdGlvbiBldmVudC5cbiAgICAqXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gcmVhc29uIC0gdGhlIHJlYXNvbiBmb3IgdGhlIHRlcm1pbmF0aW9uLlxuICAgICpcbiAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgKi9cbiAgICB0ZXJtaW5hdGUgOiBmdW5jdGlvbihyZWFzb24pe1xuICAgICAgICB0aGlzLmVtaXQoJ3Rlcm1pbmF0ZScsIHJlYXNvbik7XG4gICAgfVxuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBBcHBsaWNhdGlvbjtcbiJdfQ==
