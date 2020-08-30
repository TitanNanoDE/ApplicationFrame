/* eslint-env mocha */

const EventTargetInterface = require('./interfaces/EventTarget');
const ObservableInterface = require('./interfaces/Observable');

describe('Observable', () => {
    const ObservableModule = require('../testable/core/Observable');

    describe('EventTarget compatible', () => {
        EventTargetInterface(ObservableModule.default);
    });

    ObservableInterface('../../testable/core/Observable', 'Observable');
});
