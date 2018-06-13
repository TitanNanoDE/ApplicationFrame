/* global RenderEngine, frameBuffer */

global.frameBuffer = frameBuffer;

RenderEngine.scheduleRenderTask(() => {
    global.taskExecutedNamed = true;
}, 'testTaskName');
