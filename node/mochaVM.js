const VM = require('./vm');

module.exports = function(data = {}) {
    const context = {
        console: {
            stats: { error: [], warn: 0, log: 0, },
            log() { this.stats.log += 1; },
            error(...args) { this.stats.error.push(...args); },
            warn() { this.stats.warn += 1; },
            write(...args) { console.log(...args); },
        }
    };

    Object.assign(context, data);

    return Object.create(VM).constructor(context);
};

module.exports.applyNodeEnv = VM.applyNodeEnv;
