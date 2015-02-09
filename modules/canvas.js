// canvas.js v. 0.1 part of the Application Frame

"use strict";

import { classes } from 'modules/classes';

var $$= (typeof window !== 'undefined') ? window : global;
var { Prototype } = classes;

// Functions
var getZLevelMax= function(element){
    var max= 0;
    element._elements.forEach(item => {
        if(item.zLevel > max)
            max= item.zLevel;
    });
    return max;
};
        
var sortElements= function(element, zLevels){
    var newOrder= [];
    var loop= function(item){
        if(item.zLevel == i)
            newOrder.push(item);
    };
    for(var i= 0; i <= zLevels; i++){
        element._elements.forEach(loop);
    }
    element._elements= newOrder;
};
        
var layerRender= function(context, canvas){
//          sortElements
    var zLevel_max= getZLevelMax(this);
    sortElements(this, zLevel_max);
    this._elements.forEach(item => {
        item._render(context, canvas);
    });
};
        
var Context= function(){
    this.yOffset= 0;
    this.xOffset= 0;
    this.available= true;
    this.finally= function(){};
};
Context.prototype={
    addOffset : function(x, y){
        this.yOffset+= y;
        this.xOffset+= x;
    },
    removeOffset : function(x, y){
        this.yOffset-= y;
        this.xOffset-= x;
    }
};
        
var verifyOpacity= function(n){
    if(n > 1)
        return 1;
    else if(n < 0)
        return 0;
    else
        return n;
};
        
// Classes
var Canvas= function(domNode){
    this._dom= domNode;
    this.isRunning= false;
    this._elements= [];
    this._context= domNode.getContext('2d');
    this._renderStart= 0;
    this.cursor= 'default';
    this.fps= 0;
    this.maxFps= 60;
    this.frames= 0;
    this.fpsLock= true;
    this.fpsOverlay= false;
    var c= this;
            
//  catch events
//  mousemove / over, out, move
    this._dom.addEventListener('mousemove', function(e){
        var mouse= { x : e.layerX, y : e.layerY };
        var context= new Context();

        sortElements(c, getZLevelMax(c));
        for(var i= c._elements.length-1; i >= 0; i--){
            var element= c._elements[i]._checkMouse(mouse, context);
            if(element){
                var style= element.cursor || c.cursor;
                if(this.style.getPropertyValue('cursor') != style)
                    this.style.setProperty('cursor', style);
            }
        }
        context.finally();
                
        if(context.available && this.style.getPropertyValue() != c.cursor)
            this.style.setProperty('cursor', c.cursor);
    }, false);
//  suppress contextmenu
    this._dom.addEventListener('contextmenu', function(e){
        e.preventDefault();
        return false;
    }, false);
//  mouseclick
    this._dom.addEventListener('click', function(e){
        var context= new Context();
        var mouse= { x : e.layerX, y : e.layerY };
                
        sortElements(c, getZLevelMax(c));
        for(var i= c._elements.length-1; i >= 0; i--){
            if(c._elements[i]._checkClick(mouse, context))
                return;
        }
    }, false);
            
//  create FPS overlay
    this._fpsOverlay= new Layer(10, this._dom.height - 60, 0);
    this._fpsOverlay.addElement(new FilledRect(0, 0, 150, 60, '#000', 0));
    this._fpsOverlay.addElement(new TextBox('FPS: 0', 0, 0, 1));
    this._fpsOverlay.elements(1).color= '#fff';
    this._fpsOverlay.addElement(new TextBox('Frames: 0', 0, 15, 1));
    this._fpsOverlay.elements(2).color= '#fff';
    this._fpsOverlay.addElement(new TextBox('FPS Lock: off', 0, 30, 1));
    this._fpsOverlay.elements(3).color= '#fff';
};
Canvas.prototype= {
    _render : function(){
        if(this.isRunning){
            var context= new Context();
            var start= Date.now();
            this._context.clearRect(0, 0, this._dom.width, this._dom.height);
            this._context.globalAlpha= 1;
            layerRender.apply(this, [context, this._context]);

            if(this.fpsOverlay){
                this._fpsOverlay.elements(1).content= 'FPS: ' + Math.round(this.fps);
                this._fpsOverlay.elements(2).content= 'Frames: ' + this.frames;
                this._fpsOverlay.elements(3).content= 'FPS Lock: ' + ((this.fpsLock) ? 'on' : 'off');
                this._fpsOverlay._render(context, this._context);
            }
                    
            var duration= (Date.now() - this._renderStart) / 1000;
            var renderTime= (Date.now() - start) / 1000;
            this.fps=  1 / duration;
            this.frames++;
            var c= this;
                    
//          fps lock
            if(this.fpsLock){
                var timeForFrame= 1 / this.maxFps;
                if(renderTime < timeForFrame){
                    var timeOut= (timeForFrame - renderTime) * 1000;
                    this._renderStart= Date.now();
                    $$.setTimeout(function(){ $$.requestAnimationFrame(function(){ c._render(); }); }, timeOut);
                    return;
                }
            }
            this._renderStart= Date.now();
            $$.requestAnimationFrame(function(){ c._render(); });
        }
    },
    start : function(){
        this.isRunning= true;
        var c= this;
        $$.requestAnimationFrame(function(){ c._render(); });
    },
    stop : function(){
        this.isRunning= false;
    },
    addElement : function(element){
        this._elements.push(element);
    },
    get height(){
        return this._dom.height;
    },
    get width(){
        return this._dom.width;
    },
    measureText : function(textElement){
        this._context.font= textElement.font;
        this._context.textAling= textElement.aling;
        this._context.fillStyle= textElement.color;
        this._context.textBaseline= 'top';
        return this._context.measureText(textElement.content);
    },
    measureTextWidth : function(textElement){
        var c= this;
        this._context.font= textElement.font;
        this._context.textAling= textElement.aling;
        this._context.fillStyle= textElement.color;
        this._context.textBaseline= 'top';
        var lines= textElement.content.split('\n');
        var linesWidth= [];
        lines.forEach(item => linesWidth.push(c._context.measureText(item).width));
        return Math.max.apply(Math, linesWidth);
    },
    measureTextHeight : function(text, lineHeight){
        if(text !== '')
            return text.split('\n').length * lineHeight;
        else
            return 0;
    },
    elements : function(index){
        return this._elements[index];
    }
};
        
