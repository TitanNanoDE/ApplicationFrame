import ServiceWorkerEventTarget from './lib/ServiceWorkerEventTarget';

const ServiceWorker = {
    onActivate() { return true; },
    onFetch() { return true; },
    onInstall() { return true; },

    skipWaiting() {
        return self.skipWaiting();
    },

    init() {
        this.constructor();

        self.onactivate = (event) => this.onActivate(event);
        self.onfetch = (event) => this.onActivate(event);
        self.oninstall = (event) => this.onInstall(event);
    },

    __proto__: ServiceWorkerEventTarget,
};

export { ServiceWorker };
export { default as NotificationManager } from './NotificationManager';
export { default as PushManager } from './PushManager';
