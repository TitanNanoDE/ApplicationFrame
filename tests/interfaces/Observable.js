/* eslint-env mocha */

const expect = require('chai').expect;
const async = require('../../testable/core/async').default;
const mochaVM = require('../../node/mochaVM');

module.exports = function(path, name) {
    const vm = mochaVM({});

    mochaVM.applyNodeEnv(vm);
    vm.runModule(path);

    it('should notify Observees', () => {
        vm.updateContext({
            testContext: { prototype: name },
        });

        const context = vm.runModule('../testTasks/interfaces/Observable/emit');

        return async(() => {
            expect(context.testResult).to.be.true;
        });
    });

    it('should stop notifying after unregistering', () => {
        vm.runModule('../testTasks/interfaces/Observable/emit');

        const { testResults } = vm.runModule('../testTasks/interfaces/Observable/emit_unregister');

        testResults.then(results => {
            expect(results).to.have.a.lengthOf(2);
            expect(results).to.have.ordered.members([true, false]);
        });
    });
};
