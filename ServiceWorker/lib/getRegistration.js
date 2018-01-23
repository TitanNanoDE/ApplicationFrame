const hasNavigator = (typeof navigator === 'object');

const getRegistration = function() {
    if (hasNavigator && navigator.serviceWorker) {
        return navigator.serviceWorker.ready;
    } else {
        return Promise.resolve(self.registration);
    }
};

export default getRegistration;
