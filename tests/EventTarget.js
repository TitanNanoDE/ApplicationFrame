/* eslint-env mocha */

const EventTargetInterface = require('./interfaces/EventTarget');

describe('EventTarget', () => {
    const EventTargetModule = require('../testable/core/EventTarget');

    EventTargetInterface(EventTargetModule.default);
});
