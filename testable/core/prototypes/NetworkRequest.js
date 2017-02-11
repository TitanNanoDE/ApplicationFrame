'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
/**
 * @module NetworkRequest
 */

/**
 * removes angulars hashKey property from an object
 *
 * @param {Object} object the object to operate on
 *
 * @return {Object} the initial object
 */
let stripHashKey = function (object) {
	if (Array.isArray(object)) {
		object = object.map(stripHashKey);
	} else {
		object = JSON.parse(JSON.stringify(object));

		Object.keys(object).forEach(function (key) {
			if (key == '$$hashKey') {
				delete object[key];
			} else if (typeof object[key] === 'object') {
				object[key] = stripHashKey(object[key]);
			}
		});
	}

	return object;
};

/**
 * @lends module:NetworkRequest.NetworkRequest#
 */
let NetworkRequest = {
	/**
  * @private
  * @type {Object}
  */
	_body: {},

	/**
  * @private
  * @type {Object}
  */
	_headers: null,

	/**
  * @type {string}
  */
	type: '',

	/**
  * @type {string}
  */
	method: '',

	/**
  * @type {string}
  */
	url: '',

	/**
  * @type {function[]}
  * @private
  */
	_listeners: null,

	/**
  * The constructor for the NetworkRequest. It simply sets up the properties.
  *
  * @constructs
  *
  * @param {string} url the url this request should be made to
  * @param {Object} config addintional configuartion for the request
  *
  * @return {NetworkRequest} the request it self
  */
	_make: function (url, { method = 'GET', type = 'none' } = {}) {
		this.type = type;
		this.method = method;
		this._headers = {};
		this.url = url;
		this._listeners = [];
	},

	/**
  * this method will set the given object as the request body.
  *
  * @param {Object} data body data for this request
  *
  * @return {NetworkRequest} the request it self
  */
	body: function (data) {
		this._body = data;

		return this;
	},

	/**
  * This method will set the request headers, in case custom headers are required.
  *
  * @param {Object} headers a object with all header properties for this request
  *
  * @return {NetworkRequest} the request it self
  */
	headers: function (headers) {
		this._headers = headers;

		return this;
	},

	/**
  * Sets a single header for this request.
  *
  * @param {string} key the header key
  * @param {string} value the header value
  *
  * @return {NetworkRequest} the request it self
  */
	setHeader: function (key, value) {
		this._headers[key] = value;

		return this;
	},

	/**
  * sets a callback for when the request is ready
  *
  * @param {function} fn a callback function as soon as the data is ready
  *
  * @return {void}
  */
	onReady: function (fn) {
		this._listeners.push(fn);
	},

	/**
  * This will actually create the network connection and initiate the request.
  *
  * @return {Promise} resolves when the request is done
  */
	send: function () {
		let self = this;
		let xhr = new XMLHttpRequest();

		if (this.method === 'GET' && this._body) {
			this.url += '?' + Object.keys(this._body).map(function (key) {
				return `${ key }=${ self._body[key] }`;
			}).join('&');
		}

		xhr.open(this.method, this.url, true);

		let promise = new Promise((success, failure) => {
			xhr.onreadystatechange = () => {
				if (xhr.readyState === 4) {
					if (xhr.status === 200) {
						let response = xhr.response;

						if (xhr.getResponseHeader('Content-Type').indexOf('application/json') > -1 && typeof response === 'string') {
							response = JSON.parse(response);
						}

						this._listeners.forEach(fn => fn(xhr));

						success(response);
					} else {
						failure(xhr);
					}
				}
			};
		});

		Object.keys(this._headers).forEach(function (key) {
			xhr.setRequestHeader(key, self._headers[key]);
		});

		if (this.type === 'json') {
			let body = this._body;

			xhr.setRequestHeader('Content-Type', 'application/json');

			if (body) {
				body = stripHashKey(body);
				body = JSON.stringify(body);
			}

			xhr.send(body);
		} else {
			xhr.send(this._body);
		}

		return promise;
	}
};

