import EventTarget from '../../core/EventTarget';
import { ServiceWorkerGlobalScope } from '../../traits';
import validateTrait from '../../core/validateTrait';
import getRegistration from './getRegistration';

const onMessageHandler = function(event) {
    if (event.data.type === 'ServiceWorkerEventTarget') {
        this.emit(event.data.event, event.data.data);
    } else {
        console.log(`[ServiceWorker${navigator ? 'Client' : ''}] Ignoring event`, event);
    }
}

const ServiceWorkerEventTarget = {

    emit(event, data) {
        const message = {
            type: 'ServiceWorkerEventTarget', event, data,
        };

        if (self && validateTrait(self, ServiceWorkerGlobalScope)) {
            self.postMessage(message);
        } else {
            getRegistration().then(worker => worker.postMessage(message));
        }

        super.emit(event, data);
    },

    constructor(...args) {
        super.constructor(...args);

        const messageTarget = navigator ? getRegistration() : Promise.resolve(self);


        messageTarget.then(target => {
            target.onmessage = onMessageHandler.bind(this);
        });

        return this;
    },

    __proto__: EventTarget,
};

export default ServiceWorkerEventTarget;
