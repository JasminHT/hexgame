

//CanvasDraw and CanvasInput should be useable for any game that touches the HTML5 canvas
//This should be replaceable with an actual library in the future
//This could also be replaced with a non-canvas library!
//The rest of the game should basically ignore what platform it is running on


/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
                                
            //                      CANVAS DRAW

/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

//The CanvasDraw object ONLY draws directly on the canvas.  It doesn't know about what game you're using
//All Renderer objects should use this class to draw on the screen
//This draws directly on the Canvas using the canvas coordinates given
//this should have no notions of hexagons or even tile-based game

function CanvasDraw (canvas) {
    this.canvas = canvas;

}

    //Returns the Width of the HTML canvas object
    CanvasDraw.prototype.getWidth = function() {
        return this.canvas.width;
    }

    //Returns the Height of the HTML Canvas object
    CanvasDraw.prototype.getHeight = function() {
        return this.canvas.height;
    }

    //Draw a dot on the canvas at position 'point' with optional size and color
    CanvasDraw.prototype.draw_dot = function (point,size,color) {


        //draws the dot using screen coordinates

        //defines the default size
        if (size === 'undefined') {
            size = 1;
        }
        
        //defines the default color
        if (color === 'undefined') {
            color = 'black';
        }

        //create canvas line object
        var line = this.canvas.getContext('2d');

        //draw the line
        line.beginPath();
        line.moveTo(point.x-1,point.y);
        line.lineTo(point.x+1,point.y);
        line.lineWidth = size;
        line.strokeStyle = color;
        line.stroke();
    };



    //Draw a line on the canvas from p1 to p2 with optional width and color
    CanvasDraw.prototype.draw_line = function(p1,p2,width,color) {

        //defines the default size
        if (typeof size === 'undefined') {
            size = 1;
        }
        
        //defines the default color
        if (typeof color === 'undefined') {
            color = 'black';
        }

        //create canvas line object
        var line = this.canvas.getContext('2d');
        line.lineCap="round";
        line.strokeStyle = color;

        //draw the line
        line.beginPath();
        line.moveTo(p1.x,p1.y);
        line.lineTo(p2.x,p2.y);
        line.lineWidth = width;
        line.stroke();
    };

    //draw a canvas polygon touching each points, with optional line width, line color and polygon fill color
    CanvasDraw.prototype.draw_polygon = function(points,width,fillColor,lineColor) {
        
        var line = this.canvas.getContext('2d');
        
        //default line color
        if (typeof lineColor === 'undefined') {
            lineColor = 'black';
        }

        //default line width
        if (typeof width === 'undefined') {
            //width = 0;
        }
        
        //line style
        line.lineWidth = width;
        line.lineCap="round";
        line.strokeStyle = lineColor;       

        //polygon outline
        line.beginPath();
        line.moveTo(points[0].x,points[0].y);
        for (i=1; i<points.length; i++) {
            line.lineTo(points[i].x,points[i].y);
            //this.draw_text(i,points[i],'black',24); //add the index of each corner
        }
        line.lineTo(points[0].x,points[0].y);
        line.closePath();
        
        //draw the line if thick enough
        if (width > 0) {
            line.stroke(); 
        }

        //optional fill color
        if (typeof fillColor != 'undefined') {

            line.fillStyle = fillColor;
            line.fill();
        }
        
    };

    //draw text on the canvas at the specified position, with optional color and fontsize
    CanvasDraw.prototype.draw_text = function(text,position,color,fontsize) {

        //default fontsize value
        if (typeof fontsize === "undefined") {
            fontsize = 14;
        }
        //default color value
        if (typeof color === "undefined") {
            color = black;
        }

        //get the canvas
        var context = this.canvas.getContext('2d');
        
        //select the font
        context.font = fontsize +"px Arial";
        
        //select the color
        context.fillStyle = color;

        //write the text
        context.fillText(text,position.x,position.y);
    };

    //draw a sprite on the canvas, at specified position
    CanvasDraw.prototype.draw_sprite = function() {

    }

    //clear the canvas of everything
    CanvasDraw.prototype.clear = function() {
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    }













/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
                                
            //                      CANVAS INPUT

/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////




//This is the event-detection part of the canvas interface
//Rather than defining the reaction to inputs, this section should only
//detect the inputs, then create a message that is sent to the entire system.
//Each part of the system can then decide how to react to it


function CanvasInput(canvas) {

    this.canvas = canvas;
    //create the mouse pointer (should be part of the mouse/screen controller)
    var mousePos = new Point(0,0);
    var mousePosPrevious = new Point(0,0);
    var currentHex = new Hex(0,0);
}


    //so far this does nothing, but it should send an event
    CanvasInput.prototype.moveMouse = function(event) {

        //find the hovered hexagon
        this.mousepos_previous = this.mousePos;
        this.mousePos = this.getMousePosition(event);

        //detect mouse hovering for animations
        world_interface.hover(this.mousePos); //this should be replaced by an event

        //check the mouse button
        if (this.mouseButtonDown(event,'left')) {
            
        }

        
    }


    //react to clicking canvas by drawing a dot
    CanvasInput.prototype.clickCanvas = function(event,world_interface) {
        
        var clickPos = this.getMousePosition(event);
        world_interface.click(clickPos);                //this is the part that should be replaced by an event


        //here a message should be sent to the rest of the engine

        refreshCanvas();
        console.log(clickPos);

    }

    CanvasInput.prototype.getMousePosition = function(event) {
        //get mouse position
        var e = window.event || event;
        var coords = this.canvas.relMouseCoords(e); //function defined
        return new Point(coords.x,coords.y);
    }

    CanvasInput.prototype.mouseWheel = function(event) {
        // cross-browser wheel delta
        var e = window.event || event; // old IE support
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

        //HERE a message should be sent to the rest of the engine

        return false;   
    }

    CanvasInput.prototype.mouseButtonDown = function(ev,button) {
        if (typeof ev.which != undefined) {
            if(ev.which==1 && button=='left') {
                return true;
            }
            if (ev.which==2 && button=='middle'){
                return true;
            } 
            if(ev.which==3 && button=='right')  {
                return true;
            } 
        }
        if (typeof ev.which != undefined) {
            if(ev.button==1 && button=='left') {
                return true;
            }
            if (ev.button==2 && button=='middle'){
                return true;
            } 
            if(ev.button==3 && button=='right')  {
                return true;
            } 
        }

        return false;
        
    }













/* 
 * Get Mouse Coordinates on the Canvas element 
 */
function relMouseCoords(event){
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = this;

    do{
        totalOffsetX += currentElement.offsetLeft /*- currentElement.scrollLeft*/;
        totalOffsetY += currentElement.offsetTop /*- currentElement.scrollTop*/;
    }
    while(currentElement = currentElement.offsetParent)

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return {x:canvasX, y:canvasY}
};
HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;





