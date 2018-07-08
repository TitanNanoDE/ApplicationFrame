import ServiceWorkerEventTarget from './lib/ServiceWorkerEventTarget';
import PendingTasks from './PendingTasks';
import InjectionReceiver from '../core/InjectionReceiver';
import NotificationManager from './NotificationManager';
import { Cache, CacheMeta } from './Cache';

export const ServiceWorkerMeta =  {

    get object() { return ServiceWorker; },

    __proto__: InjectionReceiver,
};

const meta = ServiceWorkerMeta.constructor();

/** [meta(ServiceWorkerMeta)] */
export const ServiceWorker = {
    onInit() { return true; },
    onActivate() { return true; },
    onFetch() { return true; },
    onInstall() { return true; },

    skipWaiting() {
        return self.skipWaiting();
    },

    bootstrap() {
        this.constructor();

        meta.injected(NotificationManager).init();
        CacheMeta.inject(ServiceWorker, this);

        self.onactivate = (event) => {
            const pending = meta.injected(PendingTasks);

            pending.push(self.clients.claim());
            pending.push(this.onActivate(event));
            pending._apply(event);
        };

        self.onfetch = (event) => {
            const pending = meta.injected(PendingTasks);

            pending.push(this.onFetch(event));
            pending._apply(event);
        };

        self.oninstall = (event) => {
            const pending = meta.injected(PendingTasks);

            pending.push(this.onInstall(event));
            pending._apply(event);
        };

        return this.onInit();
    },

    __proto__: ServiceWorkerEventTarget,
};

export { Cache };
export { default as NotificationManager } from './NotificationManager';
export { default as PushManager } from './PushManager';
export { default as PendingTasks } from './PendingTasks';
