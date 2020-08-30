/* global testContext */

(() => {
    const { prototype } = testContext;
    const async = require('../../../../testable/core/async').default;

    const instance = Object.create(eval(`${prototype}`)).constructor();
    const testResults = [];
    let called = false;

    const observer = {
        'testEvent'() {
            called = true;
        }
    };

    instance.observe(observer);
    instance.emit('testEvent');

    global.testResults = async(() => {
        testResults.push(called);

        called = false;

        instance.removeObserver(observer);
        instance.emit('testEvent');

        return async(() => {
            testResults.push(called);

            return testResults;
        });
    });
})();
