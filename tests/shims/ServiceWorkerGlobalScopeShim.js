const ServiceWorkerGlobalScopeShim = () => {
    const clientPostMessageHooks = [];

    const shim = {
        navigator: {},
        registration: {},
        caches: {},
        clients: {
            matchAll() {
                return Promise.resolve([{
                    postMessage(message) {
                        clientPostMessageHooks.forEach(callback => callback(message));
                    }
                }]);
            },

            postMessageHook(cb) {
                clientPostMessageHooks.push(cb);
            }
        },
        fetch() {},

        postMessageFromClient(message) {
            this.onmessage({ data: message, source: null });
        }
    };

    return shim;
};

module.exports = ServiceWorkerGlobalScopeShim;
