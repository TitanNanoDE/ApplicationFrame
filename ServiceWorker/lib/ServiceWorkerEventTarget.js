import EventTarget from '../../core/EventTarget';
import { ServiceWorkerGlobalScope } from '../../traits';
import validateTrait from '../../core/validateTrait';
import getRegistration from './getRegistration';

const Callbacks = {
    onMessageHandler: Symbol('ServiceWorkerEventTarget.Callbacks.onMessageHandler'),
};

const ServiceWorkerEventTarget = {

    emit(event, data) {
        const message = {
            type: 'ServiceWorkerEventTarget', event, data,
        };

        if (validateTrait(self, ServiceWorkerGlobalScope)) {
            self.clients.matchAll().then(clients => clients.forEach(client => client.postMessage(message)));
        } else {
            getRegistration().then(registration => registration.active.postMessage(message));
        }

        super.emit(event, data);
    },

    constructor(...args) {
        super.constructor(...args);

        const messageTarget = navigator.serviceWorker || self;

        messageTarget.onmessage = this[Callbacks.onMessageHandler].bind(this);

        return this;
    },

    [Callbacks.onMessageHandler](event) {
        if (event.data.type !== 'ServiceWorkerEventTarget') {
            console.debug(`[ServiceWorker${('serviceWorker' in navigator) ? 'Client' : ''}] Ignoring event`, event);

            return;
        }

        super.emit(event.data.event, event.data.data);
    },

    __proto__: EventTarget,
};

export default ServiceWorkerEventTarget;
