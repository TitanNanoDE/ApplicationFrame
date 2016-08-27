/**
 * @file Extendables
 * @deprecated Don't use this anymore. It will be removed soon.
 */

/**
 * @module Extendables
 */

import ApplicationScopeInterface from '../prototypes/ApplicationScopeInterface.js';
import ServiceScopeInterface from '../prototypes/ServiceScopeInterface.js';
import MozillaAddonScopeInterface from '../prototypes/MozillaAddonScopeInterface.js';


export default {
    /**
     * @type {ApplicationScopeInterface}
     */
    ApplicationScopeInterface : ApplicationScopeInterface,

    /**
     * @type {MozillaAddonScopeInterface}
     */
    MozillaAddonScopeInterface : MozillaAddonScopeInterface,

    /**
     * @type {ServiceScopeInterface}
     */
    ServiceScopeInterface : ServiceScopeInterface
};
