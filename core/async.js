const async = function(callback) {
    return Promise.resolve().then(callback);
};

export default async;
