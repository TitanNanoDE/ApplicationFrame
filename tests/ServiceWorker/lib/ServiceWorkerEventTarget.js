/* eslint-env mocha */

const { expect } = require('chai');
const mochaVM = require('../../../node/mochaVM');
const ServiceWorkerGlobalScopeShim = require('../../shims/ServiceWorkerGlobalScopeShim');
const ServiceWorkerContainerShim = require('../../shims/ServiceWorkerContainerShim');

describe('ServiceWorkerEventTarget', () => {
    const vm = mochaVM();

    mochaVM.applyNodeEnv(vm);

    vm.updateContext({
        self: vm.getContext(),
    });

    vm.updateContext(ServiceWorkerGlobalScopeShim());

    it('should setup all event handlers', () => {
        vm.runModule('../../../testable/ServiceWorker/lib/ServiceWorkerEventTarget.js');

        vm.updateContext({ testResult: null });

        const { testResult, self } = vm.apply(() => {
            /* globals ServiceWorkerEventTarget */

            global.testResult = Object.create(ServiceWorkerEventTarget).constructor();
        });

        expect(testResult).to.have.property('on');
        expect(testResult).to.have.property('emit');
        expect(testResult).to.have.property('constructor');
        expect(self.onmessage).to.be.a('function');
    });

    it('should post events as messages', (cb) => {
        const timeout = setTimeout(() => expect.to.fail('test timeout'), 1000);

        vm.updateContext({
            testResult: null,
            testContext: {
                onPostMessage(result) {
                    clearTimeout(timeout);

                    try {
                        expect(result.type).to.be.equal('ServiceWorkerEventTarget');
                        expect(result.data).to.be.deep.equal({ value: 'data' });
                        expect(result.event).to.be.equal('event');
                    }catch (e) {
                        return cb(e);
                    }

                    cb();
                }
            }
        });

        vm.apply(() => {
            /* globals testContext */

            self.clients.postMessageHook(testContext.onPostMessage);

            const swet = Object.create(ServiceWorkerEventTarget).constructor();

            swet.emit('event', { value: 'data' });
        });
    });

    it('should dispatch events from messages', (done) => {
        const timeout = setTimeout(() => expect.to.fail('test timeout'), 1000);

        vm.updateContext(ServiceWorkerGlobalScopeShim());

        vm.updateContext({
            testResult: null,
            testContext: {
                onEvent(event) {
                    clearTimeout(timeout);

                    try {
                        expect(event).to.be.deep.equal({ value: 'test-event' });
                    } catch (e) {
                        return done(e);
                    }

                    done();
                }
            }
        });

        vm.apply(() => {
            const swet = Object.create(ServiceWorkerEventTarget).constructor();

            swet.on('test', testContext.onEvent);
            self.postMessageFromClient({ type: 'ServiceWorkerEventTarget', event: 'test', data: { value: 'test-event' } });
        });
    });

    it('should properly post messages for events dispatched inside a document context', (cb) => {
        const vm = mochaVM();

        mochaVM.applyNodeEnv(vm);

        const timeout = setTimeout(() => expect.to.fail('test timeout'), 1000);

        vm.updateContext({
            self: vm.getContext(),
            testResult: null,
            navigator: {
                serviceWorker: ServiceWorkerContainerShim(),
            },
            testContext: {
                onPostMessage(result) {
                    clearTimeout(timeout);

                    try {
                        expect(result.type).to.be.equal('ServiceWorkerEventTarget');
                        expect(result.data).to.be.deep.equal({ value: 'data' });
                        expect(result.event).to.be.equal('event');
                    }catch (e) {
                        return cb(e);
                    }

                    cb();
                }
            }
        });

        vm.runModule('../../../testable/ServiceWorker/lib/ServiceWorkerEventTarget.js');

        vm.apply(() => {
            navigator.serviceWorker.postMessageHook(testContext.onPostMessage);

            const swet = Object.create(ServiceWorkerEventTarget).constructor();

            swet.emit('event', { value: 'data' });
        });
    });

    it('should ignore none event messages');
    it('should also locally dispatch events');

});
