const PushManagerEventHandler = {

    constructor() {
        self.onpush = this.onPush.bind(this);
        self.onpushsubscriptionChanged = this.onSubscriptionChanged.bind(this);
    },

    onPush() {
        return true;
    },

    onSubscriptionChanged() {
        return true;
    }
};

export default PushManagerEventHandler;
