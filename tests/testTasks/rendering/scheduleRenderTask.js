/* global RenderEngine, frameBuffer */

global.frameBuffer = frameBuffer;

RenderEngine.scheduleRenderTask(() => {
    global.taskExecuted = true;
});

if (RenderEngine.lightray === false) {
    global.noLightray = true;
}

RenderEngine.lightray = true;

global.lightrayIsSet = RenderEngine.lightray;

RenderEngine.addPreRenderHook(() => {
    global.preRenderHookCalled = true;
});

RenderEngine.addPostRenderHook(() => {
    global.postRenderHookCalled = true;
});
