(() => {
    const frame = global.animationFrameRequests.pop();

    frame(Date.now());
})();
