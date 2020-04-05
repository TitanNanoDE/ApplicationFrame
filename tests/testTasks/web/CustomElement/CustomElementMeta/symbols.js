/* globals testContext, CustomElementMeta */

(() => {

    if (!testContext.cachedMeta) {
        const meta = Object.assign({ __proto__: CustomElementMeta }, testContext.meta);

        testContext.cachedMeta = meta;
    }

    global.testResult = testContext.cachedMeta.symbols;
})();
