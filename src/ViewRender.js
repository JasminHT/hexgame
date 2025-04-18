//-------1---------2---------3---------4---------5---------6---------7---------8



///////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//   BASIC RENDERING FUNCTIONS
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

//Dependencies:
import CanvasDraw from './u/CanvasDraw.js'
import View from './View.js'

//this is a style for render
export function RenderStyle() {
  this.line_color = 'black';
  this.line_width = 0;
  this.fill_color = 'transparent';
  this.text_color = 'black';
  this.text_size = '12';
}

//this is a basic Render, it doesn't know about hexes!

export default function Render(canvas_element_id, view) {

    var canvas = document.getElementById(canvas_element_id);
    this.canvas = canvas;

    this.canvas_draw  = new CanvasDraw(canvas);

    this.view = view;

    this.ready_to_render = true;
    this.render_timer = {};
}

//Coordinate transformation
Render.prototype.worldToScreen = function(point) {
  return this.view.worldToScreen(point);
}
Render.prototype.worldToScreen1D = function(scalar) {
  return this.view.worldToScreen1D(scalar);
}


//PURE functions, directly draw on the screen
Render.prototype.drawDot = function (point,size,style) {

    var coord = this.worldToScreen(point);
    let newsize = this.worldToScreen1D(size);
    var color = style.fill_color;

    this.canvas_draw.drawDot(coord, newsize, color);
};

Render.prototype.drawImage = function (image, point, size) {

  let coord = this.worldToScreen(point);
  let w = this.worldToScreen1D(size);
  let context = this.canvas_draw.canvas.getContext('2d');
  context.drawImage(image, coord.x-w/2, coord.y-w/2, w, w);

}


//Transform coordinates and draw a line using CanvasDraw
Render.prototype.drawLine=function(point1,point2,style) {

  var p1 = this.worldToScreen(point1);
  var p2 = this.worldToScreen(point2);
  var newwidth = this.worldToScreen1D(style.line_width);
  var color = style.line_color;
  if (style.line_caps)
    var linecaps = style.line_caps

  this.canvas_draw.drawLine(p1, p2, newwidth, color, linecaps);
};

//Transform coordinates and draw a polyon using CanvasDraw
Render.prototype.drawPolygon = function(points,style) {
  var coords = []; //creates an array 
  
  //otherwise actually draw a polygon
  for (let point of points) {
    let coord = this.worldToScreen(point);
    if (point.breakLine != undefined) 
      coord.breakLine = point.breakLine;
    coords.push(coord);
  }

  this.canvas_draw.drawPolygon(coords,style.line_width,
    style.fill_color,style.line_color);

};

//Transform coordinatess and draw text using CanvasDraw
Render.prototype.drawText = function(text,position,style,center) {
  var coord = this.worldToScreen(position);
  var newfontsize = this.worldToScreen1D(style.text_size);
  var color = style.text_color;


  this.canvas_draw.drawText(text,coord,color,newfontsize,center);
};

//Draw multiple lines using the drawLine function
Render.prototype.drawLines = function(points,style, width) {
  for (var i=0;i<points.length-1;i++) {
      this.drawLine(points[i], points[i+1], style);
  }
};

//uses the view to render a section of the source canvas to the canvas
//but this section is wrong
Render.prototype.blitCanvas = function(source_canvas) {

  let context = this.canvas.getContext('2d');

  let input_position = this.view.getInputRect().position;
  let input_size = this.view.getInputRect().size; //input is a section of the temp_canvas

  let x = input_position.x; 
  let y = input_position.y; 
  let w = input_size.x;
  let h = input_size.y;

  context.drawImage(source_canvas, x, y, w, h, 0, 0, this.canvas.width, this.canvas.height );
}


Render.prototype.clear = function() {

  this.canvas_draw.clear();
}










