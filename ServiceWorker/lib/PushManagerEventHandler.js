const PushManagerEventHandler = {

    constructor() {
        self.onpush = (event) => this.onPush(event);
        self.onpushsubscriptionchange = (event) => this.onSubscriptionChanged(event);
    },

    onPush() {
        return true;
    },

    onSubscriptionChanged() {
        return true;
    }
};

export default PushManagerEventHandler;
