const CurrentFrameInterface = {
    _startTime: 0,
    _maxFrameDuration: 0,

    constructor({ startTime, maxFrameDuration }) {
        this._startTime = startTime;
        this._maxFrameDuration = maxFrameDuration;

        return this;
    },

    ttl() {
        const duration = performance.now() - this._startTime;
        const ttl = this._maxFrameDuration - duration;

        return ttl;
    },

    INTERUPT_CURRENT_TASK: Symbol('INTERUPT_CURRENT_TASK'),
};

export default CurrentFrameInterface;