exports.default = NetworkRequest;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByb3RvdHlwZXMvTmV0d29ya1JlcXVlc3QuanMiXSwibmFtZXMiOlsic3RyaXBIYXNoS2V5Iiwib2JqZWN0IiwiQXJyYXkiLCJpc0FycmF5IiwibWFwIiwiSlNPTiIsInBhcnNlIiwic3RyaW5naWZ5IiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJrZXkiLCJOZXR3b3JrUmVxdWVzdCIsIl9ib2R5IiwiX2hlYWRlcnMiLCJ0eXBlIiwibWV0aG9kIiwidXJsIiwiX2xpc3RlbmVycyIsIl9tYWtlIiwiYm9keSIsImRhdGEiLCJoZWFkZXJzIiwic2V0SGVhZGVyIiwidmFsdWUiLCJvblJlYWR5IiwiZm4iLCJwdXNoIiwic2VuZCIsInNlbGYiLCJ4aHIiLCJYTUxIdHRwUmVxdWVzdCIsImpvaW4iLCJvcGVuIiwicHJvbWlzZSIsIlByb21pc2UiLCJzdWNjZXNzIiwiZmFpbHVyZSIsIm9ucmVhZHlzdGF0ZWNoYW5nZSIsInJlYWR5U3RhdGUiLCJzdGF0dXMiLCJyZXNwb25zZSIsImdldFJlc3BvbnNlSGVhZGVyIiwiaW5kZXhPZiIsInNldFJlcXVlc3RIZWFkZXIiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7Ozs7QUFLQTs7Ozs7OztBQU9BLElBQUlBLGVBQWUsVUFBU0MsTUFBVCxFQUFnQjtBQUNsQyxLQUFJQyxNQUFNQyxPQUFOLENBQWNGLE1BQWQsQ0FBSixFQUEyQjtBQUMxQkEsV0FBU0EsT0FBT0csR0FBUCxDQUFXSixZQUFYLENBQVQ7QUFFQSxFQUhELE1BR087QUFDTkMsV0FBU0ksS0FBS0MsS0FBTCxDQUFXRCxLQUFLRSxTQUFMLENBQWVOLE1BQWYsQ0FBWCxDQUFUOztBQUVBTyxTQUFPQyxJQUFQLENBQVlSLE1BQVosRUFBb0JTLE9BQXBCLENBQTRCLFVBQVNDLEdBQVQsRUFBYTtBQUN4QyxPQUFJQSxPQUFPLFdBQVgsRUFBd0I7QUFDdkIsV0FBT1YsT0FBT1UsR0FBUCxDQUFQO0FBQ0EsSUFGRCxNQUVNLElBQUksT0FBT1YsT0FBT1UsR0FBUCxD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Qjs7QUFFbEJNLGNBQVFLLFFBQVI7QUFDQSxNQVZELE1BVU87QUFDTkosY0FBUVAsR0FBUjtBQUNBO0FBQ0Q7QUFDRCxJQWhCRDtBQWlCQSxHQWxCYSxDQUFkOztBQW9CQXRCLFNBQU9DLElBQVAsQ0FBWSxLQUFLSyxRQUFqQixFQUEyQkosT0FBM0IsQ0FBbUMsVUFBU0MsR0FBVCxFQUFhO0FBQy9DbUIsT0FBSWMsZ0JBQUosQ0FBcUJqQyxHQUFyQixFQUEwQmtCLEtBQUtmLFFBQUwsQ0FBY0gsR0FBZCxDQUExQjtBQUNBLEdBRkQ7O0FBSUEsTUFBSSxLQUFLSSxJQUFMLEtBQWMsTUFBbEIsRUFBMEI7QUFDaEIsT0FBSUssT0FBTyxLQUFLUCxLQUFoQjs7QUFFVGlCLE9BQUljLGdCQUFKLENBQXFCLGNBQXJCLEVBQXFDLGtCQUFyQzs7QUFFUyxPQUFJeEIsSUFBSixFQUFTO0FBQ0xBLFdBQU9wQixhQUFhb0IsSUFBYixDQUFQO0FBQ0FBLFdBQU9mLEtBQUtFLFNBQUwsQ0FBZWEsSUFBZixDQUFQO0FBQ0g7O0FBRVZVLE9BQUlGLElBQUosQ0FBU1IsSUFBVDtBQUNBLEdBWEQsTUFXTztBQUNOVSxPQUFJRixJQUFKLENBQVMsS0FBS2YsS0FBZDtBQUNBOztBQUVELFNBQU9xQixPQUFQO0FBQ0E7QUFoS21CLENBQXJCOztrQkFtS2V0QixjIiwiZmlsZSI6InByb3RvdHlwZXMvTmV0d29ya1JlcXVlc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBtb2R1bGUgTmV0d29ya1JlcXVlc3RcbiAqL1xuXG5cbi8qKlxuICogcmVtb3ZlcyBhbmd1bGFycyBoYXNoS2V5IHByb3BlcnR5IGZyb20gYW4gb2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCB0aGUgb2JqZWN0IHRvIG9wZXJhdGUgb25cbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9IHRoZSBpbml0aWFsIG9iamVjdFxuICovXG5sZXQgc3RyaXBIYXNoS2V5ID0gZnVuY3Rpb24ob2JqZWN0KXtcblx0aWYgKEFycmF5LmlzQXJyYXkob2JqZWN0KSkge1xuXHRcdG9iamVjdCA9IG9iamVjdC5tYXAoc3RyaXBIYXNoS2V5KTtcblxuXHR9IGVsc2Uge1xuXHRcdG9iamVjdCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob2JqZWN0KSk7XG5cblx0XHRPYmplY3Qua2V5cyhvYmplY3QpLmZvckVhY2goZnVuY3Rpb24oa2V5KXtcblx0XHRcdGlmIChrZXkgPT0gJyQkaGFzaEtleScpIHtcblx0XHRcdFx0ZGVsZXRlIG9iamVjdFtrZXldO1xuXHRcdFx0fWVsc2UgaWYgKHR5cGVvZiBvYmplY3Rba2V5XSA9PT0gJ29iamVjdCcgKSB7XG5cdFx0XHRcdG9iamVjdFtrZXldID0gc3RyaXBIYXNoS2V5KG9iamVjdFtrZXldKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHJldHVybiBvYmplY3Q7XG59XG5cbi8qKlxuICogQGxlbmRzIG1vZHVsZTpOZXR3b3JrUmVxdWVzdC5OZXR3b3JrUmVxdWVzdCNcbiAqL1xubGV0IE5ldHdvcmtSZXF1ZXN0ID0ge1xuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKi9cbiAgICBfYm9keSA6IHt9LFxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqL1xuXHRfaGVhZGVycyA6IG51bGwsXG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuXHR0eXBlIDogJycsXG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuXHRtZXRob2QgOiAnJyxcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG5cdHVybCA6ICcnLFxuXG4gICAgLyoqXG4gICAgICogQHR5cGUge2Z1bmN0aW9uW119XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbGlzdGVuZXJzIDogbnVsbCxcblxuXHQvKipcblx0ICogVGhlIGNvbnN0cnVjdG9yIGZvciB0aGUgTmV0d29ya1JlcXVlc3QuIEl0IHNpbXBseSBzZXRzIHVwIHRoZSBwcm9wZXJ0aWVzLlxuXHQgKlxuXHQgKiBAY29uc3RydWN0c1xuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdXJsIHRoZSB1cmwgdGhpcyByZXF1ZXN0IHNob3VsZCBiZSBtYWRlIHRvXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgYWRkaW50aW9uYWwgY29uZmlndWFydGlvbiBmb3IgdGhlIHJlcXVlc3Rcblx0ICpcblx0ICogQHJldHVybiB7TmV0d29ya1JlcXVlc3R9IHRoZSByZXF1ZXN0IGl0IHNlbGZcblx0ICovXG5cdF9tYWtlIDogZnVuY3Rpb24odXJsLCB7IG1ldGhvZCA9ICdHRVQnLCB0eXBlID0gJ25vbmUnIH0gPSB7fSl7XG5cdFx0dGhpcy50eXBlID0gdHlwZTtcblx0XHR0aGlzLm1ldGhvZCA9IG1ldGhvZDtcbiAgICAgICAgdGhpcy5faGVhZGVycyA9IHt9O1xuXHRcdHRoaXMudXJsID0gdXJsO1xuICAgICAgICB0aGlzLl9saXN0ZW5lcnMgPSBbXTtcblx0fSxcblxuXHQvKipcblx0ICogdGhpcyBtZXRob2Qgd2lsbCBzZXQgdGhlIGdpdmVuIG9iamVjdCBhcyB0aGUgcmVxdWVzdCBib2R5LlxuXHQgKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gZGF0YSBib2R5IGRhdGEgZm9yIHRoaXMgcmVxdWVzdFxuXHQgKlxuXHQgKiBAcmV0dXJuIHtOZXR3b3JrUmVxdWVzdH0gdGhlIHJlcXVlc3QgaXQgc2VsZlxuXHQgKi9cblx0Ym9keSA6IGZ1bmN0aW9uKGRhdGEpe1xuXHRcdHRoaXMuX2JvZHkgPSBkYXRhO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFRoaXMgbWV0aG9kIHdpbGwgc2V0IHRoZSByZXF1ZXN0IGhlYWRlcnMsIGluIGNhc2UgY3VzdG9tIGhlYWRlcnMgYXJlIHJlcXVpcmVkLlxuXHQgKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gaGVhZGVycyBhIG9iamVjdCB3aXRoIGFsbCBoZWFkZXIgcHJvcGVydGllcyBmb3IgdGhpcyByZXF1ZXN0XG5cdCAqXG5cdCAqIEByZXR1cm4ge05ldHdvcmtSZXF1ZXN0fSB0aGUgcmVxdWVzdCBpdCBzZWxmXG5cdCAqL1xuXHRoZWFkZXJzIDogZnVuY3Rpb24oaGVhZGVycykge1xuXHRcdHRoaXMuX2hlYWRlcnMgPSBoZWFkZXJzO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXRzIGEgc2luZ2xlIGhlYWRlciBmb3IgdGhpcyByZXF1ZXN0LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSB0aGUgaGVhZGVyIGtleVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSB0aGUgaGVhZGVyIHZhbHVlXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtOZXR3b3JrUmVxdWVzdH0gdGhlIHJlcXVlc3QgaXQgc2VsZlxuICAgICAqL1xuICAgIHNldEhlYWRlciA6IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5faGVhZGVyc1trZXldID0gdmFsdWU7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldHMgYSBjYWxsYmFjayBmb3Igd2hlbiB0aGUgcmVxdWVzdCBpcyByZWFkeVxuICAgICAqXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gZm4gYSBjYWxsYmFjayBmdW5jdGlvbiBhcyBzb29uIGFzIHRoZSBkYXRhIGlzIHJlYWR5XG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIG9uUmVhZHkgOiBmdW5jdGlvbihmbil7XG4gICAgICAgIHRoaXMuX2xpc3RlbmVycy5wdXNoKGZuKTtcbiAgICB9LFxuXG5cdC8qKlxuXHQgKiBUaGlzIHdpbGwgYWN0dWFsbHkgY3JlYXRlIHRoZSBuZXR3b3JrIGNvbm5lY3Rpb24gYW5kIGluaXRpYXRlIHRoZSByZXF1ZXN0LlxuXHQgKlxuXHQgKiBAcmV0dXJuIHtQcm9taXNlfSByZXNvbHZlcyB3aGVuIHRoZSByZXF1ZXN0IGlzIGRvbmVcblx0ICovXG5cdHNlbmQgOiBmdW5jdGlvbigpe1xuXHRcdGxldCBzZWxmID0gdGhpcztcblx0XHRsZXQgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cblx0XHRpZiAodGhpcy5tZXRob2QgPT09ICdHRVQnICYmIHRoaXMuX2JvZHkpIHtcblx0XHRcdHRoaXMudXJsICs9ICc/JyArIE9iamVjdC5rZXlzKHRoaXMuX2JvZHkpLm1hcChmdW5jdGlvbihrZXkpe1xuXHRcdFx0XHRyZXR1cm4gYCR7a2V5fT0ke3NlbGYuX2JvZHlba2V5XX1gO1xuXHRcdFx0fSkuam9pbignJicpO1xuXHRcdH1cblxuXHRcdHhoci5vcGVuKHRoaXMubWV0aG9kLCB0aGlzLnVybCwgdHJ1ZSk7XG5cblx0XHRsZXQgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChzdWNjZXNzLCBmYWlsdXJlKSA9PiB7XG5cdFx0XHR4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gKCkgPT4ge1xuXHRcdFx0XHRpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQpIHtcblx0XHRcdFx0XHRpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG5cdFx0XHRcdFx0XHRsZXQgcmVzcG9uc2UgPSB4aHIucmVzcG9uc2U7XG5cblx0XHRcdFx0XHRcdGlmICh4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ0NvbnRlbnQtVHlwZScpLmluZGV4T2YoJ2FwcGxpY2F0aW9uL2pzb24nKSA+IC0xICYmIHR5cGVvZiByZXNwb25zZSAgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UgPSBKU09OLnBhcnNlKHJlc3BvbnNlKTtcblx0XHRcdFx0XHRcdH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fbGlzdGVuZXJzLmZvckVhY2goZm4gPT4gZm4oeGhyKSk7XG5cblx0XHRcdFx0XHRcdHN1Y2Nlc3MocmVzcG9uc2UpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRmYWlsdXJlKHhocik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSlcblxuXHRcdE9iamVjdC5rZXlzKHRoaXMuX2hlYWRlcnMpLmZvckVhY2goZnVuY3Rpb24oa2V5KXtcblx0XHRcdHhoci5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgc2VsZi5faGVhZGVyc1trZXldKTtcblx0XHR9KTtcblxuXHRcdGlmICh0aGlzLnR5cGUgPT09ICdqc29uJykge1xuICAgICAgICAgICAgbGV0IGJvZHkgPSB0aGlzLl9ib2R5O1xuXG5cdFx0XHR4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcblxuICAgICAgICAgICAgaWYgKGJvZHkpe1xuICAgICAgICAgICAgICAgIGJvZHkgPSBzdHJpcEhhc2hLZXkoYm9keSk7XG4gICAgICAgICAgICAgICAgYm9keSA9IEpTT04uc3RyaW5naWZ5KGJvZHkpO1xuICAgICAgICAgICAgfVxuXG5cdFx0XHR4aHIuc2VuZChib2R5KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0eGhyLnNlbmQodGhpcy5fYm9keSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHByb21pc2U7XG5cdH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IE5ldHdvcmtSZXF1ZXN0O1xuIl19
