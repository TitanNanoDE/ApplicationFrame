/* eslint-env mocha */

const istanbulVM = require('../testable/node/istanbulVM');
const expect = require('chai').expect;


describe('Application', () => {
    const vm = istanbulVM();

    istanbulVM.applyNodeEnv(vm);

    vm.runModule('../testable/core/Application');

    it('should construct a new application', () => {
        const result = vm.runModule('./testTasks/Application/construct');

        expect(Object.getPrototypeOf(result.instance)).to.equal(result.Application);
    });

    it('should init the application', () => {
        const result = vm.runModule('./testTasks/Application/init');

        expect(result.console.stats.log).to.equal(1);
    });

    it('should broadcast an event on the application', (done) => {
        vm.getContext().instance.on('test#1', () => done());

        vm.runModule('./testTasks/Application/broadcast');
    });

    it('should emit a termination event when terminating', (done) => {
        vm.getContext().instance.on('terminate', (value) => {
            expect(value).to.be.eql('because');
            done();
        });

        vm.runModule('./testTasks/Application/termination');
    })
});
