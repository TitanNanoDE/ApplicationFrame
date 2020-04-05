/* globals testContext, CustomElement, CustomElementMeta */

(() => {
    const customElement = { __proto__: CustomElement };

    if (testContext.customElement.pCreate) {
        testContext.customElement[CustomElementMeta.symbols.create] = testContext.customElement.pCreate;
        delete testContext.customElement.pCreate;
    }

    Object.assign(customElement, testContext.customElement);

    CustomElementMeta.prepare(customElement);

    global.testResult = new customElement.constructor();

    testContext.HTMLElement = HTMLElement.prototype;
})();
