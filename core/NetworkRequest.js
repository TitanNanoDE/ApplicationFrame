import EventTarget from './EventTarget';


/**
 * removes angulars hashKey property from an object
 *
 * @param {Object} object the object to operate on
 *
 * @return {Object} the initial object
 */
let stripHashKey = function(object){
    if (Array.isArray(object)) {
        object = object.map(stripHashKey);

    } else {
        object = JSON.parse(JSON.stringify(object));

        Object.keys(object).forEach((key) => {
            if (key == '$$hashKey') {
                delete object[key];
            }else if (typeof object[key] === 'object' ) {
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
    _body : {},

    /**
     * @private
     * @type {Object}
     */
    _headers : null,

    /**
     * @type {string}
     */
    type : '',

    /**
     * @type {string}
     */
    method : '',

    /**
     * @type {string}
     */
    url : '',

    /**
     * @type {function[]}
     * @private
     */
    _listeners : null,

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
    constructor (url, { method = 'GET', type = 'none' } = {}) {
        this.type = type;
        this.method = method;
        this._headers = {};
        this.url = url;
        this._listeners = [];

        return this;
    },

    /**
     * [_make description]
     *
     * @deprecated use the constructor
     * @param  {[type]} args [description]
     * @return {[type]}      [description]
     */
    _make(...args) {
        return this.constructor(...args);
    },

	/**
	 * this method will set the given object as the request body.
	 *
	 * @param {Object} data body data for this request
	 *
	 * @return {NetworkRequest} the request it self
	 */
    body : function(data){
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
    headers : function(headers) {
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
    setHeader : function(key, value) {
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
    onReady : function(fn){
        this._listeners.push(fn);
    },

	/**
	 * This will actually create the network connection and initiate the request.
	 *
	 * @return {Promise} resolves when the request is done
	 */
    send() {
        let self = this;
        let xhr = new XMLHttpRequest();

        if (this.method === 'GET' && this._body) {
            this.url += '?' + Object.keys(this._body).map((key) => {
                return `${key}=${self._body[key]}`;
            }).join('&');
        }

        xhr.open(this.method, this.url, true);

        let promise = new Promise((success, failure) => {
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        let response = xhr.response;

                        if (xhr.getResponseHeader('Content-Type').indexOf('application/json') > -1 && typeof response  === 'string') {
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

        Object.keys(this._headers).forEach((key) => {
            xhr.setRequestHeader(key, self._headers[key]);
        });

        xhr.addEventListener('progress', (e) => this.emit('progress.receive', e));
        xhr.upload.addEventListener('progress', (e) => this.emit('progress.send', e))

        if (this.type === 'json') {
            let body = this._body;

            xhr.setRequestHeader('Content-Type', 'application/json');

            if (body){
                body = stripHashKey(body);
                body = JSON.stringify(body);
            }

            xhr.send(body);
        } else {
            xhr.send(this._body);
        }

        return promise;
    },

    __proto__: EventTarget,
};

export default NetworkRequest;
