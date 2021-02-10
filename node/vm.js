const fs = require('fs');
const Path = require('path');
const callsite = require('callsite');
const nativeVM = require('vm');
const moduleSystem = require('module');

const VM = {

    /**
     * @type {object}
     */
    _context: null,

    /** @type {Function[]} */
    _hooks: [],

    constructor(globals = {}) {
        this._context = nativeVM.createContext(globals);

        return this;
    },


    /**
     * Allows to intercept and manipulate the source code of a module before it's compiled
     *
     * @param {Function} fn callback function
     */
    addLoadHook(fn) {
        this._hooks.push(fn);
    },

    /**
     * loads and executes a module inside the VM
     *
     * @param  {string} path file path of the module
     *
     * @return {object}
     */
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

        nativeVM.runInContext(file, this._context, { filename: path });

        // done running module
        return this._context;
    },

    apply(callback) {
        const executor = `(function() { var executor = ${callback.toString()}; executor(); })()`;

        nativeVM.runInContext(executor, this._context, { filename: `${__dirname}/anonymous.vm.js` });

        return this._context;
    },

    /**
     * access the current VM context
     *
     * @return {object}
     */
    getContext() {
        return this._context;
    },

    updateContext(update) {
        Object.assign(this._context, update);
    }
};

module.exports = VM;

const vmCompile = (vm) => function(content, filename) {
    vm._hooks.forEach(fn => { content = fn(content, filename); });

    const wrapper = moduleSystem.Module.wrap(content);
    const compiledWrapper = (new nativeVM.Script(wrapper, filename)).runInContext(vm._context, { filename });
    const dirname = Path.dirname(filename);
    const newRequire = this.require.bind(this);

    newRequire.resolve = require.resolve;

    const result = compiledWrapper
        .call(this.exports, this.exports, newRequire, this, filename, dirname);

    return result;
};

const vmRequire = (vmModule, vmCache, cache, nativeCompile, vmCompile) => function(path) {
    const parsedPath = Path.parse(path);
    let exception = null;
    let loadedModule = null;

    let cwd = callsite()[1].getFileName();

    cwd = Path.dirname(cwd);

    if (!(parsedPath.root === '' && parsedPath.dir === '')) {
        path = Path.resolve(cwd, path);
    }

    moduleSystem._cache = vmCache;
    moduleSystem.Module.prototype._compile = vmCompile;

    try {
        loadedModule = vmModule.require(path);

    } catch (e) {
        exception = e;
    } finally {
        moduleSystem._cache = cache;
        moduleSystem.Module.prototype._compile = nativeCompile;
    }

    if (exception) {
        throw exception;
    }

    return loadedModule;
};

/**
 * applies the standart node environment to a VM
 *
 * @param  {VM} vm
 *
 * @return {undefined}
 */
module.exports.applyNodeEnv = function(vm) {
    const vmModule = new moduleSystem.Module('base.vm', null);
    const cache = moduleSystem._cache;
    const vmCache = {};
    const nativeCompile = moduleSystem.Module.prototype._compile;

    vmModule.filename = `${__dirname}/base.vm.js`;
    vmModule.paths = module.paths;

    vm.updateContext({
        require: vmRequire(vmModule, vmCache, cache, nativeCompile, vmCompile(vm)),
        module: vmModule,
        exports: vmModule.exports,
    });

    const context = vm.getContext();

    context.global = context;
    context.require.resolve = require.resolve;
};
