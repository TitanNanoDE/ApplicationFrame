(function() {
    this.handler.onNotificationClicked = function() { global.clicked = true; };

    this.handler.onNotificationClosed = function() { global.closed = true; };

    global.onnotificationclick();
    global.onnotificationclose();
})();
