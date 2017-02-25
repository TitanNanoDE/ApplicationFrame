const vm = require('vm');
const fs = require('fs');
const Path = require('path');
const callsite = require('callsite');

const VM = {

    _context: null,

    constructor(globals = {}) {
        this._context = vm.createContext(globals);

        return this;
    },

    runModule(path) {
        let file = null;

        try {
            const callerDir = Path.dirname(callsite()[1].getFileName());

            // resolve the relative path
            path = Path.resolve(callerDir, path);

            // find the actual module file
            path = require.resolve(path);

            // read the file content
            file = fs.readFileSync(path, 'utf-8');
        } catch (e) {
            console.error('unable to locate module', path, e);
            return;
        }

        vm.runInContext(file, this._context);

        // done running module
        return this._context;
    }
};

module.exports = VM;
