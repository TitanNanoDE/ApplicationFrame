const istanbul = require('istanbul');
const VM = require('./vm');

const instrumenter = new istanbul.Instrumenter();

module.exports = function(data = {}) {
    const coverage = Object.keys(global).find(key => key.indexOf('$$cov_') === 0);

    const context = {
        console: {
            stats: { error: [], warn: 0, log: 0, },
            log() { this.stats.log += 1; },
            error(...args) { this.stats.error.push(...args); },
            warn() { this.stats.warn += 1; },
            write(...args) { console.log(...args); }
        },
        __coverage__: global[coverage],
    };

    Object.assign(context, data);

    const vm = Object.create(VM).constructor(context);

    vm._hooks = [];

    if (coverage) {
        vm.addLoadHook((code, filename) => {
            if (filename.indexOf('tests') > -1) {
                return code;
            }

            if (filename.indexOf('.travis') > -1) {
                return code;
            }

            if (filename.indexOf('node_modules') > -1) {
                return code;
            }

            return instrumenter.instrumentSync(code, filename);
        });
    }

    return vm;
};

module.exports.applyNodeEnv = VM.applyNodeEnv;
