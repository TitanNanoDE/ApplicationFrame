/* eslint-env mocha */

const { expect } = require('chai');
const VM = require('../../node/vm');
const mochaVM = require('../../node/mochaVM');

describe('Node VM', () => {
    let vmInstance = null;

    it('should be possible to create a new VM', () => {
        vmInstance = Object.create(VM).constructor();

        expect(vmInstance).to.have.property('_context');
        expect(vmInstance).to.have.property('runModule');
    });

    it('should run a module', () => {
        const vm = mochaVM();

        VM.applyNodeEnv(vm);

        let { result } = vm.runModule('../testTasks/node/vm/runModule');

        expect(result.x).to.be.undefined;
        expect(result.hello).to.be.undefined;
        expect(result.someTest).to.be.equal('value');
        expect(result.method).to.be.a('function');
        expect(result.something).to.be.undefined;

        ({ result } = vm.runModule('../testTasks/node/vm/runModule2'));

        expect(result.data.x).to.be.equal(100);
        expect(result.data.hello).to.be.equal('text');
    });

    it('should throw an error if a module can\'t be found', () => {
        const vm = mochaVM();

        mochaVM.applyNodeEnv(vm);

        vm.runModule('../../node/vm');

        const result = vm.runModule('../testTasks/node/vm/invalidRequire');

        expect(result.console.stats.error).to.have.lengthOf.at.least(1);
    });
});
