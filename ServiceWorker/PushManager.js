import PushManagerEventHandler from './lib/PushManagerEventHandler';
import getRegistration from './lib/getRegistration';

const prototype = (typeof navigator !== 'undefined') ? Object.prototype : PushManagerEventHandler;

const PushManager = {

    /**
     * subscribes to the native push service
     *
     * @param  {*} args native push subscribtion arguments
     *
     * @return {Promise}
     */
    subscribe(...args) {
        return getRegistration()
            .then(worker => worker.pushManager.subscribe(...args));
    },

    __proto__: prototype,
};

export default PushManager;
