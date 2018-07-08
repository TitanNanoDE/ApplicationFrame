import NotificationManagerEventHandler from './lib/NotificationManagerEventHandler';
import getRegistration from './lib/getRegistration';

const prototype = (typeof navigator !== 'undefined' && navigator.serviceWorker) ?
    Object.prototype : NotificationManagerEventHandler;

const NotificationManager = {
    get openNotifications() {
        return getRegistration().then(worker => worker.getNotifications());
    },

    init() {
        this.constructor();
    },

    showNotification(...args) {
        return getRegistration().then(worker => worker.showNotification(...args));
    },

    __proto__: prototype,
};

export default NotificationManager;
