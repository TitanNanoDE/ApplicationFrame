const vm = require('vm');
const fs = require('fs');
const util = require('util');

const VM = {

    _context: null,

    constructor(globals = {}) {
        this._context = vm.createContext(globals);

        return this;
    },

    runModule(path) {
        let file = null;

        try {
            file = fs.openFileSync(path);
        } catch (e) {
            console.error('unable to locate module', path, e);
            return;
        }

        vm.runInContext(file, this._context);

        // done running module
        return util.inspect(this._context);
    }
};

module.exports = VM;
