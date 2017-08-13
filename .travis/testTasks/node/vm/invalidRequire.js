/* global VM */
const instance = Object.create(VM).constructor();

instance.runModule('./abc');
