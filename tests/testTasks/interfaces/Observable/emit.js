/* global testContext */

(() => {
    const { prototype } = testContext;

    const instance = Object.create(eval(`${prototype}`)).constructor();

    global.testResult = false;

    instance.observe({
        'testEvent'() {
            global.testResult = true;
        }
    });

    instance.emit('testEvent');
})();
