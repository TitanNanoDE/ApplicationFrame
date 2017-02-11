/* eslint-env mocha */

const expect = require('chai').expect;
const Import = require('./tools/import');

describe('Catalog', () => {

    const catalogModule = Import('../../testable/core/prototypes/Catalog');
    let instance = null;

    it('should be possible to create an instance', () => {
        const {　default: Catalog } = catalogModule.value;

        instance = Object.create(Catalog);
        instance._make();

        expect(Object.getPrototypeOf(instance)).to.be.equal(Catalog);
    });

    it('should be possible to register an \'available\' event listener', () => {
        let promise = instance.on('available', ['test', 'prop1', 'prop2', 'prop3']);

        expect(promise).to.be.an.instanceOf(Promise);
    });

});
