const DateShim = () => {
    const FakeDate = function(...args) {
        this._internal = new Date(...args);
    }

    FakeDate.now = function() {
        if (FakeDate._fakeNow) {
            return FakeDate._fakeNow;
        }

        if (FakeDate._offset) {
            return Date.now() + FakeDate._offset;
        }

        return Date.now();
    };

    return FakeDate;
};

module.exports = DateShim;
