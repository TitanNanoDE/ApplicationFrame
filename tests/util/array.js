/* eslint-env mocha */
const expect = require('chai').expect;
const mochaVM = require('../../node/mochaVM');

describe('ArrayUtil', () => {
    const vm = mochaVM({});

    mochaVM.applyNodeEnv(vm);

    it('should only override empty array slots', () => {
        vm.runModule('../../testable/util/array');

        const result = vm.runModule('../testTasks/util/array.js');

        expect(result.result).to.eql([1, 'b', 2, 'd', 3, 'end', 'g', 'h']);
    });
});
