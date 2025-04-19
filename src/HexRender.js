/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
//                HEX RENDERER
/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////



// Sole responsibility: drawing hexagons on a regular grid using the Render 


import CanvasDraw from './u/CanvasDraw.js'
import Hex from './u/Hex.js'
import {Point} from './u/Hex.js'
import {RenderStyle} from './ViewRender.js'

export default function HexRender(render, hexlayout) {
  this.render = render; 
  this.hexlayout = hexlayout;

}

HexRender.p = HexRender.prototype;

// HEX AND POINT CONVERSION
HexRender.p.hexToPoint = function(hex) {
  return this.hexlayout.hexToPoint(hex);
}
HexRender.p.hexesToPoints = function(hexes) {
  var points = [];
  for (let hex of hexes) {                            
      points.push(this.hexToPoint(hex));
  }
  return points;
}
HexRender.p.pointToHex = function(point) {
  return this.hexlayout.pointToHex(point);
}

const lerp = (a, b, amount) => (1 - amount) * a + amount * b;

// RENDERING FUNCTIONS
HexRender.p.drawCenterLine = function(hex1, hex2, width, line_color, option) {
  var style = new RenderStyle();
  style.line_width = width;
  style.line_color = line_color; 
  style.line_caps = 'round';
  
  var p1 = this.hexToPoint(hex1);
  var p2 = this.hexToPoint(hex2);
  var phalf = new Point( (p2.x+p1.x)/2 , (p2.y+p1.y)/2 );
  var pover = new Point( lerp(p1.x,p2.x,0.51), lerp(p1.y,p2.y,0.51) );

  if (option=='half only') {
    this.render.drawLine(p1, p1, style);
    style.line_caps = 'butt';
    this.render.drawLine(p1, pover, style);
    return;
  }

  if (option=='moving dots') {
    p1 = this.fractionalRandomPoint1(p1,phalf);
    p2 = p1;
    this.render.drawLine(p1,phalf, style);
    return;
  }

  if (option=='moving dots backwards') {
    p1 = this.fractionalRandomPoint1(phalf,p1);
    p2 = p1;
    this.render.drawLine(p1,phalf, style);
    return;
  }


  style.line_caps = 'round';
  this.render.drawLine(p1,p2, style);

}

HexRender.p.drawImage = function(hex) {

  let world_point = this.hexToPoint(hex);

  
  //this.render.drawImage(this.wheat, world_point, 60);



}

HexRender.p.fractionalRandomPoint1 = function(p1, p2, first_half) {
  let f = (new Date().getTime()%3000)/3000;
  return new Point( ((1-f)*p2.x+f*p1.x) , ((1-f)*p2.y+f*p1.y) );

}

HexRender.p.fractionalRandomPoint2 = function(p1, p2) {
  
}

HexRender.p.drawLongLine = function(hex_array, width) {
  var style = new RenderStyle();
  style.line_width = width;
  style.line_color = 'white';
  style.fill_color = "";
  let self = this;
  let points = [];
  for (let i=0;i<hex_array.length;i++){
    points.push(this.hexToPoint(hex_array[i]));
  }
  this.render.drawLines(points, style, width);
}
HexRender.p.drawHex = function(hex, style) {
  

  //draw hex the normal way

  //get the corners, then draww a polygon
  var corners = this.hexesToPoints(Hex.corners(hex));
  this.render.drawPolygon(corners,style);

  return;

  //draw a rectangle instead
  var left = this.hexToPoint(hex); left.x -= 31;
  var right = this.hexToPoint(hex); right.x += 30;

  style.line_caps = 'butt'
  style.line_width = 53;
  style.line_color = style.fill_color;
  this.render.drawLine(left, right, style);

};

//Draw a series of short lines
HexRender.p.drawHexOutline = function(edge_arrays,style) {
    
  var number_of_loops = edge_arrays.length;
  var corners = [];

  for (let outline = 0; outline<number_of_loops; outline++){

    var edges = edge_arrays[outline];

    for (var i=0;i<edges.length;i++){
      let corner = this.hexToPoint(edges[i].getPoint1(0.9) );
      corners.push( corner );
    }
    let corner = this.hexToPoint(edges[0].getPoint1(0.9) );
    corner.breakLine = true; //used in complex polygons to know when to break the drawing loops
    corners.push( corner ); //add the first point again to close the loop
  }
  this.render.drawPolygon(corners,style);
};

HexRender.p.drawRange = function(range) {

  let hex_array = [];
  for (let hex of range.values().map(
    function(cell){return cell.coord;}
    )) {
    hex_array.push(hex);
  }

  this.drawHexes(hex_array);
}

//Render an array of hexes on the screen
HexRender.p.drawHexes = function(hex_array, range_style) {
  
  var outline = Hex.outline(hex_array);

  if (range_style === undefined) {
    var range_style = new RenderStyle();
    range_style.fill_color = "rgba(255,255,150, 0.2)";
    range_style.line_color = "rgba(255,255,100,1)";
  }

  range_style.line_width = 4;

  //draw the outline of the range
  this.drawHexOutline( outline,range_style);
}

HexRender.p.drawDot = function(hex, size, color='grey') {

  var position = this.hexToPoint(hex);

  var style = new RenderStyle();
  style.fill_color = color;

  this.render.drawDot(position, size, style);
}

HexRender.p.drawText = function(text, hex, size, color='grey') {
  
  var position = this.hexToPoint(hex);

  let text_style = new RenderStyle();
  text_style.text_size = size;
  text_style.text_color = color;

  this.render.drawText(text, position, text_style, true);
}


HexRender.prototype.clear = function() {
  this.render.clear();
}








