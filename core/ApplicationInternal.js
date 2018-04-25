
/** @lends ApplicationInternal# */
const ApplicationInternal = {
    /**
     * @type {Thread}
     */
    thread: null,

    /**
     * @type {Worker[]}
     */
    workers: null,

    /**
     * @type {Function[]}
     */
    listeners: null,

    /**
     * @type {Catalog}
     */
    modules: null,

    /**
     * this prototype defines a new application scope
     *
     * @constructs
     *
     * @return {void}
     */
    _make() {
        this.workers= [];
        this.listeners= [];

        this._make = null;
    }
};

export default ApplicationInternal;
