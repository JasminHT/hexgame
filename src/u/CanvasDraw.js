

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
//All Render objects should use this class to draw on the screen
//This draws directly on the Canvas using the canvas coordinates given
//this should have no notions of hexagons or even tile-based game

export default CanvasDraw;

function CanvasDraw (canvas) {
  this.canvas = canvas;
  this.saved_polygon = {};

  //this.real_canvas = canvas;

  //create a backup canvas which can be used to draw faster
  //this.m_canvas = document.createElement('canvas');
  //m_canvas.width = this.canvas.width;
  //m_canvas.height = this.canvas.height;
  
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
    line.moveTo(Math.floor(points[0].x), Math.floor(points[0].y) );
    for (let i=1; i<points.length; i++) {

      if (next == "move") {
        line.moveTo(Math.floor(points[i].x), Math.floor(points[i].y) );
        next = "";
      } else {
        line.lineTo(Math.floor(points[i].x), Math.floor(points[i].y) );
      }

      //for complex polygon this breaks the cycle into smaller cycles
      if (points[i].breakLine != undefined) { 
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

    //optional fill color
    if (typeof fill_color != 'undefined' && fill_color != 'transparent') {

      line.fillStyle = fill_color;
      line.fill('evenodd'); 
    }

    //draw the line if thick enough
    if (width > 0) {
      line.stroke(); 
    }
    
  };

  //Draw a line on the canvas from p1 to p2 with optional width and color
  CanvasDraw.prototype.drawLine = function(p1,p2,width,color,linecaps) {

    //express this function as a polygon
    var line = this.canvas.getContext('2d');
    
    //default line color
    if (typeof color === 'undefined') {
      let color = 'black';
    }

    //default line width
    if (typeof width === 'undefined') {
      let width = 0;
    }

    //default line caps
    if (typeof linecaps === 'undefined') {
      let linecaps = 'round';
    }
    
    //line style
    line.lineWidth = width;
    line.lineCap = linecaps;
    line.strokeStyle = color;  
    //line.lineCap = "round";
    line.alpha = false;   

    //polygon outline
    line.beginPath();
    line.moveTo(Math.floor(p1.x), Math.floor(p1.y) );
    line.lineTo(Math.floor(p2.x), Math.floor(p2.y) );

    //draw the line if thick enough
    if (width > 0) {
      line.stroke(); 
    }

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
    line.fillRect(Math.floor(x),Math.floor(y),Math.floor(width),Math.floor(height));

  };

  //draw text on the canvas at the specified position, with optional color and fontsize
  CanvasDraw.prototype.drawText = function(text,position,color,fontsize,center) {

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

    if (center) {
      context.textBaseline = 'middle';
      context.textAlign = "center";
    }

    //write the text
    context.fillText(text,position.x,position.y);
  };

  //draw a sprite on the canvas, at specified position
  CanvasDraw.prototype.draw_sprite = function() {

  }

  //clear the canvas of everything
  CanvasDraw.prototype.clear = function() {
    this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  CanvasDraw.prototype.blit = function() {
    this.canvas.getContext('2d').drawImage(this.m_canvas, 0, 0);
  }













