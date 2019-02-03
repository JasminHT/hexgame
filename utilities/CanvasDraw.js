

//CanvasDraw should be useable for any game that touches the HTML5 canvas
//This should be replaceable with an actual library in the future
//This could also be replaced with a non-canvas library!
//The rest of the game should basically ignore what platform it is running on
//Use with CanvasInput

/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
                
      //            CANVAS DRAW

/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

//The CanvasDraw object ONLY draws directly on the canvas.  It doesn't know about what game you're using
//All Renderer objects should use this class to draw on the screen
//This draws directly on the Canvas using the canvas coordinates given
//this should have no notions of hexagons or even tile-based game

function CanvasDraw (canvas) {
  this.canvas = canvas;
  this.saved_polygon = {};

}

  //Returns the Width of the HTML canvas object
  CanvasDraw.prototype.getWidth = function() {
    return this.canvas.width;
  }

  //Returns the Height of the HTML Canvas object
  CanvasDraw.prototype.getHeight = function() {
    return this.canvas.height;
  }

  //draw a canvas polygon touching each points, with optional line width, line color and polygon fill color
  CanvasDraw.prototype.drawPolygon = function(points,width,fill_color,line_color) {
    
    var line = this.canvas.getContext('2d');
    let next = "";
    
    //default line color
    if (typeof line_color === 'undefined') {
      line_color = 'black';
    }

    //default line width
    if (typeof width === 'undefined') {
      width = 0;
    }
    
    //line style
    line.lineWidth = width;
    line.lineCap = "butt";
    line.strokeStyle = line_color;  

    line.alpha = false;   

    //polygon outline
    line.beginPath();
    line.moveTo(points[0].x,points[0].y);
    for (i=1; i<points.length; i++) {

      if (next == "move") {
        line.moveTo(points[i].x,points[i].y);
        next = "";
      } else {
        line.lineTo(points[i].x,points[i].y);
      }

      //for complex polygon this breaks the cycle into smaller cycles
      if (points[i].breakLine != undefined) { 
        console.log('break line');
        line.closePath();
        next = "move";
      } 
    }
    
    //close polygons of at least 3 sides
    if (points.length > 2) {
      //line.lineTo(points[0].x,points[0].y);
      line.closePath();
    }
    
    //remember the last polygon drawn
    this.saved_polygon = line;
    
    //draw the line if thick enough
    if (width > 0) {
      line.stroke(); 
    }

    //optional fill color
    if (typeof fill_color != 'undefined' && fill_color != 'transparent') {

      line.fillStyle = fill_color;
      line.fill('evenodd'); 
    }
    
  };

  //Draw a line on the canvas from p1 to p2 with optional width and color
  CanvasDraw.prototype.drawLine = function(p1,p2,width,color) {

    //express this function as a polygon
    var points = [p1,p2];
    this.drawPolygon(points,width,'transparent',color);

  };

  //Draw a dot on the canvas at position 'point' with optional size and color
  CanvasDraw.prototype.drawDot = function (point,size,color) {

    var line = this.canvas.getContext('2d');

    //default line width
    if (typeof color === 'undefined') {
      color = 'black';
    }

    //draw the dot as a rectangle
    var x = point.x-size/2;
    var y = point.y-size/2;
    var width = size;
    var height = size;

    line.fillStyle = color;
    line.fillRect(x,y,width,height);

  };

  //draw text on the canvas at the specified position, with optional color and fontsize
  CanvasDraw.prototype.drawText = function(text,position,color,fontsize) {

    //default fontsize value
    if (typeof fontsize === "undefined") {
      fontsize = 14;
    }
    //default color value
    if (typeof color === "undefined") {
      color = 'black';
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