var Layer= function(x, y, zLevel){
    this.zLevel= zLevel || 0;
    this._elements= [];
    this.x= x;
    this.y= y;
    this.opacity= 1;
    this.hidden= false;
};
Layer.prototype= {
    _render : function(context, canvas){
        if(!this.hidden){
            context.addOffset(this.x, this.y);
            canvas.globalAlpha= verifyOpacity(canvas.globalAlpha - (1-this.opacity));
            layerRender.apply(this, [context, canvas]);
            context.removeOffset(this.x, this.y);
            canvas.globalAlpha= verifyOpacity(canvas.globalAlpha + (1-this.opacity));
        }
    },
    addElement : Canvas.prototype.addElement,
    _checkMouse : function(mouse, context){
        var element= null;
        context.addOffset(this.x, this.y);
        sortElements(this, getZLevelMax(this));
        for(var i= this._elements.length-1; i >= 0; i--){
            var item= this._elements[i]._checkMouse(mouse, context);
            if(item)
                element= item;
        }
        context.removeOffset(this.x, this.y);
        return element;
    },
    _checkClick : function(mouse, context){
        context.addOffset(this.x, this.y);
        sortElements(this, getZLevelMax(this));
        for(var i= this._elements.length-1; i >= 0; i--){
            if(this._elements[i]._checkClick(mouse, context))
                return true;
        }
        context.removeOffset(this.x, this.y);
    },
    clear : function(){
        this._elements= [];
    },
    elements : Canvas.prototype.elements
};
        
var RectShapeElement= function(x, y, width, height, zLevel){
    this.x= x;
    this.y= y;
    this.zLevel= zLevel || 0;
    this.hidden= false;
    if(width)
        this.width= width;
    if(height)
        this.height= height;
    this.opacity= 1;
    this.cursor= null;
    this._mouse= false;
    this.onmouseover= function(){};
    this.onmouseout= function(){};
    this.onmousemove= function(){};
    this.onclick= function(){};
};
RectShapeElement.prototype= {
    _checkMouse : function(mouse, context){
        if(!this.hidden &&
           mouse.x >= (context.xOffset + this.x) &&
           mouse.x <= (context.xOffset + this.x +this.width) &&
           mouse.y >= (context.yOffset + this.y) &&
           mouse.y <= (context.yOffset + this.y + this.height) &&
           context.available){
            var e= this;
            if(!this._mouse){
                this._mouse= true;
                context.finally= function(){
                    e.onmouseover(mouse);
                    e.onmousemove(mouse);
                };
            }else{
                context.finally= function(){
                    e.onmousemove(mouse);
                };
            }
            context.available= false;
            return this;
        }else{
            if(this._mouse){
                this._mouse= false;
                this.onmouseout(mouse);
            }
            return null;
        }
    },
    _checkClick : function(mouse, context){
        if(!this.hidden &&
           mouse.x >= (context.xOffset + this.x) &&
           mouse.x <= (context.xOffset + this.x +this.width) &&
           mouse.y >= (context.yOffset + this.y) &&
           mouse.y <= (context.yOffset + this.y + this.height)){
            this.onclick();
            return true;
        }else{
            return false;
        }
    }
};
        
