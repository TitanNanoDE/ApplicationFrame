/* globals testContext, CustomElement */

(() => {
    const { customElement } = testContext;

    customElement.__proto__ = CustomElement;

    global.testResult = customElement.connectedCallback();
})();
