/* eslint-env mocha */

const { expect } = require('chai');
const VM = require('../../testable/node/vm');
const istanbulVM = require('../../testable/node/istanbulVM');

describe('Node VM', () => {
    let vmInstance = null;

    it('should be possible to create a new VM', () => {
        vmInstance = Object.create(VM).constructor();

        expect(vmInstance).to.have.property('_context');
        expect(vmInstance).to.have.property('runModule');
    });

    it('should run a module', () => {
        let result = null;

        result = vmInstance.runModule('./testModule/test1');

        expect(result.x).to.be.undefined;
        expect(result.hello).to.be.undefined;
        expect(result.someTest).to.be.equal('value');
        expect(result.method).to.be.a('function');
        expect(result.something).to.be.undefined;

        result = vmInstance.runModule('./testModule/test2');

        expect(result.data.x).to.be.equal(100);
        expect(result.data.hello).to.be.equal('text');
    });

    it('should throw an error if a module can\'t be found', () => {
        const vm = istanbulVM();

        istanbulVM.applyNodeEnv(vm);

        vm.runModule('../../testable/node/vm');

        const result = vm.runModule('../testTasks/node/vm/invalidRequire');

        expect(result.console.stats.error).to.be.equal(1);
    });
});
