/* eslint-env mocha */

const istanbulVM = require('../testable/node/istanbulVM');
const { expect } = require('chai');

const vm = istanbulVM({
    taskExecuted: false,
    taskExecutedNamed: false,
    animationFrameRequests: [],

    module: {
        exports: {},
    },

    requestAnimationFrame(cb) {
        this.animationFrameRequests.push(cb);
    }
});

istanbulVM.applyNodeEnv(vm);

vm.updateContext({
    window: vm.getContext().global,
});

describe('RenderEngine', () => {

    it('should load the module', () => {
        vm.runModule('../testable/rendering');
    });

    describe('scheduleRenderTask', () => {
        it('adds a new task to the current frame', () => {
            const result = vm.runModule('./testTasks/rendering/scheduleRenderTask');

            expect(result.frameBuffer[1]).to.exist;
            expect(result.frameBuffer[1].renderTasks).to.have.lengthOf(1);
        });

        it('adds a named task to the current frame', () => {
            const testId = 'testTaskName';
            const result = vm.runModule('./testTasks/rendering/scheduleRenderTask_named');

            expect(result.frameBuffer[1]).to.exist;
            expect(result.frameBuffer[1].renderTasks.registeredIds).to.include(testId);
            expect(result.frameBuffer[1].renderTasks.last.id).to.be.equal(testId);
        });
    });

    describe('rendering', () => {
        it('should run scheduled tasks', () => {
            const result = vm.runModule('./testTasks/rendering/runAnimationFrame');

            expect(result.taskExecuted).to.be.true;
            expect(result.taskExecutedNamed).to.be.true;
        });
    });
});
