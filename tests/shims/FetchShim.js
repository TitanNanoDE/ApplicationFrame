const fetchShim = (dictonary) => {
    const fetchHooks = [];

    const callFetchHooks = function(requestUrl) {
        fetchHooks.forEach(cb => cb(requestUrl));
    }

    const fetch = function(requestUrl) {
        callFetchHooks(requestUrl);

        if (!dictonary[requestUrl]) {
            return Promise.reject({ error: '' });
        }

        return Promise.resolve({
            json() {
                return JSON.parse(dictonary[requestUrl]);
            }
        });
    };

    fetch._fetchHook = function(callback) {
        fetchHooks.push(callback);
    };

    return fetch;
}

module.exports = fetchShim;
