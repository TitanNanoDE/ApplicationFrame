import EventTarget from './EventTarget';


/**
 * removes angulars hashKey property from an object
 *
 * @param {Object} object the object to operate on
 *
 * @return {Object} the initial object
 */
const stripHashKey = function(object) {
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

const xhrMap = new WeakMap();

/**
 * A network request
 */
const NetworkRequest = {
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
     * @private
     * @type {function[]}
     */
    _listeners: null,

    /**
     * indicator flag whether or not the request is completed
     *
     * @type {Boolean}
     */
    completed: false,

    /** @type {Promise} */
    promise: null,

    /**
     * The constructor for the NetworkRequest. It simply sets up the properties.
     *
     * @param {string} url the url this request should be made to
     * @param {Object} config addintional configuartion for the request
     *
     * @return {NetworkRequest} the request it self
     */
    constructor(url, { method = 'GET', type = 'none' } = {}) {
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
     * @param  {array} args [description]
     * @return {void}      [description]
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
    body(data) {
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
    headers(headers) {
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
    setHeader(key, value) {
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
    onReady(fn) {
        this._listeners.push(fn);
    },

    /**
     * This will actually create the network connection and initiate the request.
     *
     * @return {Promise} resolves when the request is done
     */
    send() {
        const xhr = new XMLHttpRequest();

        xhrMap.set(this, xhr);

        if (this.method === 'GET' && this._body) {
            this.url += `?${  Object.keys(this._body).map((key) => {
                return `${key}=${this._body[key]}`;
            }).join('&')}`;
        }

        xhr.open(this.method, this.url, true);

        const promise = new Promise((success, failure) => {
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

                    this.completed = true;
                }
            };
        });

        Object.keys(this._headers).forEach((key) => {
            xhr.setRequestHeader(key, this._headers[key]);
        });

        xhr.addEventListener('progress', (e) => this.emit('progress.receive', e));
        xhr.upload.addEventListener('progress', (e) => this.emit('progress.send', e));

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

        this.promise = promise;

        return promise;
    },

    /**
     * cancels an already sent request.
     *
     * @return {undefined}
     */
    cancel() {
        /** @type {XMLHttpRequest} */
        const xhr = xhrMap.get(this);

        if (!xhr) {
            return;
        }

        return xhr.abort();
    },

    __proto__: EventTarget,
};

export default NetworkRequest;