var FilledRect= function(x, y, width, height, color, zLevel){
    RectShapeElement.apply(this, [x, y, width, height, zLevel]);
    this.color= color;
    this.cursor= null;
};
FilledRect.prototype= new Prototype([RectShapeElement, {
    _render : function(context, canvas){
        if(!this.hidden){
            canvas.fillStyle= this.color;
            canvas.globalAlpha= verifyOpacity(canvas.globalAlpha - (1-this.opacity));
            canvas.fillRect(context.xOffset + this.x, context.yOffset + this.y, this.width, this.height);
            canvas.globalAlpha= verifyOpacity(canvas.globalAlpha + (1-this.opacity));
        }
    }
}]);

var CImage= function(source, x, y, zLevel){
    RectShapeElement.apply(this, [x, y, null, null, zLevel]);
    this.source= source;
    this._width= null;
    this._height= null;
    this.crop= null;
};
CImage.prototype= new Prototype([RectShapeElement, {
    _render : function(context, canvas){
        if(!this.hidden){
            canvas.globalAlpha= verifyOpacity(canvas.globalAlpha - (1-this.opacity));
            if(this.crop){
                var sourceX= this.crop.left;
                var sourceY= this.crop.top;
                var sourceWidth= this.source.naturalWidth - this.crop.left - this.crop.right;
                var sourceHeight= this.source.naturalHeight - this.crop.top - this.crop.bottom;
                var targetX= context.xOffset + this.x;
                var targetY= context.yOffset + this.y;
                canvas.drawImage(this.source, sourceX, sourceY, sourceWidth, sourceHeight, targetX, targetY, this.width, this.height);
            }else{
                canvas.drawImage(this.source, context.xOffset + this.x, context.yOffset + this.y, this.width, this.height);
            }
            canvas.globalAlpha= verifyOpacity(canvas.globalAlpha + (1-this.opacity));
        }
    },
    get width(){
        return (this._width || this.source.naturalWidth || 0);
    },
    set width(width){
        this._width= width;
    },
    get height(){
        return (this._height || this.source.naturalHeight || 0);
    },
    set height(height){
        this._height= height;
    }
}]);
        
var TextBox= function(content, x, y, zLevel){
    this.x= x;
    this.y= y;
    this.content= content;
    this.fontFamily= 'sans-serif';
    this.fontSize= 12;
    this._lineHeight= null;
    this.fontStyle= '';
    this.fontWeight= 'normal';
    this.color= '#000';
    this.aling= 'left';
    this.opacity= 1;
    this.zLevel= zLevel || 0;
    this.cursor= null;
    this.textBaseline= 'top';
};
TextBox.prototype= {
    _render : function(context, canvas){
        if(!this.hidden){
            canvas.globalAlpha= verifyOpacity(canvas.globalAlpha - (1-this.opacity));
            canvas.font= this.font;
            canvas.textAling= this.aling;
            canvas.fillStyle= this.color;
            canvas.textBaseline= 'top';

            if(this.aling == 'center'){
                var t= this;
                var lines= this.content.split('\n');
                var linesWidth= [];
                lines.forEach(item => linesWidth.push(canvas.measureText(item).width));
                var largest= Math.max.apply(Math, linesWidth);
                lines.forEach((item, i) => {
                    var dist= (largest - linesWidth[i]) / 2;
                    canvas.fillText(item, context.xOffset + dist + t.x, context.yOffset + (t.lineHeight * i) + t.y);
                });
            }else{
                canvas.fillText(this.content, context.xOffset + this.x, context.yOffset + this.y);
            }
            canvas.globalAlpha= verifyOpacity(canvas.globalAlpha + (1-this.opacity));
        }
    },
    _checkMouse : function(){
        return null;
    },
    _checkClick : function(){
        return null;
    },
    get font(){
        return this.fontStyle+' '+this.fontWeight+' '+this.fontSize+'px/'+this.lineHeight+'px '+this.fontFamily;
    },
    get lineHeight(){
        return (this._lineHeight) ? this._lineHeight : (this.fontSize + 6);
    },
    set lineHeight(value){
        this._lineHeight= value;
    }
};
        
