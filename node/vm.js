const vm = require('vm');
const fs = require('fs');
const Path = require('path');
const callsite = require('callsite');

const VM = {

    _context: null,

    _hooks: [],

    constructor(globals = {}) {
        this._context = vm.createContext(globals);

        return this;
    },

    addLoadHook(fn) {
        this._hooks.push(fn);
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

        this._hooks.forEach(fn => { file = fn(file, path); });

        vm.runInContext(file, this._context, { filename: path });

        // done running module
        return this._context;
    },

    getContext() {
        return this._context;
    },

    updateContext(update) {
        Object.assign(this._context, update);
    }
};

module.exports = VM;
