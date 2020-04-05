/* globals testContext, CustomElementMeta */

(() => {
    testContext.metaObject = Object.assign({ __proto__: CustomElementMeta }, testContext.meta);

    if (testContext.onPropertyChanged) {
        testContext.prototype[testContext.metaObject.symbols.onPropertyChanged] = testContext.onPropertyChanged;
    }

    global.testResult = testContext.metaObject.prepare(testContext.prototype);
})();
