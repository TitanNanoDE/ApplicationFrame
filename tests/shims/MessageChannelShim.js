const MessageChannelShim = () => {
    return function() {
        const postMessage = (target, message) => {
            Promise.resolve().then(() => {
                this[target].onmessage({
                    name: 'message',
                    data: message,
                    target: this,
                });
            });
        };

        this.port1 = {
            onmessage() {},
            postMessage(message) {
                postMessage('port2', message);
            },
        };

        this.port2 = {
            onmessage() {},
            postMessage(message) {
                postMessage('port1', message);
            },
        };
    };
};

module.exports = MessageChannelShim;
