const NotificationManagerEventHandler = {

    constructor() {
        self.onnotificationclick = (event) => this.onNotificationClicked(event);
        self.onnotificationclose = (event) => this.onNotificationClosed(event);

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
