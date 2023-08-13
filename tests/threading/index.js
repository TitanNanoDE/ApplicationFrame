/* eslint-env mocha */

describe('Threading', () => {
    describe('Thread', () => {
        require('./Thread')();
    });

    describe('CurrentThread', () => {
        require('./CurrentThread')();
    });
});
