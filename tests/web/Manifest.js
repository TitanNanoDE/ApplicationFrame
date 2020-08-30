/* eslint-env mocha */

const mochaVM = require('../../node/mochaVM');
const { expect } = require('chai');


describe('Manifest', () => {

    const vm = mochaVM();

    vm.updateContext({
        window: vm.getContext(),
    });

    mochaVM.applyNodeEnv(vm);

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
