/* eslint-env mocha */

'use strict';

exports.test = function(assert, share){
    describe('EventTarget Prototype', function(){
        let EventTarget = null;
        let instance = null;

        it('should load the Prototype', () => {
            EventTarget = require('../dist/core/prototypes/EventTarget.js').default;

            assert.notEqual(null, EventTarget);
        });

        it('should construct a new instance of EventTarget', () => {
            instance = share.Af.Util.Make(EventTarget)();

            assert.equal(EventTarget, Object.getPrototypeOf(instance));
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
            }, 5);
        });

        it('should provide the emited data to the listener', (done) => {
            let testData = 'test data';

            instance.on('test#3', (data) => {
                done(assert.equal(testData, data));
            });

            instance.emit('test#3', testData);
        })
    });
};
