const getRegistration = function() {
    if (navigator) {
        return navigator.serviceWorker.ready.then(registration => registration.ready);
    } else {
        return self.ServiceWorker.ready.then(registration => registration.ready);
    }
};

export default getRegistration;
