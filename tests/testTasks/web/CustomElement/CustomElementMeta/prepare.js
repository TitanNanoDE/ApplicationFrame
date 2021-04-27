/* globals testContext, CustomElementMeta, CustomElement */

(() => {
    testContext.metaObject = Object.assign({ __proto__: CustomElementMeta }, testContext.meta);
    testContext.prototype = Object.assign({ __proto__: CustomElement }, testContext.prototype);

    if (testContext.onPropertyChanged) {
        testContext.prototype[testContext.metaObject.symbols.onPropertyChanged] = testContext.onPropertyChanged;
    }

    global.testResult = testContext.metaObject.prepare(testContext.prototype);
})();
