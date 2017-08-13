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

        self.onactivate = this.onActivate.bind(this);
        self.onfetch = this.onActivate.bind(this);
        self.oninstall = this.onInstall.bind(this);
    },

    __proto__: ServiceWorkerEventTarget,
};

export { ServiceWorker };
export { default as NotificationManager } from './NotificationManager';
export { default as PushManager } from './PushManager';
