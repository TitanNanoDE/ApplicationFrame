/* eslint-env mocha */
const assert = require('assert');
const expect = require('chai').expect;
const Import = require('./tools/import');

'use strict';

describe('EventTarget', () => {
    const EventTargetModule = Import('../../testable/core/EventTarget');
    let instance = null;

    it('should construct a new instance', () => {
        const { default: EventTarget } = EventTargetModule.value;
        const { Make } = require('../testable/util/make');

        instance = Make(EventTarget)();

        expect(Object.getPrototypeOf(instance)).to.equal(EventTarget);
    });

    it('should broadcast an event on the object when calling emit', (done) => {
        instance.on('test#1', () => done());
        instance.emit('test#1');
    });

    it('should only call listeners of the same event type', (done) => {
        let fail = false;

        instance.on('test#1', () => fail = true);
        instance.emit('test#2');

        setTimeout(() => {
            done(assert.equal(false, fail));
        }, 1);
    });

    it('should provide the emited data to the listener', (done) => {
        const testData = 'test data';

        instance.on('test#3', (data) => {
            done(assert.equal(testData, data));
        });

        instance.emit('test#3', testData);
    });

    it('should remove a listener', () => {
        const listener = function() {
            return true;
        };

        instance.on('event', listener);

        expect(instance._listeners.event).to.contain(listener);

        instance.removeListener('event', listener);

        expect(instance._listeners.event).not.to.contain(listener);
    });

    it('should do nothing when listener doesn\'t exist', () => {
        instance.on('event', () => {});

        instance.removeListener('test', () => {});

        expect(instance._listeners.event).to.have.lengthOf(1);
    });
});
