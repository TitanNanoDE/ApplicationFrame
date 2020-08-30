/* eslint-env mocha */

const mochaVM = require('../../node/mochaVM');
const { expect } = require('chai');


describe('Custom Element', () => {

    const vm = mochaVM();
    const HTMLElement = require('../shims/HTMLElementShim');

    mochaVM.applyNodeEnv(vm);
    vm.updateContext({ HTMLElement });
    vm.runModule('../../testable/web/CustomElement');

    describe('normalizeAttributeConfig', () => {
        it('should set the default properties', () => {
            const attributeConfig = {};

            vm.updateContext({ testResult: null, testContext: { attributeConfig } });

            const { testResult } = vm.runModule('../testTasks/web/CustomElement/normalizeAttributeConfig');

            expect(testResult).to.deep.equal({ type: 'string', reflectChanges: false });
        });

        it('should set the default properties', () => {
            const attributeConfig = { type: 'number', other: 1 };

            vm.updateContext({ testResult: null, testContext: { attributeConfig } });

            const { testResult } = vm.runModule('../testTasks/web/CustomElement/normalizeAttributeConfig');

            expect(testResult).to.deep.equal({ type: 'number', reflectChanges: false, other: 1 });
        });

        it('should convert a string into a type config object', () => {
            const attributeConfig = 'number';

            vm.updateContext({ testResult: null, testContext: { attributeConfig } });

            const { testResult } = vm.runModule('../testTasks/web/CustomElement/normalizeAttributeConfig');

            expect(testResult).to.deep.equal({ type: 'number', reflectChanges: false });
        });
    });

    describe('getAttributeCallbackName', () => {
        it('should add proper pre and post fixes', () => {
            vm.updateContext({ testResult: null, testContext: { attributeName: 'testAttribute' } });

            const { testResult } = vm.runModule('../testTasks/web/CustomElement/getAttributeCallbackName');

            expect(testResult).to.be.equal('onTestAttributeChanged');
        });
    });

    describe('invokeCallback', () => {
        it('should invoke the attribute callback', () => {
            const attributeName = 'testAttribute';
            const verifyAttributeName = 'verify';

            const attributeSymbols = {
                'onTestAttributeChanged': Symbol('callbackSymbol'),
                'onVerifyChanged': Symbol('otherCallbackSymbol'),
            };

            const element = {
                [attributeSymbols.onTestAttributeChanged](newValue) { return newValue; },
                [attributeSymbols.onVerifyChanged](newValue, oldValue) { return oldValue; },
            };

            vm.updateContext({ testResult: null, testContext: { attributeName, attributeSymbols, element } });

            const { testResult } = vm.runModule('../testTasks/web/CustomElement/invokeCallback');

            expect(testResult).to.be.equal('newValue');

            vm.updateContext({ testResult: null, testContext: { attributeName: verifyAttributeName, attributeSymbols, element } });

            const { testResult: verifyTestResult } = vm.runModule('../testTasks/web/CustomElement/invokeCallback');

            expect(verifyTestResult).to.be.equal('oldValue');
        });

        it('should return the new value if there is no callback for an attribute', () => {
            const attributeName = 'testAttribute';

            const attributeSymbols = {
                'onTestAttributeChanged': Symbol('callbackSymbol'),
            };

            const element = {};

            vm.updateContext({ testResult: null, testContext: { attributeName, attributeSymbols, element } });

            const { testResult } = vm.runModule('../testTasks/web/CustomElement/invokeCallback');

            expect(testResult).to.be.equal('newValue');
        });
    });

    describe('typeCast', () => {
        it('should return value unchanged if type is unknown', () => {
            const value = Symbol('testValue');
            const type = 'symbol';

            vm.updateContext({ testResult: null, testContext: { value, type } });

            const { testResult } = vm.runModule('../testTasks/web/CustomElement/typeCast');

            expect(testResult).to.be.equal(value);
        });

        it('should return string representation when casting to string', () => {
            const value = 13;
            const type = 'string';

            vm.updateContext({ testResult: null, testContext: { value, type } });

            const { testResult } = vm.runModule('../testTasks/web/CustomElement/typeCast');

            expect(testResult).to.be.equal('13');
            expect(testResult).to.be.string;
            expect(testResult).to.be.not.equal(13);
        });

        it('should return boolean value when casting to boolean', () => {
            const type = 'boolean';

            vm.updateContext({ testResult: null, testContext: { value: '', type } });

            const { testResult } = vm.runModule('../testTasks/web/CustomElement/typeCast');

            expect(testResult).to.be.true;
            expect(testResult).to.be.not.equal('');

            vm.updateContext({ testResult: null, testContext: { value: null, type } });

            const { testResult: testResult2 } = vm.runModule('../testTasks/web/CustomElement/typeCast');

            expect(testResult2).to.be.false;

            vm.updateContext({ testResult: null, testContext: { value: true, type } });

            const { testResult: testResultRealTrue } = vm.runModule('../testTasks/web/CustomElement/typeCast');

            expect(testResultRealTrue).to.be.true;

            vm.updateContext({ testResult: null, testContext: { value: false, type } });

            const { testResult: testResultRealFalse } = vm.runModule('../testTasks/web/CustomElement/typeCast');

            expect(testResultRealFalse).to.be.false;
        });

        it('should return a floating point value when casting to number', () => {
            const value = '1.654';
            const type = 'number';

            vm.updateContext({ testResult: null, testContext: { value, type } });

            const { testResult } = vm.runModule('../testTasks/web/CustomElement/typeCast');

            expect(testResult).to.be.a('number');
            expect(testResult).to.be.not.equal('1.654');
            expect(testResult).to.be.equal(1.654);

            const invalidNumber = 'nan';

            vm.updateContext({ testResult: null, testContext: { value: invalidNumber, type } });

            const { testResult: invalidNumberResult } = vm.runModule('../testTasks/web/CustomElement/typeCast');

            expect(invalidNumberResult).to.be.equal(0);
        });

        it('should return a integer value when casting to int', () => {
            const value = '135.6';
            const type = 'int';

            vm.updateContext({ testResult: null, testContext: { value, type } });

            const { testResult } = vm.runModule('../testTasks/web/CustomElement/typeCast');

            expect(testResult).to.be.a('number');
            expect(testResult).to.be.not.equal('135.6');
            expect(testResult).to.be.not.equal(135.6);
            expect(testResult).to.be.equal(135);

            const invalidNumber = 'nan';

            vm.updateContext({ testResult: null, testContext: { value: invalidNumber, type } });

            const { testResult: invalidNumberResult } = vm.runModule('../testTasks/web/CustomElement/typeCast');

            expect(invalidNumberResult).to.be.equal(0);
        });
    });

    describe('reflectToAttribute', () => {
        it('should apply the value to the matching attribute', () => {
            const attribute = 'testAttribute';
            const element = { attributes: {}, setAttribute(name, value) { this.attributes[name] = value.toString(); } };
            const value = 123;
            const type = 'number';

            vm.updateContext({ testResult: null, testContext: { attribute, element, value, type } });

            const { testResult } = vm.runModule('../testTasks/web/CustomElement/reflectToAttribute');

            expect(testResult).to.be.deep.equal({ testAttribute: '123' });
        });

        it('should remove an attrbute if the applied value is falsy', () => {
            const attribute = 'testAttribute';
            const element = { attributes: { testAttribute: '123' }, removeAttribute(name) { delete this.attributes[name]; } };
            const value = '';
            const type = 'string';

            vm.updateContext({ testResult: null, testContext: { attribute, element, value, type } });

            const { testResult } = vm.runModule('../testTasks/web/CustomElement/reflectToAttribute');

            expect(testResult).to.be.deep.equal({});
        });

        it('should set the value to an empty string if type is boolan and value true', () => {
            const attribute = 'testAttribute';
            const element = { attributes: { testAttribute: 'test' }, setAttribute(name, value) { this.attributes[name] = value.toString(); } };
            const value = true;
            const type = 'boolean';

            vm.updateContext({ testResult: null, testContext: { attribute, element, value, type } });

            const { testResult } = vm.runModule('../testTasks/web/CustomElement/reflectToAttribute');

            expect(testResult).to.be.deep.equal({ testAttribute: '' });
        });

        it('should rmove the attribute if type is boolan and value false', () => {
            const attribute = 'testAttribute';
            const element = {
                attributes: { testAttribute: 'test' },
                setAttribute(name, value) { this.attributes[name] = value.toString(); },
                removeAttribute(name) { delete this.attributes[name]; }
            };
            const value = false;
            const type = 'boolean';

            vm.updateContext({ testResult: null, testContext: { attribute, element, value, type } });

            const { testResult } = vm.runModule('../testTasks/web/CustomElement/reflectToAttribute');

            expect(testResult).to.be.deep.equal({});
        });
    });

    describe('CustomElement', () => {
        describe('constructor', () => {
            it('should construct a new HTMLElement object', () => {
                const customElement = {};

                vm.updateContext({ testResult: null, testContext: { customElement } });

                const { testResult, testContext } = vm.runModule('../testTasks/web/CustomElement/constructor.js');

                expect(testContext.HTMLElement._meta.invocations).to.contain(testResult);
            });

            it('should invoke the private create method during construction', () => {
                let createCalled = false;
                const customElement = {
                    pCreate() {
                        createCalled = true;
                    }
                };

                vm.updateContext({ testResult: null, testContext: { customElement } });
                vm.runModule('../testTasks/web/CustomElement/constructor.js');

                expect(createCalled).to.be.true;
            });
        });

        describe('attributeChangedCallback', () => {
            it('should assign new attribute values', () => {
                let attr1Value = true;

                const customElement = {
                    get attr1() { return attr1Value; },
                    set attr1(value) { attr1Value = value; }
                };

                const changes = { attr1: '2' };

                vm.updateContext({ testResult: null, testContext: { changes, customElement } });
                vm.runModule('../testTasks/web/CustomElement/attributeChangedCallback.js');

                expect(attr1Value).to.be.eq('2');
            });

            it('should bail if the value didn\'t change', () => {
                let attr1Value = 'test';
                let setterCalled = false;

                const customElement = {
                    get attr1() { return attr1Value; },
                    set attr1(value) { attr1Value = value; setterCalled = true; }
                };

                const changes = { attr1: 'test' };

                vm.updateContext({ testResult: null, testContext: { changes, customElement } });
                vm.runModule('../testTasks/web/CustomElement/attributeChangedCallback.js');

                expect(setterCalled).to.be.false;
            });
        });

        describe('connectedCallback', () => {
            it('should call the attrribute changed callback', () => {
                let invocation = null;

                const customElement = {
                    attributes: [{
                        name: 'attr1',
                        value: 5,
                    }],

                    attr1: 0,
                    attributeChangedCallback(...args) {
                        invocation = args;
                    }
                };


                vm.updateContext({ testResult: null, testContext: { customElement } });
                vm.runModule('../testTasks/web/CustomElement/connectedCallback.js');

                expect(invocation).to.be.deep.eq(['attr1', 0, 5]);
            });

            it('should not call the attribute changed callback if value is already set', () => {
                let invocation = null;

                const customElement = {
                    attributes: [{
                        name: 'attr1',
                        value: 5,
                    }],

                    attr1: 5,
                    attributeChangedCallback(...args) {
                        invocation = args;
                    }
                };


                vm.updateContext({ testResult: null, testContext: { customElement } });
                vm.runModule('../testTasks/web/CustomElement/connectedCallback.js');

                expect(invocation).to.be.deep.eq(null);
            });
        });
    });

    describe('CustomElementMeta', () => {
        describe('symbols getter', () => {
            it('should return symbols for all attributes, callbacks and create method', () => {
                const meta = { attributes: { attr1: {}, attr2: {} } };

                vm.updateContext({ testResult: null, testContext: { meta } });

                const { testResult } = vm.runModule('../testTasks/web/CustomElement/CustomElementMeta/symbols.js');

                expect(testResult).to.have.property('create').which.is.a('symbol');
                expect(testResult).to.have.property('attr1').which.is.a('symbol');
                expect(testResult).to.have.property('attr2').which.is.a('symbol');
                expect(testResult).to.have.property('onAttr1Changed').which.is.a('symbol');
                expect(testResult).to.have.property('onAttr2Changed').which.is.a('symbol');
            });

            it('should return the same symbols for all calls', () => {
                const meta = { attributes: { attr1: {}, attr2: {} } };

                vm.updateContext({ testResult: null, testContext: { meta } });

                const { testResult: initialResult } = vm.runModule('../testTasks/web/CustomElement/CustomElementMeta/symbols.js');
                const { testResult } = vm.runModule('../testTasks/web/CustomElement/CustomElementMeta/symbols.js');

                expect(testResult).to.be.deep.equal(initialResult);
            });
        });

        describe('prepare', () => {
            it('should define observed attributes and create property accessors', () => {
                const prototype = { constructor: function CustomElement() {} };
                const meta = { attributes: { firstAttr: {}, secondAttr: {}, lastAttr: {} } };

                vm.updateContext({ testResult: null, testContext: { prototype, meta } });

                const { testResult } = vm.runModule('../testTasks/web/CustomElement/CustomElementMeta/prepare.js');

                expect(testResult.constructor)
                    .to.have.property('prototype')
                    .which.is.equal(testResult);

                expect(testResult.constructor)
                    .has.property('observedAttributes')
                    .which.is.deep.equal(['firstAttr', 'secondAttr', 'lastAttr']);

                Object.keys(meta.attributes).forEach(attr => {
                    expect(testResult[attr]).to.be.null;
                    testResult[attr] = 1;
                    expect(testResult[attr]).to.be.equal('1');
                });
            });

            it('should invoce the property changed callback', () => {
                const prototype = { constructor: function CustomElement() {} };
                const meta = { attributes: { firstAttr: {}, secondAttr: {}, lastAttr: {} } };
                const onPropertyChangedData = {};
                const onPropertyChanged = function(name, oldValue, newValue) {
                    onPropertyChangedData.name = name;
                    onPropertyChangedData.oldValue = oldValue;
                    onPropertyChangedData.newValue = newValue;
                };

                vm.updateContext({ testResult: null, testContext: { prototype, meta, onPropertyChanged } });

                const { testResult } = vm.runModule('../testTasks/web/CustomElement/CustomElementMeta/prepare.js');

                testResult.secondAttr = 'customValue';

                expect(onPropertyChangedData.name).to.be.equal('secondAttr');
                expect(onPropertyChangedData.oldValue).to.be.equal(null);
                expect(onPropertyChangedData.newValue).to.be.equal('customValue');
            });

            it('should reflect the attribute state if config is enabled', () => {
                const prototype = {
                    attributes: {}, constructor: function CustomElement() {},
                    setAttribute(name, value) { this.attributes[name] = value.toString(); }
                };
                const meta = { attributes: { firstAttr: {}, secondAttr: { reflectChanges: true }, lastAttr: {} } };

                vm.updateContext({ testResult: null, testContext: { prototype, meta } });

                const { testResult } = vm.runModule('../testTasks/web/CustomElement/CustomElementMeta/prepare.js');

                testResult.secondAttr = 'customValue';

                expect(prototype.attributes).to.have.property('secondAttr').which.is.equal('customValue');
            });

            it('should not reflect the attribute state if config is disabled', () => {
                const prototype = {
                    attributes: { firstAttr: '123' }, constructor: function CustomElement() {},
                    setAttribute(name, value) { this.attributes[name] = value.toString(); }
                };
                const meta = { attributes: { firstAttr: {}, secondAttr: {}, lastAttr: {} } };

                vm.updateContext({ testResult: null, testContext: { prototype, meta } });

                const { testResult } = vm.runModule('../testTasks/web/CustomElement/CustomElementMeta/prepare.js');

                testResult.firstAttr = 'value';

                expect(prototype.attributes).to.have.property('firstAttr').which.is.equal('123');
            });
        });
    });
});
