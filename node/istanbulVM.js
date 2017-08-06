const istanbul = require('istanbul');
const VM = require('./vm');
const callsite = require('callsite');
const Path = require('path');

const instrumenter = new istanbul.Instrumenter();

module.exports = function(data = {}) {
    const coverage = Object.keys(global).find(key => key.indexOf('$$cov_') === 0);

    const context = {
        console: {
            stats: { error: 0, warn: 0, log: 0, },
            log() { this.stats.log += 1; },
            error() { this.stats.error += 1; },
            warn() { this.stats.warn += 1; },
            write(...args) { console.log(...args); }
        },
        __coverage__: global[coverage],
    };

    context.global = context;
    Object.assign(context, data);

    const vm = Object.create(VM).constructor(context);

    vm._hooks = [];

    if (coverage) {
        vm.addLoadHook((code, filename) => {
            if (filename.indexOf('.travis') < 0) {
                code = instrumenter.instrumentSync(code, filename);
            }

            return code;
        });
    }

    return vm;
};

module.exports.applyNodeEnv = function(vm) {
    vm.updateContext({
        module: { exports: {} },
        require(path) {
            let cwd = callsite()[1].getFileName();
            cwd = Path.dirname(cwd);
            path = Path.resolve(cwd, path);

            return require(path);
        },
    });

    vm.updateContext({
        exports: vm.getContext().module.exports,
    });
};
