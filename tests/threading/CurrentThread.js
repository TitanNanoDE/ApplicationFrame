/* eslint-env mocha */

const expect = require('chai').expect;
const mochaVM = require('../../node/mochaVM');

const createVM = function() {
    const vm = mochaVM({});

    mochaVM.applyNodeEnv(vm);

    vm.updateContext({
        self: vm.getContext(),

        addEventListener() {},
        postMessage() {},

        BroadcastChannel: function(name) { // eslint-disable-line object-shorthand
            this.name = name;
        },

        Worker: function(sourcePath) { // eslint-disable-line object-shorthand
            this.source = sourcePath;

            this.postMessage = function() {};
        },

        MessagePort: function() { // eslint-disable-line object-shorthand
            this.postMessage = function() {};

            this.onmessage = function() {};
        }
    });

    return vm;
};

module.exports = function() {
    const vm = createVM();

    vm.runModule('../../testable/threading/lib/CurrentThread.js');

    it('should be able to bootstrap the current thread', () => {
        const { testResult } = vm.apply((CurrentThread) => {
            CurrentThread.bootstrap();

            global.testResult = CurrentThread;
        }, ['CurrentThread']);

        expect(testResult).to.have.property('mainThread');
    });

    it('should register callback methods', () => {
        const { testResult } = vm.apply((CurrentThread, pCallbacks) => {
            const callback = () => {};
            const id = CurrentThread.registerCallback(callback);

            global.testResult = { callback, id, CurrentThread, pCallbacks };
        }, ['CurrentThread', 'pCallbacks']);

        expect(testResult.CurrentThread[testResult.pCallbacks].get(testResult.id))
            .to.be.equal(testResult.callback);
    });

    it('should throw if parent hasn\'t been set', () => {
        vm.updateContext({ testResult: null, });

        const { testResult } = vm.apply((CurrentThread) => {
            try {
                return CurrentThread.parent;
            } catch (e) {
                global.testResult = e;
            }
        }, ['CurrentThread']);

        expect(testResult).to.be.an('error');
    });

    it('should set the parent when injection event is received', () => {
        const vm = createVM();

        vm.updateContext({ onmessage() {}, importScripts() {} });
        vm.runModule('../../testable/threading/lib/CurrentThread.js');

        const { testResult } = vm.apply((CurrentThread) => {
            const parent = new MessagePort();

            CurrentThread.bootstrap();
            self.onmessage({ data: { type: 'THREAD_MESSAGE_PARENT_INJECT', parent } });

            global.testResult = { parent: CurrentThread.parent };
        }, ['CurrentThread']);

        expect(testResult.parent)
            .to.have.property('ready');
        expect(testResult.parent)
            .to.have.property('call');
    });

    it('should call a callback by it\'s id', () => {
        const vm = createVM();

        vm.updateContext({ onmessage() {}, importScripts() {}, testResult: false });
        vm.runModule('../../testable/threading/lib/CurrentThread.js');

        const { testResult } = vm.apply((CurrentThread) => {
            CurrentThread.bootstrap();

            const callbackId = CurrentThread.registerCallback(() => {
                global.testResult = true;
            });

            self.onmessage({ data: { type: 'THREAD_MESSAGE_CALLBACK', callbackId, args: [] } });
        }, ['CurrentThread']);
    });
};
