/* eslint-env mocha */

const { expect } = require('chai');
const mochaVM = require('../../../node/mochaVM');

describe('NotificationManagerEventHandler', () => {
    describe('constructor', () => {
        const vm = mochaVM();

        mochaVM.applyNodeEnv(vm);

        vm.updateContext({
            self: vm.getContext(),
        });

        it('should setup all event handlers', () => {
            vm.runModule('../../../testable/ServiceWorker/lib/NotificationManagerEventHandler.js');

            const result = vm.runModule('../../testTasks/ServiceWorker/NotificationManagerEventHandler/construct.js');

            expect(result.handler).to.have.all.keys('constructor', 'onNotificationClicked', 'onNotificationClosed');
            expect(result.onnotificationclick).to.be.a('function');
            expect(result.handler.onNotificationClicked()).to.be.true;
            expect(result.onnotificationclose).to.be.a('function');
            expect(result.handler.onNotificationClosed()).to.be.true;
        });

        it('should pass-through click & close events', () => {
            const result = vm.runModule('../../testTasks/ServiceWorker/NotificationManagerEventHandler/events.js');

            expect(result.clicked).to.be.true;
            expect(result.closed).to.be.true;
        });
    });
});
