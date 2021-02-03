/**
 * Automatically subscribes to all events of the target if host defines a handler for them.
 *
 * @param  {EventTarget} eventTarget
 * @param  {Object} host
 *
 * @return {{ unsubscribe: Function }}
 */
export const SubscriberFeature = function(eventTarget, host) {
    if (!eventTarget.on || !eventTarget.Events) {
        throw new TypeError('provided event target does not support auto subscription!');
    }

    const subscriptions = Object.values(eventTarget.Events)
        .map(event => {
            if (!host[event]) {
                return;
            }

            const subscription = [event, host[event].bind(host)];

            eventTarget.on(...subscription);

            return subscription;
        }).filter(subscription => !!subscription);

    return {
        unsubscribe() {
            subscriptions.forEach((subscription) => {
                console.log(subscription);
                eventTarget.removeListener(...subscription);
            });
        }
    };
};
