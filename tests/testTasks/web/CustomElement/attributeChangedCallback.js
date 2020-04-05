/* globals testContext, CustomElement */

(() => {
    const { customElement } = testContext;

    customElement.__proto__ = CustomElement;

    global.testResult = Object.entries(testContext.changes).map(([attribute, change]) => {
        return customElement.attributeChangedCallback(attribute, customElement[attribute], change);
    });
})();
