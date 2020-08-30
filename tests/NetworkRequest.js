/* eslint-env mocha */

const mochaVM = require('../node/mochaVM');
const expect = require('chai').expect;


describe('NetworkRequest', () => {
    const vm = mochaVM();

    mochaVM.applyNodeEnv(vm);

    vm.runModule('../testable/core/NetworkRequest');

    it('should construct a new request', () => {
        const result = vm.runModule('./testTasks/NetworkRequest/construct');

        expect(result.instance.url).to.equal('https://example.org');
        expect(result.instance.method).to.equal('POST');
        expect(result.instance.type).to.equal('json');
    });
});
