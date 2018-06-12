/* eslint-env mocha */

const istanbulVM = require('../../../node/istanbulVM');
const { expect } = require('chai');

describe('getRegistration', () => {

    const baseIt = 'should return a promise which resolves to an ServiceWorkerRegistration in';

    it(`${baseIt} navigator mode`, () => {
        const vm = istanbulVM();

        vm.updateContext({
            navigator: {
                serviceWorker: {
                    ready: Promise.resolve({ scope: 'string', pushManager: Object.prototype, active: null }),
                },
            },
        });

        istanbulVM.applyNodeEnv(vm);

        vm.runModule('../../../testable/ServiceWorker/lib/getRegistration.js');
        const result = vm.runModule('../../testTasks/ServiceWorker/getRegistration.js');

        expect(result.registration)
            .to.be.a('promise', 'doesn\'t return a promise')

        return result.registration.then(data => {
            expect(data).to.have.all.keys(['scope', 'pushManager', 'active']);
        });
    });

    it(`${baseIt} serviceworker mode`, () => {
        const vm = istanbulVM();

        istanbulVM.applyNodeEnv(vm);
        vm.updateContext({
            self: vm.getContext(),

            registration: { pushManager: null, scope: null, active: null },
        });

        vm.runModule('../../../testable/ServiceWorker/lib/getRegistration.js');
        const result = vm.runModule('../../testTasks/ServiceWorker/getRegistration.js');

        expect(result.registration).to.be.a('promise', 'doesn\'t return a promise');

        return result.registration.then(data => {
            expect(data).to.have.all.keys('scope', 'pushManager', 'active');
        })
    })
});
