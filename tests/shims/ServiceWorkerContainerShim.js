const ServiceWorkerContainerShim = () => {
    const postMessageHooks = [];

    const serviceWorker = {
        postMessage(message) {
            postMessageHooks.forEach(cb => cb(message));
        }
    };

    const shim = {
        postMessageHook(cb) {
            postMessageHooks.push(cb);
        },
        controller: serviceWorker,
        ready: Promise.resolve({
            scriptUrl: 'localhost/dummy-sw.js',
            state: 'activated',
            active: serviceWorker,
        }),
    };

    return shim;
};

module.exports = ServiceWorkerContainerShim;
