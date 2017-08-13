/* eslint-env mocha */

const istanbulVM = require('../../testable/node/istanbulVM');
const { expect } = require('chai');


describe('Manifest', () => {

    const vm = istanbulVM();

    vm.updateContext({
        window: vm.getContext(),
    });

    istanbulVM.applyNodeEnv(vm);

    it('should return the default manifest', () => {
        vm.runModule('../shims/WebManifestShim.js');
        vm.runModule('../../testable/web/Manifest.js');
        const result = vm.runModule('../testTasks/web/ManifestDefault.js');

        return result.defaultManifest.then(defaultManifest => {
            expect(defaultManifest).to.deep.include({
                background_color: '#ffffff',
                description: '',
                dir: '',
                display: 'browser',
                icons: [],
                lang: '',
                orientation: 'any',
                prefer_related_applications: false,
                related_applications: [],
                scope: '/',
                short_name: '',
                name: '',
                start_url: './',
                theme_color: '',
            });
        });
    });
});
