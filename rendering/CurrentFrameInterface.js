/**
 * An abstract representation of the currently rendering frame
 */
const CurrentFrameInterface = {
    /** @private */
    _startTime: 0,

    /** @private */
    _maxFrameDuration: 0,

    /**
     * @param {number} startTime    the time the current frame has started rendering
     * @param {number} maxFrameDuration the maximum duration
     *
     * @return {CurrentFrameInterface}
     */
    constructor({ startTime, maxFrameDuration } = {}) {
        this._startTime = startTime;
        this._maxFrameDuration = maxFrameDuration;

        return this;
    },

    /**
     * the remaining available render time of the frame
     *
     * @return {number}
     */
    ttl() {
        const duration = performance.now() - this._startTime;
        const ttl = this._maxFrameDuration - duration;

        return ttl;
    },

    INTERUPT_CURRENT_TASK: Symbol('INTERUPT_CURRENT_TASK'),
};

export default CurrentFrameInterface;
