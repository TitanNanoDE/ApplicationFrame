import { ApplicationTrait } from '../traits';
import Manifest from './Manifest';
import NotificationManager from '../ServiceWorker/NotificationManager';
import PushManager from '../ServiceWorker/PushManager';
import ServiceWorkerEventTarget from '../ServiceWorker/lib/ServiceWorkerEventTarget';
import getRegistration from '../ServiceWorker/lib/getRegistration';
import validateTrait from '../core/validateTrait';

const consumeApplication = function(application, worker) {
    currentApplication = application;

    worker.on((event, data) => {
        currentApplication.emit(event, data);
    });

    application.on((event, data) => {
        worker.emit(event, data);
    })
};

let currentApplication = null;

const ServiceWorker = {
    script: '',

    /**
     * - true: the scope is extracted from the mainfest file
     * - false: the ServiceWorker is registered without a scope
     * - string: the string is applied as scope
     *
     * defaults to true
     *
     * @type {Boolean|string}
     */
    scope: true,

    get isSupported() {
        return 'serviceWorker' in navigator;
    },

    init() {
        super.constructor();
        let scope = null;

        //determine scope
        if (typeof this.scope === 'string') {
            scope = Promise.resolve(this.scope);
        } else if (!!this.scope){
            scope = Manifest.whenReady.then(() => Manifest.scope);
        } else {
            scope = Promise.resolve(null);
        }

        if (!this.isSupported) {
            return;
        }

        scope.then(scope => {
            return navigator.serviceWorker.register(this.script, { scope });
        });
    },

    PushManager,
    NotificationManager,

    checkUpdate() {
        return getRegistration().then(worker => worker.update());
    },

    remove() {
        return getRegistration().then(worker => worker.unregister());
    },

    consume(object) {
        if (validateTrait(object, ApplicationTrait)) {
            consumeApplication(object, this);
        } else {
            console.error('[ServiceWorkerClient] can only consume objects with the following traits', ApplicationTrait);
        }
    },

    __proto__: ServiceWorkerEventTarget,
};

export default ServiceWorker;
