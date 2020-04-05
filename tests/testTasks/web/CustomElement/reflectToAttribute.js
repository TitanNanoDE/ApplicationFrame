/* globals testContext, reflectToAttribute */

(() => {
    reflectToAttribute(testContext.attribute, testContext.element, testContext.value, testContext.type);

    global.testResult = testContext.element.attributes;
})();
