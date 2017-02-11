"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

/** @lends ApplicationInternal# */
let ApplicationInternal = {
  /**
   * @type {Thread}
   */
  thread: null,

  /**
   * @type {Worker[]}
   */
  workers: null,

  /**
   * @type {Function[]}
   */
  listeners: null,

  /**
   * @type {Catalog}
   */
  modules: null,

  /**
   * this prototype defines a new application scope
   *
   * @constructs
   *
   * @return {void}
   */
  _make: function () {
    this.workers = [];
    this.listeners = [];

    this._make = null;
  }
};

exports.default = ApplicationInternal;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByb3RvdHlwZXMvQXBwbGljYXRpb25JbnRlcm5hbC5qcyJdLCJuYW1lcyI6WyJBcHBsaWNhdGlvbkludGVybmFsIiwidGhyZWFkIiwid29ya2VycyIsImxpc3RlbmVycyIsIm1vZHVsZXMiLCJfbWFrZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0E7QUFDQSxJQUFJQSxzQkFBc0I7QUFDdEI7OztBQUdBQyxVQUFTLElBSmE7O0FBTXRCOzs7QUFHQUMsV0FBVSxJQVRZOztBQVd0Qjs7O0FBR0FDLGFBQVksSUFkVTs7QUFnQnRCOzs7QUFHQUMsV0FBVSxJQW5CWTs7QUFxQnRCOzs7Ozs7O0FBT0FDLFNBQVEsWUFBVTtBQUNkLFNBQUtILE9BQUwsR0FBYyxFQUFkO0FBQ0EsU0FBS0MsU0FBTCxHQUFnQixFQUFoQjs7QUFFQSxTQUFLRSxLQUFMLEdBQWEsSUFBYjtBQUNIO0FBakNxQixDQUExQjs7a0JBb0NlTCxtQiIsImZpbGUiOiJwcm90b3R5cGVzL0FwcGxpY2F0aW9uSW50ZXJuYWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbi8qKiBAbGVuZHMgQXBwbGljYXRpb25JbnRlcm5hbCMgKi9cbmxldCBBcHBsaWNhdGlvbkludGVybmFsID0ge1xuICAgIC8qKlxuICAgICAqIEB0eXBlIHtUaHJlYWR9XG4gICAgICovXG4gICAgdGhyZWFkIDogbnVsbCxcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtXb3JrZXJbXX1cbiAgICAgKi9cbiAgICB3b3JrZXJzIDogbnVsbCxcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtGdW5jdGlvbltdfVxuICAgICAqL1xuICAgIGxpc3RlbmVycyA6IG51bGwsXG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7Q2F0YWxvZ31cbiAgICAgKi9cbiAgICBtb2R1bGVzIDogbnVsbCxcblxuICAgIC8qKlxuICAgICAqIHRoaXMgcHJvdG90eXBlIGRlZmluZXMgYSBuZXcgYXBwbGljYXRpb24gc2NvcGVcbiAgICAgKlxuICAgICAqIEBjb25zdHJ1Y3RzXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIF9tYWtlIDogZnVuY3Rpb24oKXtcbiAgICAgICAgdGhpcy53b3JrZXJzPSBbXTtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnM9IFtdO1xuXG4gICAgICAgIHRoaXMuX21ha2UgPSBudWxsO1xuICAgIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IEFwcGxpY2F0aW9uSW50ZXJuYWw7XG4iXX0=
