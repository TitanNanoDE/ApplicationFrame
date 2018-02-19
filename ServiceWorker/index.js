import ServiceWorkerEventTarget from './lib/ServiceWorkerEventTarget';
import PendingTasks from './PendingTasks';
import InjectionReceiver from '../core/InjectionReceiver';
import NotificationManager from './NotificationManager';
import PushManager from './PushManager';

const { create } = Object;

// create a injection receiver
const injectionReceiver = create(InjectionReceiver).constructor();


const ServiceWorker = {
    onInit() { return true; },
    onActivate() { return true; },
    onFetch() { return true; },
    onInstall() { return true; },

    skipWaiting() {
        return self.skipWaiting();
    },

    bootstrap() {
        this.constructor();

        injectionReceiver.injected(NotificationManager).init();
        injectionReceiver.injected(PushManager).init();

        self.onactivate = (event) => {
            this.onActivate(event);

            injectionReceiver.injected(PendingTasks)._apply(event);
        };

        self.onfetch = (event) => {
            this.onFetch(event);
            injectionReceiver.injected(PendingTasks)._apply(event);
        };

        self.oninstall = (event) => {
            this.onInstall(event);

            injectionReceiver.injected(PendingTasks)._apply(event);
        };

        this.onInit();
    },

    __proto__: ServiceWorkerEventTarget,
};

export { ServiceWorker, injectionReceiver };
export { default as NotificationManager } from './NotificationManager';
export { default as PushManager } from './PushManager';
export { default as Cache } from './Cache';
