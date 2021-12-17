import uuid from 'uuid';
import deepCopy from '../../util/deepCopy';
import { MessagePortTrait } from '../traits';
import {
    MESSAGE_TYPE_CALL, MESSAGE_TYPE_CALLBACK, MESSAGE_TYPE_EVENT,
    MESSAGE_TYPE_RETURN_VALUE, MESSAGE_TYPE_PARENT_INJECT, MESSAGE_TYPE_BOOTSTRAPING,
} from './messages';
import validateTrait from '../../core/validateTrait';
import CurrentThreadStore from './CurrentThreadStore';
import Observable from '../../core/Observable';
import { pBroadcastTargets, CurrentThread, Callbacks as CurrentThreadCallbacks } from './CurrentThread';

export const pWorker = Symbol('Thread.worker');
export const pPostMessage = Symbol('Thread.postMessage()');

const pTransactions = Symbol('Thread.transactions');
const pCreateInterface = Symbol('Thread.createInterface()');

const getPropertyValue = function(source, property, target) {
    do {
        if (!source.hasOwnProperty(property)) {
            continue;
        }

        const desc = Object.getOwnPropertyDescriptor(source, property);

        if (desc.get) {
            return desc.get.apply(target);
        }

        return desc.value;
    } while ((source = Object.getPrototypeOf(source)));
};

const constructThread = function(worker, instance) {
    instance[pWorker] = worker;
    instance[pTransactions] = new Map();
    instance.ready = new Promise(resolve => instance.on(Events.ready, resolve));

    instance[pWorker].onmessage = instance[Callbacks.onProcessMessage].bind(instance);
    instance[pWorker].onerror = console.error.bind(console);

    return instance[pCreateInterface]();
};

export const Events = {
    ready: Symbol.for('Thread.Events.ready'),
};

export const Observer = {
    onReady: Events.ready,
};

export const Callbacks = {
    onProcessMessage: Symbol('Thread.Callbacks.onProcessMessage'),
    onBootstrapping: Symbol('Thread.Callbacks.onBootstrapping'),
};

export const Thread = {
    Observer,
    Events,

    /** @type {Worker} **/
    [pWorker]: null,

    /** @type {Map.<string, {resolve: Function, reject: Function}>} **/
    [pTransactions]: null,

    [pCreateInterface]() {
        const proxy = new Proxy (this, {
            get(target, property, current) {

                // make it clear that we are not a promise
                if (property === 'then') {
                    return null;
                }

                // we have to call a potential getter on the current object and not the target,
                // otherwise the `this` inside the getter will point to the
                // target and not to our actual current object
                if (property in target) {
                    return getPropertyValue(target, property, current);
                }

                return (...args) => current.call(property, args);
            }
        });

        return proxy;
    },

    [pPostMessage](message, transfers) {
        return this[pWorker].postMessage(message, transfers);
    },

    [Callbacks.onProcessMessage](event) {
        const { type, name, data } = event.data;

        if (type === MESSAGE_TYPE_RETURN_VALUE) {
            if (!this[pTransactions].has(data.transaction)) {
                return;
            }

            const resolver = this[pTransactions].get(data.transaction);

            if (data.error) {
                return resolver.reject(data.error);
            }

            return resolver.resolve(data.return);
        }

        if (type === MESSAGE_TYPE_BOOTSTRAPING) {
            this[Callbacks.onBootstrapping]();

            return;
        }

        if (type !== MESSAGE_TYPE_EVENT) {
            return;
        }

        this.emit(name, data);
    },

    [Callbacks.onBootstrapping]() {
        /** @type {CurrentThread} **/
        const parentThread = CurrentThreadStore.get();
        const channel = new MessageChannel();

        channel.port1.onmessage = parentThread[CurrentThreadCallbacks.onProcessMessage].bind(parentThread);
        channel.port1.onerror = parentThread[CurrentThreadCallbacks.onProcessMessage].bind(parentThread);

        parentThread[pBroadcastTargets].push(channel);

        this[pPostMessage]({ type: MESSAGE_TYPE_PARENT_INJECT, parent: channel.port2 }, [channel.port2]);
        this.emit(Events.ready);
    },

    /**
     * Calls a method on the remote thread.
     *
     * @param  {string} name
     * @param  {object[]} args
     * @param  {object[]} transfers defines which arguments should be transfered instead of copied
     *
     * @return {Promise.<object>} the return value of the function
     */
    call(name, args, transfers = []) {
        return new Promise((resolve, reject) => {
            const transaction = uuid();
            const mappedArgs = args.map(item => transfers.includes(item) ? item : deepCopy(item));

            this[pTransactions].set(transaction, { resolve, reject });

            this[pPostMessage]({ type: MESSAGE_TYPE_CALL, name, args: mappedArgs, transaction }, transfers);
        });
    },

    /**
     * calls a callback function in the remote thread
     *
     * @param  {string} callbackId
     * @param  {object[]} args
     *
     * @return {undefined}
     */
    invokeCallback(callbackId, args) {
        const mappedArgs = args.map(item => deepCopy(item));

        this[pPostMessage]({ type: MESSAGE_TYPE_CALLBACK, callbackId, args: mappedArgs });
    },

    /**
     * creates a new thread interface from a script source URL
     *
     * @param {string|Worker} source
     *
     * @return {Proxy.<Thread>}
     */
    constructor(source = '') {
        super.constructor();

        const worker = typeof source === 'string' ? new Worker(source) : source;

        return constructThread(worker, this);
    },

    /**
     * creates a local thread interface from an existing port
     *
     * @param  {MessagePortTrait|string} port
     *
     * @return {Proxy.<Thread>}
     */
    from(port) {
        let worker = null;

        if (typeof port === 'string') {
            worker = new BroadcastChannel(port);
        } else if (validateTrait(port, MessagePortTrait)) {
            worker = port;
        } else {
            throw new Error(`unable to create Thread from ${port.toString()}`);
        }

        return Object.create(this).constructor(worker);
    },

    __proto__: Observable,
};

export default Thread;
