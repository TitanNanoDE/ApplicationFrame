/* eslint-env mocha */

const expect = require('chai').expect;
const mochaVM = require('../../node/mochaVM');

module.exports = function() {
    const vm = mochaVM({});

    mochaVM.applyNodeEnv(vm);

    vm.updateContext({
        self: vm.getContext(),

        addEventListener() {},
        postMessage() {},

        BroadcastChannel: function(name) { // eslint-disable-line object-shorthand
            this.name = name;
        },

        Worker: function(sourcePath) { // eslint-disable-line object-shorthand
            this.source = sourcePath;

            this.postMessage = function() {};
        },

        MessagePort: function() { // eslint-disable-line object-shorthand
            this.postMessage = function() {};

            this.onmessage = {};
        },

        setTimeout(...args) {
            return setTimeout(...args);
        }
    });

    vm.runModule('../../testable/threading/lib/Thread.js');

    it('should create a new thread', () => {
        const { testResult, testContext } = vm.apply(() => {
            /* globals Thread */

            const thread = Object.create(Thread).constructor('./test-thread.js');

            global.testResult = thread;
            global.testContext = { Thread };
        });

        expect(testResult).to.have.property('__proto__', testContext.Thread);
    });

    it('should be able to create a thread from strings', () => {
        const { testResult, testContext } = vm.apply(() => {
            const thread = Thread.from('channels/shared');

            global.testResult = thread;
            global.testContext = { Thread };
        });

        expect(testResult).to.have.property('__proto__', testContext.Thread);
    });

    it('should throw if no MessageChannel is provided', () => {
        const { testResult } = vm.apply(() => {
            global.testResult = () => Thread.from({ invalid: true });
        });

        expect(testResult).to.throw();
    });

    it('should create a thread from a message port', () => {
        const { testResult, testContext } = vm.apply(() => {
            const thread = Thread.from(new MessagePort());

            global.testResult = thread;
            global.testContext = { Thread };
        });

        expect(testResult).to.have.property('__proto__', testContext.Thread);
    });

    it('should not return a then method, we are not a promise', () => {
        const { testResult } = vm.apply(() => {
            const thread = Object.create(Thread).constructor('./test-thread.js');

            global.testResult = thread.then;
        });

        expect(testResult).to.be.null;
    });

    it('should return the original property value, if it exists', () => {
        const { testResult, testContext } = vm.apply(() => {
            const thread = Object.create(Thread).constructor('./test-thread.js');

            global.testResult = thread.call;
            global.testContext = { Thread };
        });

        expect(testResult).to.be.equal(testContext.Thread.call);
    });

    it('should try to invoke the remote method', () => {
        const { testResult } = vm.apply(() => {
            const thread = Object.create(Thread).constructor('./test-thread.js');

            global.testResult = thread.doSomething();
        });

        expect(testResult).to.have.property('then');
        expect(testResult).to.have.property('catch');
    });

    it('should not copy transfered arguments', () => {
        const { testResult, testContext } = vm.apply(() => {
            const arg1 = { content: 'test1' };
            const arg2 = { content: 'test2' };

            global.testContext = { arg1, arg2 };

            const worker = new Worker('./test-thread.js');

            worker.postMessage = function(...args) {
                global.testResult = args;
            };

            const thread = Object.create(Thread).constructor(worker);

            thread.call('test', [arg1, arg2], [arg2]);
        });

        expect(testResult).to.have.property('0').which.does.deep.include({ args: [testContext.arg1, testContext.arg2] });
        expect(testResult).to.have.property('1').which.does.deep.equal([testContext.arg2]);
    });

    it('should emit thread events', () => {
        const { testResult } = vm.apply(() => {
            const worker = new Worker('./test-thread.js');
            const thread = Object.create(Thread).constructor(worker);

            global.testResult = new Promise((resolve, reject) => {
                thread.on('test-event', data => resolve(data));

                worker.onmessage({ data: { type: 'THREAD_MESSAGE_EVENT', name: 'test-event', data: { a: 1, b: 2} } });

                setTimeout(() => reject(), 500);
            });
        });

        expect(testResult).to.have.property('then');
        expect(testResult).to.have.property('catch');

        return testResult
            .then(data => expect(data).to.be.deep.equal({ a: 1, b: 2 }))
            .catch(() => expect.fail('eventhandler timedout'));
    });

    it('should resolve an async remote call', () => {
        const { testResult } = vm.apply(() => {
            const worker = new Worker('./test-thread.js');
            const thread = Object.create(Thread).constructor(worker);

            worker.postMessage = function(event) {
                worker.onmessage({ data: { type: 'THREAD_MESSAGE_RETURN_VALUE', data: { transaction: event.transaction, return: true },  } });
            };

            global.testResult = thread.call('method', [1, 2, 3]);
        });

        expect(testResult).to.have.property('then');
        expect(testResult).to.have.property('catch');

        const timeout = setTimeout(() => expect.fail('async resolve timedout'), 500);

        return testResult.then(
            data => (clearTimeout(timeout), expect(data).to.be.true),
            () => (clearTimeout(timeout), expect.fail('remote call failed'))
        );
    });

    it('should reject an async remote call that threw', () => {
        const { testResult } = vm.apply(() => {
            const worker = new Worker('./test-thread.js');
            const thread = Object.create(Thread).constructor(worker);

            worker.postMessage = function(event) {
                worker.onmessage({ data: { type: 'THREAD_MESSAGE_RETURN_VALUE', data: { transaction: event.transaction, error: true },  } });
            };

            global.testResult = thread.call('method', [1, 2, 3]);
        });

        expect(testResult).to.have.property('then');
        expect(testResult).to.have.property('catch');

        const timeout = setTimeout(() => expect.fail('async resolve timedout'), 500);

        return testResult
            .then(() => {
                clearTimeout(timeout);

                return expect.fail('remote call should throw');
            }, (error) => {
                clearTimeout(timeout);

                return expect(error).to.be.true;
            });
    });

    it('should do nothing for unkown events', (done) => {
        const { testResult } = vm.apply(() => {
            const worker = new Worker('./test-thread.js');
            const thread = Object.create(Thread).constructor(worker);

            worker.postMessage = function(event) {
                worker.onmessage({ data: { type: 'THREAD_MESSAGE_UNKOWN', data: { transaction: event.transaction, return: true },  } });
            };

            global.testResult = thread.call('method', [1, 2, 3]);
        });

        expect(testResult).to.have.property('then');
        expect(testResult).to.have.property('catch');

        const timeout = setTimeout(() => {
            expect(true).to.be.true;
            done();
        }, 300);

        testResult.then(
            () => (clearTimeout(timeout), expect.fail('async call should not resolve')),
            () => (clearTimeout(timeout), expect.fail('event handler should not fail'))
        ).catch(done);
    });
};