var HitArea= function(x, y, width, height, zLevel){
    RectShapeElement.apply(this, [x, y, width, height, zLevel]);
};
HitArea.prototype= new Prototype([RectShapeElement, {
    _render : function(){}
}]);
        
var ImageCrop= function(top, right, bottom, left){
    this.top= top || 0;
    this.right= right || 0;
    this.bottom= bottom || 0;
    this.left= left || 0;
};
        
// animations
var fadeOut= function(element, time, callback){
    var timeOut= 20; // milliseconds
    time*= 1000;     //convert to milliseconds
    var updates= Math.round(time / timeOut);
    var ammount= 1 / updates;
    var update= function(){
        updates--;
        element.opacity-= ammount;

        if(updates > 0)
            $$.setTimeout(update, timeOut);
        else if(callback){
            element.opacity= 0;
            callback();
        }
    };
    element.opacity= 1;
    update();
};

var fadeIn= function(element, time, callback){
    var timeOut= 20; // milliseconds
    time*= 1000;     //convert to milliseconds
    var updates= Math.round(time / timeOut);
    var ammount= 1 / updates;
    var update= function(){
        updates--;
        element.opacity+= ammount;

        if(updates > 0)
            $$.setTimeout(update, timeOut);
        else if(callback){
            element.opacity= 1;
            callback();
        }
    };
    element.opacity= 0;
    update();
};
        
var zoomIn= function(element, target, amount, time, callback){
    if(!element instanceof CImage){
        $$.console.error('element is not a instance of CImage');
        return false;
    }
    var topAmount= Math.round((target[1] / 100) * amount);
    var leftAmount= Math.round((target[0] / 100) * amount);
    var bottomAmount= Math.round(((element.height - target[1]) / 100) * amount);
    var rightAmount= Math.round(((element.width - target[0]) / 100) * amount);
    time*= 1000; // to milliseconds
    var timeOut= 20;
    var updates= Math.round(time / timeOut);
    var lot= 1 / updates;
    var update= function(){
        updates--;
        element.crop.top+= topAmount * lot;
        element.crop.right+= rightAmount * lot;
        element.crop.bottom+= bottomAmount * lot;
        element.crop.left+= leftAmount * lot;

        if(updates > 0){
            $$.setTimeout(update, timeOut);
        }else if(callback){
            callback();
        }
    };
    if(!element.crop)
        element.crop= new ImageCrop();
    update();
};
        
var zoomOut= function(element, target, amount, time, callback){
    if(!element instanceof CImage){
        $$.console.error('element is not a instance of CImage');
        return false;
    }
    var topAmount= Math.round((target[1] / 100) * amount);
    var leftAmount= Math.round((target[0] / 100) * amount);
    var bottomAmount= Math.round(((element.height - target[1]) / 100) * amount);
    var rightAmount= Math.round(((element.width - target[0]) / 100) * amount);
    time*= 1000; // to milliseconds
    var timeOut= 20;
    var updates= Math.round(time / timeOut);
    var lot= 1 / updates;
    var update= function(){
        updates--;
        element.crop.top-= topAmount * lot;
        element.crop.right-= rightAmount * lot;
        element.crop.bottom-= bottomAmount * lot;
        element.crop.left-= leftAmount * lot;

        if(updates > 0){
            $$.setTimeout(update, timeOut);
        }else if(callback){
            element.crop= null;
            callback();
        }
    };
    if(!element.crop)
        element.crop= new ImageCrop(topAmount, rightAmount, bottomAmount, leftAmount);
    update();
};

export var canvas = {
    Canvas : Canvas,
    Layer : Layer,
    FilledRect : FilledRect,
    CImage : CImage,
    TextBox : TextBox,
    HitArea : HitArea,
    ImageCrop : ImageCrop,
    fadeIn : fadeIn,
    fadeOut : fadeOut,
    zoomIn : zoomIn,
    zoomOut : zoomOut
};

export var config = {
    author : 'Jovan Gerodetti',
    main : 'canvas',
    version : '1.1'
};
