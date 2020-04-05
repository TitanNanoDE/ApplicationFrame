/* globals testContext, invokeCallback */

(() => {
    global.testResult = invokeCallback(
        testContext.attributeSymbols,
        testContext.attributeName,
        testContext.element, 'newValue', 'oldValue');
})();
