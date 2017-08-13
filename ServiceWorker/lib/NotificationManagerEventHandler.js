const NotificationManagerEventHandler = {

    constructor() {
        self.onnotificationclick = this.onNotificationClicked.bind(this);
        self.onnotificationclose = this.onNotificationClosed.bind(this);

        return this;
    },

    onNotificationClicked() {
        return true;
    },

    onNotificationClosed() {
        return true;
    },
};

export default NotificationManagerEventHandler;
