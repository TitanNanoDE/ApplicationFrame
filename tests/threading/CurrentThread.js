/* eslint-env mocha */

const expect = require('chai').expect;
const mochaVM = require('../../node/mochaVM');

module.exports = function() {
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

            this.onmessage = {};
        }
    });

    vm.runModule('../../testable/threading/lib/CurrentThread.js');

    it('should be able to bootstrap the current thread', () => {
        const { testResult } = vm.apply(() => {
            /* globals CurrentThread */

            CurrentThread.bootstrap();

            global.testResult = CurrentThread;
        });

        expect(testResult).to.have.property('mainThread');
    });
};
