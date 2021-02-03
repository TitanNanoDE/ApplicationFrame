/* eslint-env mocha */

const expect = require('chai').expect;
const mochaVM = require('../../node/mochaVM');

const Target = {
    Events: {
        TestEvent: 'test-event',
        Test2: 'test2',
    },

    subscribed: new Map(),

    emit(name, data) {
        if (!this.subscribed.has(name)) {
            return;
        }

        this.subscribed.get(name).forEach(listener => listener(data));
    },

    on(name, callback) {
        if (!this.subscribed.has(name)) {
            this.subscribed.set(name, []);
        }

        this.subscribed.get(name).push(callback);
    },

    removeListener(name, callback) {
        if (!this.subscribed.has(name)) {
            return;
        }

        const list = this.subscribed.get(name);
        const index = list.indexOf(callback);

        list.splice(index, 1);
    },

    new() {
        return { __proto__: this };
    }
};

module.exports = function() {
    const vm = mochaVM({});

    mochaVM.applyNodeEnv(vm);

    vm.updateContext({
        Target,
    });

    vm.runModule('../../testable/core/features/SubscriberFeature.js');

    describe('SubscriberFeature', () => {
        it('should subscribe to all implemented events', () => {
            const { testResult } = vm.apply(() => {
                /* globals SubscriberFeature */
                const target = Target.new();

                const host = {
                    called: [],

                    'test-event'() {
                        this.called.push('test-event');
                    },

                    'test2'() {
                        this.called.push('test2');
                    }
                };

                SubscriberFeature(target, host);

                target.emit('test-event', null);
                target.emit('test2', null);

                global.testResult = host.called;
            });

            expect(testResult).to.be.deep.equal(['test-event', 'test2']);
        });

        it('should throw if event target does not implement on method or Events property', () => {
            const test = () => vm.apply(() => {
                const target = {};

                const host = {
                    called: [],

                    'test-event'() {
                        this.called.push('test-event');
                    },

                    'test2'() {
                        this.called.push('test2');
                    }
                };

                SubscriberFeature(target, host);
            });

            expect(test).to.throw('provided event target does not support auto subscription!');
        });

        it('should skip unimplemented events', () => {
            const { testResult } = vm.apply(() => {
                const target = Target.new();

                const host = {
                    called: [],

                    'test-event'() {
                        this.called.push('test-event');
                    },
                };

                SubscriberFeature(target, host);

                target.emit('test-event', null);
                target.emit('test2', null);

                global.testResult = host.called;
            });

            expect(testResult).to.be.deep.equal(['test-event']);
        });

        it('should return unsubscribe interface', () => {
            const { testResult } = vm.apply(() => {
                const target = Target.new();

                const host = {
                    called: [],

                    'test-event'() {
                        this.called.push('test-event');
                    },
                };

                const feature = SubscriberFeature(target, host);

                target.emit('test-event', null);

                feature.unsubscribe();

                target.emit('test-event', null);

                global.testResult = host.called;
            });

            expect(testResult).to.be.deep.equal(['test-event']);
        });
    });
};
