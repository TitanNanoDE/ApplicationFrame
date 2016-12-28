/* eslint-env mocha */

const expect = require('chai').expect;

const Import = function(path) {

    let module = { value: null, };

    it('should import the module', () => {
        module.value = require(path);

        expect(module.value).to.be.not.undefined;
        expect(module.value).to.be.not.null;
    });

    return module;
}

module.exports = Import;
