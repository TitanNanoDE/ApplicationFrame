const VM = require('../../../../node/vm');
const vmInstance = Object.create(VM).constructor({
    console: { error: console.write }
});

global.result = vmInstance.runModule('./testModule/test1');
