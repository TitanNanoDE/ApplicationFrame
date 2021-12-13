import {
    MESSAGE_TYPE_CALL, MESSAGE_TYPE_CALLBACK, MESSAGE_TYPE_EVENT,
    MESSAGE_TYPE_RETURN_VALUE, MESSAGE_TYPE_PARENT_INJECT
} from './messages';

import uuid from 'uuid';
import { Thread, pWorker, pPostMessage, Callbacks as ThreadCallbacks } from './Thread';
import CurrentThreadStore from './CurrentThreadStore';

const IS_WORKER = (!!self.importScripts && !self.document);
const { create } = Object;

const pConfig = Symbol('CurrentThread.config');
const pParent = Symbol('CurrentThread.parent');
const pSetupInterfaces = Symbol('CurrentThread.setupInterfaces()');
const pCallbacks = Symbol('CurrentThread.setupInterfaces()');

const Callbacks = {
    onCallHandler: Symbol('CurrentThread.onCallHandler'),
    onCallbackHandler: Symbol('CurrentThread.onCallbackHandler'),
    onParentInjectHandler: Symbol('CurrentThread.onParentInjectHandler'),

    __proto__: ThreadCallbacks,
};

export const pBroadcastTargets = Symbol('CurrentThread.broadcastTargets');

export const CurrentThread = {

    /** @type {Map.<string, object>} */
    [pCallbacks]: null,

    [pParent]: null,
    [pConfig]: null,
    [pBroadcastTargets]: null,

    constructor: undefined,

    interfaces: [],

    /** @type {Thread} */
    mainThread: null,

    /** @type {Thread} */
    get parent() {
        if (!this[pParent]) {
            throw new Error('Thread has not been properly bootstrapped!');
        }

        return this[pParent];
    },

    [pSetupInterfaces]() {
        this.interfaces = this.interfaces.map(item => create(item)).reverse();
    },

    [Callbacks.onProcessMessage](event) {
        const { type } = event.data;

        if (type === MESSAGE_TYPE_CALL) {
            const { name, args, transaction } = event.data;

            return this[Callbacks.onCallHandler](name, args, transaction);
        }

        if (type === MESSAGE_TYPE_CALLBACK) {
            const { callbackId, args } = event.data;

            return this[Callbacks.onCallbackHandler](callbackId, args);
        }

        if (type === MESSAGE_TYPE_PARENT_INJECT) {
            const { parent } = event.data;

            return this[Callbacks.onCallbackHandler](parent);
        }
    },

    [Callbacks.onCallHandler](name, params, transaction) {
        const responsibleInterface = this.interfaces.find(interfacce => !!interfacce[name]);

        if (!responsibleInterface) {
            throw new Error(`no interface declared the method ${name}!`);
        }

        return Promise.resolve(responsibleInterface[name](...params))
            .then(result => {
                this[pPostMessage]({ type: MESSAGE_TYPE_RETURN_VALUE, return: result, transaction });
            }).catch(error => {
                this[pPostMessage]({ type: MESSAGE_TYPE_RETURN_VALUE, error, transaction });
            });
    },

    [Callbacks.onCallbackHandler](id, args) {
        if (!this[pCallbacks].has(id)) {
            throw `unable to invoke ${id}!`;
        }

        this[pCallbacks].get(id).apply(null, args);
    },

    [Callbacks.onCallbackHandler](parent) {
        this[pParent] = Thread.from(parent);

        if (this[pConfig].init) {
            this[pConfig].init();
        }
    },

    [pPostMessage](message, transfers) {
        this[pBroadcastTargets].forEach(target => target.port1.postMessage(message));

        return this[pWorker].postMessage(message, transfers);
    },

    registerCallback(callback) {
        const id = `Callback<${uuid()}>`;

        this[pCallbacks].set(id, callback);

        return id;
    },

    dispatchEvent(name, data) {
        this[pPostMessage]({
            type: MESSAGE_TYPE_EVENT,
            name, data
        });
    },

    bootstrap(...args) {
        this[pSetupInterfaces]();
        this[pCallbacks] = new Map();
        this[pBroadcastTargets] = [];

        if (!IS_WORKER) {
            this[pWorker] = new BroadcastChannel('threads/io');
            this[pWorker].onmessage = this[Callbacks.onProcessMessage].bind(this);
            this[pWorker].onerror = console.error.bind(console);

            CurrentThreadStore.set(this);

            const mainThread = create(Thread).constructor(args[0]);

            this.mainThread = mainThread;

            return mainThread;
        }

        this[pWorker] = self;
        this[pWorker].onmessage = this[Callbacks.onProcessMessage].bind(this);
        this[pWorker].onerror = console.error.bind(console);
        this[pConfig] = args[0] || {};

        CurrentThreadStore.set(this);
        this.emit(Thread.Events.bootstrapping);
    },

    publish(identifier) {
        const channel = new BroadcastChannel(identifier);
        const oldPostMessage = this[pPostMessage];

        channel.onmessage = this[Callbacks.onProcessMessage].bind(this);

        this[pPostMessage] = function(...args) {
            channel.postMessage(...args);

            return oldPostMessage.apply(this, args);
        };
    },
};

export default CurrentThread;
