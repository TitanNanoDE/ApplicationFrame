// canvas.js v. 0.1 part of the Application Frame

$('new')({
    name :'canvas',
    constructor : function(){
        var self= this;
        
//      Functions
        var getZLevelMax= function(element){
            var max= 0;
            element._elements.forEach(function(item){
                if(item.zLevel > max)
                    max= item.zLevel;
            });
            return max;
        };
        
        var sortElements= function(element, zLevels){
            var newOrder= [];
            for(var i= 0; i <= zLevels; i++){
                element._elements.forEach(function(item){
                    if(item.zLevel == i)
                        newOrder.push(item);
                });
            }
            element._elements= newOrder;
        };
        
        var layerRender= function(context, canvas){
//          sortElements
            var zLevel_max= getZLevelMax(this);
            sortElements(this, zLevel_max);
            this._elements.forEach(function(item){
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
        
//      Classes
        this.Canvas= function(domNode){
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
            
//          catch events
//          mousemove / over, out, move
            this._dom.addEventListener('mousemove', function(e){
                var mouse= { x : e.layerX, y : e.layerY };
                var context= new Context();
                
                sortElements(c, getZLevelMax(c));
                for(var i= c._elements.length-1; i >= 0; i--){
                    var element= c._elements[i]._checkMouse(mouse, context);
                    if(element){
                        let style= element.cursor || c.cursor;
                        if(this.style.getPropertyValue('cursor') != style)
                            this.style.setProperty('cursor', style);
                    }
                }
                context.finally();
                
                if(context.available && this.style.getPropertyValue() != c.cursor)
                    this.style.setProperty('cursor', c.cursor);
            }, false);
//          suppress contextmenu
            this._dom.addEventListener('contextmenu', function(e){
                e.preventDefault();
                return false;
            }, false);
//          mouseclick
            this._dom.addEventListener('click', function(e){
                var context= new Context();
                var mouse= { x : e.layerX, y : e.layerY };
                
                sortElements(c, getZLevelMax(c));
                for(var i= c._elements.length-1; i >= 0; i--){
                    if(c._elements[i]._checkClick(mouse, context))
                        return;
                }
            }, false);
            
//          create FPS overlay
            this._fpsOverlay= new self.Layer(10, this._dom.height - 60, 0);
            this._fpsOverlay.addElement(new self.FilledRect(0, 0, 150, 60, '#000', 0));
            this._fpsOverlay.addElement(new self.TextBox('FPS: 0', 0, 0, 1));
            this._fpsOverlay.elements(1).color= '#fff';
            this._fpsOverlay.addElement(new self.TextBox('Frames: 0', 0, 15, 1));
            this._fpsOverlay.elements(2).color= '#fff';
            this._fpsOverlay.addElement(new self.TextBox('FPS Lock: off', 0, 30, 1));
            this._fpsOverlay.elements(3).color= '#fff';
        };
        this.Canvas.prototype= {
            _render : function(){
                if(this.isRunning){
                    var context= new Context();                    
                    this._context.clearRect(0, 0, this._dom.width, this._dom.height);
                    layerRender.apply(this, [context, this._context]);
                    
                    if(this.fpsOverlay){
                        this._fpsOverlay.elements(1).content= 'FPS: ' + Math.round(this.fps);
                        this._fpsOverlay.elements(2).content= 'Frames: ' + this.frames;
                        this._fpsOverlay.elements(3).content= 'FPS Lock: ' + ((this.fpsLock) ? 'on' : 'off');
                        this._fpsOverlay._render(context, this._context);
                    }
                    
                    var duration= (Date.now() - this._renderStart) / 1000;
                    this.fps=  1 / duration;
                    this.frames++;
                    var c= this;
                    
//                  fps lock
                    if(this.fpsLock){
                        var timeForFrame= 1 / this.maxFps;
                        if(duration < timeForFrame){
                            var timeOut= (timeForFrame - duration) * 1000;
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
        
        this.Layer= function(x, y, zLevel){
            this.zLevel= zLevel || 0;
            this._elements= [];
            this.x= x;
            this.y= y;
            this.hidden= false;
        };
        this.Layer.prototype= {
            _render : function(context, canvas){
                if(!this.hidden){
                    context.addOffset(this.x, this.y);
                    layerRender.apply(this, [context, canvas]);
                    context.removeOffset(this.x, this.y);
                }
            },
            addElement : self.Canvas.prototype.addElement,
            _checkMouse : function(mouse, context){
                var element= null;
                context.addOffset(this.x, this.y);
                sortElements(this, getZLevelMax(this));
                for(var i= this._elements.length-1; i >= 0; i--){
                    let item= this._elements[i]._checkMouse(mouse, context);
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
            elements : self.Canvas.prototype.elements
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
            this.cursor= null;
            this._mouse= false;
            this.onmouseover= function(){};
            this.onmouseout= function(){};
            this.onmousemove= function(){};
            this.onclick= function(){};
        };
        RectShapeElement.prototype= {
            _checkMouse : function(mouse, context){
                if(mouse.x >= (context.xOffset + this.x) &&
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
                if(mouse.x >= (context.xOffset + this.x) &&
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
        
        this.FilledRect= function(x, y, width, height, color, zLevel){
            RectShapeElement.apply(this, [x, y, width, height, zLevel]);
            this.color= color;
            this.cursor= null;
        };
        this.FilledRect.prototype= new $$.Prototype([RectShapeElement, {
            _render : function(context, canvas){
                if(!this.hidden){
                    canvas.fillStyle= this.color;
                    canvas.fillRect(context.xOffset + this.x, context.yOffset + this.y, this.width, this.height);
                }
            }
        }]);
        
        this.Image= function(source, x, y, zLevel){
            RectShapeElement.apply(this, [x, y, null, null, zLevel]);
            this.source= source;
        };
        this.Image.prototype= new $$.Prototype([RectShapeElement, {
            _render : function(context, canvas){
                if(!this.hidden)
                    canvas.drawImage(this.source, context.xOffset + this.x, context.yOffset + this.y);
            }
        }]);
        
        this.TextBox= function(content, x, y, zLevel){
            this.x= x;
            this.y= y;
            this.content= content;
            this.font= '12px/15px sans-serif';
            this.color= '#000';
            this.aling= 'start';
            this.zLevel= zLevel || 0;
            this.cursor= null;
            this.textBaseline= 'top';
        };
        this.TextBox.prototype= {
            _render : function(context, canvas){
                if(!this.hidden){
                    canvas.font= this.font;
                    canvas.textAling= this.aling;
                    canvas.fillStyle= this.color;
                    canvas.textBaseline= 'top';
                    canvas.fillText(this.content, context.xOffset + this.x, context.yOffset + this.y);
                }
            },
            _checkMouse : function(){
                return null;
            },
            _checkClick : function(){
                return null;
            }
        };
        
        this.HitArea= function(x, y, width, height, zLevel){
            RectShapeElement.apply(this, [x, y, width, height, zLevel]);
        };
        this.HitArea.prototype= new $$.Prototype([RectShapeElement, {
            _render : function(){}
        }]);
    }
});