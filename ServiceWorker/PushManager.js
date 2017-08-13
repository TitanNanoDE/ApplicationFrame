import PushManagerEventHandler from './lib/PushManagerEventHandler';
import getRegistration from './lib/getRegistration';

const prototype = navigator ? Object.prototype : PushManagerEventHandler;

const PushManager = {
   subscribe(...args) {
       return getRegistration()
           .then(worker => worker.pushManager.subscribe(...args));
   },

   __proto__: prototype,
};

export default PushManager;
