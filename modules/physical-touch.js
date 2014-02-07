$('escape').wrapper(function(){
    
    this.self= this, 'use strict';
    
    var isDown= false;
    
// get all dom elements
    var allElements= self.document.body.querySelectorAll('*');
    
//  events
    self.events= {
        SCROLL : 'phT_scroll',
        TAPP : 'phT_tapp',
        STROCKE : 'phT_strocke',
        MOVE : 'phT_move',
        TOUCH : 'phT_touch',
        RELEASE : 'phT_release',
        TOUCHSTART : (self.navigator.isTouch ? 'touchstart' : 'mousedown'),
        TOUCHMOVE : (self.navigator.isTouch ? 'touchmove' : 'mousemove'),
        TOUCHEND : (self.navigator.isTouch ? 'touchend' : 'mouseup')
    };
    
//  physical touch meta data
    var touchMeta= [];
    var overScrollMeta= [];
    
//  global init hook
    var initHook= function(e, index){
        touchMeta[index]= {
            lastTime : (new Date().getTime()),
            lastPos : { x: e.screenX, y: e.screenY },
            lastPosDelta : {x: 0, y: 0},
            lastTarget : this
            };
        };
    
//  global movment hook
    var movmentHook= function(e, index){
        var now= new Date().getTime();
        var timeD= (now - touchMeta[index].lastTime) / 1000;
        
        if(timeD === 0){
            timeD= touchMeta[index].lastTimeDelta;
        }else{
            touchMeta[index].lastTimeDelta= timeD;
        }
        e.pos= { x: e.screenX, y: e.screenY };
        
        if(touchMeta[index].lastPos.y != e.pos.y && touchMeta[index].lastPos.x != e.pos.x){
            e.posDelta= touchMeta[index].lastPosDelta= {x: (e.pos.x - touchMeta[index].lastPos.x),
                                                        y: (e.pos.y - touchMeta[index].lastPos.y)};
        }else{
            e.posDelta= touchMeta[index].lastPosDelta;
            }
        
        e.speed= {x: (e.posDelta.x / timeD),
                  y: (e.posDelta.y / timeD)};
        
        self.console.log('target: '+this.className+'\nbefore Y: '+touchMeta[index].lastPos.y+'\nnow Y: '+e.pos.y+'\ndelta y: '+e.posDelta.y+'\ntime delta: '+timeD+'\nspeed y: '+e.speed.y);
        
        touchMeta[index].lastPos= e.pos;
        touchMeta[index].lastTime= now;
        
        if(touchMeta[index].lastTarget != this) touchMeta[index].lastTarget= this;

//      grabbed scroll
        if( /*(touchMeta[index].lastTarget == this) &&*/ (self.getComputedStyle(this).getPropertyValue('overflow') == 'hidden') && (!this.hasAttribute('physicalTouch') || this.getAttribute('physicalTouch') != 'false') && (e.posDelta.y !== 0) ){
            physicalScroll(this, e.posDelta.y, true);
            }
        };
    
//  global release hook
    var releaseHook= function(e, index){
        var now= new Date().getTime();
        var timeD= (now - touchMeta[index].lastTime) / 1000;
        e.pos= { x: e.screenX, y: e.screenY };
        e.posDelta= {x: Math.abs(e.pos.x - touchMeta[index].lastPos.x),
                     y: Math.abs(e.pos.y - touchMeta[index].lastPos.y)};
        
        if(!(e.posDelta.x < 1 && e.posDelta.y < 1 && timeD < 0.1)){
            e.speed= {x: (e.posDelta.x / timeD),
                      y: (e.posDelta.y / timeD)};
            }
        
//      released remaining velocity scroll
        if( /*(touchMeta[index].lastTarget == e.target) &&*/ (self.getComputedStyle(this).getPropertyValue('overflow') == 'hidden') && (!this.hasAttribute('physicalTouch') || this.getAttribute('physicalTouch') != 'false')){
            physicalScroll(this, e.speed.y, false);
            }
        };
    
//  physical scroll
    allElements.forEach(function(item){
        item.addEventListener(self.events.TOUCHSTART, function(e){
            if(self.navigator.isTouch){
                var emitter= this;
                e.touches.forEach(function(item, i){
                    initHook.apply(emitter, [item, i]);
                    });
            }else{
                isDown= true;
                initHook.apply(this, [e, 0]);
                }
            });
        
        item.addEventListener(self.events.TOUCHMOVE, function(e){
            if(self.navigator.isTouch){
                var emitter= this;
                e.touches.forEach(function(item, i){
                    movmentHook.apply(emitter, [item, i]);
                    });
            }else if(isDown){
                movmentHook.apply(this, [e, 0]);
                }
            });
            
        item.addEventListener(self.events.TOUCHEND, function(e){
            if(self.navigator.isTouch){
                var emitter= this;
                e.touches.forEach(function(item, i){
                    releaseHook.apply(emitter, [item, i]);
                    });
            }else{
                isDown= false;
                releaseHook.apply(this, [e, 0]);
                }
            }); 
        });
    
/* ---      physical functions      --- */
    var physicalScroll= function(target, change, isGrabbed){
        change*= -1;
        if(isGrabbed){
            target.scrollTop+= change;
        }else{
            
            }
        };
});