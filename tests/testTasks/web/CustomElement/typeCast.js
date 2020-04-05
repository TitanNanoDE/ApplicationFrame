/* globals testContext, typeCast */

(() => {
    global.testResult = typeCast(testContext.value, testContext.type);
})();
