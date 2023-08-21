/////////1---------0---------0---------0---------0---------0
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
                
      //            HEX AND FUNCTIONS

///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////

//This library defines the Hex grid and a map for 
//containing multiple hexes, it also defines multiple 
//functions for dealing with Hexes, structuring them,
//and relating them to a cartesian grid

// HEX OBJECT

export function hex(q,r) {
  return new Hex(q,r);

}

export default function Hex(q,r) { //stores a hex unit
  this.q = q;
  this.r = r;
}

Hex.prototype = {
  constructor: Hex,
};

Hex.prototype.getQ = function() {
  return this.q;
}

Hex.prototype.getR = function() {
  return this.r;
}

Hex.prototype.getS = function() {
  return -(this.q)-(this.r);
}

Hex.prototype.toDist = function() {
  let layout = new HexLayout ('orientation_pointy', new Point(1,1), new Point(0,0));
  let point = layout.hexToPoint(this);
  return Math.sqrt(point.x*point.x+point.y*point.y)/1.4;
}

// BASIC HEX FUNCTIONS

//Hexmap hexHash: turns the coordinates of a hex into 
//a unique number, starting from (0,0) => 0
//uses Szudzik's function turns 2 numbers into a 
//unique number, increasing away from the origin

export function listContainsHex(hex, list) {
    for (let otherhex of list) 
        if (hex.equals(otherhex)) 
            return true;

    return false;
}

Hex.prototype.toString = function() {
  return "Hex ("+this.getQ()+","+this.getR()+")";
}

Hex.prototype.getKey = function() {
  var q = this.getQ();
  var r = this.getR();

  var A = (q >= 0 ? 2 * q : -2 * q - 1);
  var B = (r >= 0 ? 2 * r : -2 * r - 1);
  var C = ((A >= B ? A * A + A + B : A + B * B) / 2);
  return Math.floor(2*C);
}

Hex.prototype.equals = function(hex_b) {
    return this.getQ()==hex_b.getQ() 
        && this.getR()==hex_b.getR();
}

Hex.prototype.add = function(hex_b) {
  return new Hex( this.getQ()+hex_b.getQ(), 
                  this.getR()+hex_b.getR() );
}
Hex.prototype.plus = Hex.prototype.add;

Hex.prototype.minus = function(hex_b)  {
  return new Hex( this.getQ()-hex_b.getQ(), 
                  this.getR()-hex_b.getR() );
}

//Multiply the hex with a scalar
Hex.prototype.multiply = function(k)  {
  return new Hex( this.getQ()*k, this.getR()*k );
}

//returns distance from origin
Hex.prototype.distanceToCenter = function() { 
  return (Math.abs(this.getQ()) + 
          Math.abs(this.getR()) + 
          Math.abs(this.getS())) / 2;
}

//Returns the distance in hexes along a line
Hex.distance = function(hex_a,hex_b) {
  return hex_a.minus(hex_b).distanceToCenter();
}

//gives the 6 hex neighbor direction in layout-independent hex coordinates
var hex_direction = [new Hex(1,0),new Hex(1,-1),new Hex(0,-1),
      new Hex(-1,0),new Hex(-1,1),new Hex(0,1)] ;

Hex.spiralDirection = function(q,r) {

  var sum = q+r;

  if ( sum<0 && q>=0 ) return 0;
  if ( q<0 && r<=0 ) return 1;
  if ( sum<=0 && r>0 ) return 2;
  if ( q<=0 && sum>0 ) return 3;
  if ( r>=0 && q>0 ) return 4;
  if (sum>=0 && r<0 ) return 5;
  return -1;
  
}

//gives the 6 corner directions in layout-independent hex coordinates
var hex_corner = [  new Hex( 1.0/3.0,  1.0/3.0),
		    new Hex( 2.0/3.0, -1.0/3.0),
		    new Hex( 1.0/3.0, -2.0/3.0),
		    new Hex(-1.0/3.0, -1.0/3.0),
		    new Hex(-2.0/3.0,  1.0/3.0),
		    new Hex(-1.0/3.0,  2.0/3.0)] ;



Hex.corners = function (hex) {
  var corners = [];
  //individually add each corner to the hex position
  for (var i=0;i<6;i++) {
    corners[i] = hex.add(hex_corner[i]);
  }
  return corners;
}              

//takes a direction (from 0 to 6), and returns a neighboring hex
Hex.prototype.getNeighbor = function(direction_number) {
  
  return this.add(hex_direction[direction_number%6] );
}

//returns all 6 neighbors
Hex.prototype.getNeighbors = function() {
  var neighbors = [];
  var i;
  for (i=0; i<6; i++) {
    neighbors.push( this.getNeighbor(i) );
  }
  return neighbors;
}

Hex.areNeighbors = function(hex1, hex2) {
  return listContainsHex(hex2, hex1.getNeighbors());
}

// FRACTIONAL FUNCTIONS

Hex.round = function(fractional_hex) {
  let q = Math.round(fractional_hex.getQ());
  let r = Math.round(fractional_hex.getR());
  let s = Math.round(fractional_hex.getS());

  let qdiff = Math.abs(q-fractional_hex.getQ());
  let rdiff = Math.abs(r-fractional_hex.getR());
  let sdiff = Math.abs(s-fractional_hex.getS());

    if (qdiff > rdiff && qdiff > sdiff) {
        q = -r - s;
    } else if (rdiff > sdiff) {
        r = -q - s;
    }/* else {
        s = -q - r;
    }*/

    return new Hex(q,r);

}

Hex.linearInterpolate = function(hex_a,hex_b,t) {
  return new Hex( 
          hex_a.getQ() + (hex_b.getQ() - hex_a.getQ()) * t,
          hex_a.getR() + (hex_b.getR() - hex_a.getR()) * t,
          hex_a.getS() + (hex_b.getS() - hex_a.getS()) * t
          );

}

// HEX SELECT FUNCTIONS

Hex.line = function(hex_a,hex_b) {
  var distance = Hex.distance(hex_a,hex_b);
  var hex_array = [];
  var step = 1.0 / Math.max(distance,1);
  for (var i=0;i<=distance;i++) {
    hex_array.push(Hex.round(Hex.linearInterpolate(hex_a,hex_b,step*i)));

  }
  return hex_array;
}

Hex.circle = function(center, N) {
  var hex_array = [center];

  for (let r=1; r<N; r++) {
    for (let hex of Hex.ring(center,r))
      hex_array.push(hex);
  }
  return hex_array;
}

Hex.ring = function(center, radius) {
  var hex_array = [];
   
  var hex = center.add(hex_direction[4].multiply(radius));
  for (let i=0; i<6; i++) {
    for (let j=0; j<radius; j++) {
      hex_array.push(hex);
      hex = hex.getNeighbor(i);
    }
  }
  
  return hex_array;
}










///////////////////////////////////////////////
///////////////////////////////////////////////
///////////////////////////////////////////////
  
     // VERTEX

///////////////////////////////////////////////
///////////////////////////////////////////////
///////////////////////////////////////////////

export function Vertex(hex,direction_number) {
  this.hex = hex;
  this.direction_number = direction_number;
}
  Vertex.prototype.equals = function(other_vertex) {
    if (listContainsHex(this.getInnerHex(),    other_vertex.getHexes()) &&
        listContainsHex(this.getOuterHex(),    other_vertex.getHexes()) &&
        listContainsHex(this.getClockwiseHex(),other_vertex.getHexes()) ) {
      return true;
    }
  }


  //getHexes returns the 3 hexes that neighbor a Vertex
  Vertex.prototype.getHexes = function() {
    return [this.getInnerHex(), 
            this.getOuterHex(), 
            this.getClockwiseHex()];

  }
  //getInnerHex
  Vertex.prototype.getInnerHex = function() {
    return this.hex;
  }
  Vertex.prototype.getOuterHex = function() {
    return this.hex.getNeighbor( this.direction_number );
  };
  Vertex.prototype.getClockwiseHex = function() {
    //returns the hex which is clockwise from the outer hex
    var direction = (this.direction_number+5)%6;
    var clockwise_hex = this.hex.getNeighbor(direction);
    return clockwise_hex
  };

  //returns the vertex coordinate in fractional hexes 
  Vertex.prototype.getPoint = function(shrink_ratio) {

    //shrink ratio will multiply the distance from the center of the hex
    let shrink = shrink_ratio || 1;

    //returns the fractional hex coordinates of the corner
    let corner_hex = hex_corner[this.direction_number];
    var corner = corner_hex.multiply(shrink);
    return corner.add( this.hex);
  };
















////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
                
      //            EDGES

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

export function Edge(hex,direction_number) {
  this.hex = hex;
  this.direction_number = direction_number;
}
  Edge.prototype.equals = function(other_edge) {
    //same hex, same direction
    if (this.getInnerHex().equals(other_edge.getInnerHex()) 
        && this.direction_number == other_edge.direction_number) {
      return true;
    }
    //opposite hex, opposite direction
    if (this.getInnerHex().equals(other_edge.getOuterHex()) 
      && this.direction_number == (other_edge.direction_number+3)%6) {
      return true;
    }

    return false;
  }

  //Returns the Hex on one side of the edge
  Edge.prototype.getInnerHex = function() {
    return this.hex;
  };

  //Returns the Hex on the other side of the edge
  Edge.prototype.getOuterHex = function() {
    return this.hex.getNeighbor( this.direction_number );
  };

  //As seen from the InnerHex's perspective, 
  //Point2 is counterclockwise from Point1
  Edge.prototype.getPoint1 = function(shrink_ratio) {
    return this.getVertex1().getPoint(shrink_ratio);
  };
  Edge.prototype.getVertex1 = function() {
    var vertex_direction = (this.direction_number);
    return new Vertex(this.hex, vertex_direction);
  };
  //return the coordinates of the second one
  Edge.prototype.getPoint2 = function(shrink_ratio) {
    return this.getVertex2().getPoint(shrink_ratio);
  };
  Edge.prototype.getVertex2 = function() {
    var vertex_direction = (this.direction_number+1)%6;
    return new Vertex(this.hex, vertex_direction);
  }


////////////////////////////////////////////////////////////







////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
                
      //            OUTLINE OF HEXES

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////






//returns the outside edges only of a group of hexes 
Hex.outline = function(hexes) {

  //HEXES: array of hexes
  //var UNSORTED_EDGES: array of edges (order the 
  //coordinates counter-clockwise so it is possible 
  //to follow them around the shape)
  var unsorted_edges = []; //array of edges for all hexes

  //for each hex in HEXES
  for (let hex of hexes) {

    let edges = []; //array of edges for 1 hex
    
    //for each edge of that hex
    for (let d=0; d<6; d++) {

      let edge = new Edge( hex, d );
      let neighbor = hex.getNeighbor( d );

      //if the hex across it is part of HEXES
      if (listContainsHex(neighbor, hexes)) {
        //dot not add this hex to the edges
        continue;

      } else {
        //add that edge to the HEXEDGES array
        edges.push(edge);
      }
    }

    //add the edges to the list
    unsorted_edges.push(...edges);
  }
  //sort the edges
  var sorted_edges = Edge.sort(unsorted_edges);
  return sorted_edges;
}

//sorts an array of edges into many loops of connected edges
Edge.sort = function(unsorted_edges) {
  
  //create a new ARRAY OF EDGE ARRAYS
  var edge_loops = [];

  var max_attempts = 30;

  //Look through all the edges, trying to make loops
  while (unsorted_edges.length > 0) {
    
    let attempts = max_attempts;

    let sorted_edges = [];
    let current_edge = unsorted_edges.pop();
    sorted_edges.push( current_edge );
    
    //while the edges in sorted_edges do not make a loop
    while ( ! current_edge.getVertex2().equals(sorted_edges[0].getVertex1())  ) {
  
      attempts -= 1;

      //check the other unsorted edges for the matching one
      for (let [i, maybe_edge] of unsorted_edges) {
      
        //if MAYBE_EDGE connects with CURRENT_EDGE
	      let vertexC = maybe_edge.getVertex1();
	      let vertexD = current_edge.getVertex2();
        if ( vertexC.equals(vertexD) ) {

          //Add the new edge to the list
          sorted_edges.push ( maybe_edge );
          current_edge = maybe_edge;
          unsorted_edges.splice(i,1);

          //start over at the top of the unsorted list
          attempts = max_attempts;
          break;
        } 
      }

      if (attempts <= 0) {
        console.error('too many attempts in sorted_edge');
        break;
      }
    }
    //if you are here, it means the loop found a circle of 
    //connecting edges. verify that the last edge in 
    //SORTED_EDGES matche the first edge in SORTED EDGES
    let vertexE = sorted_edges[0].getVertex1()
    let vertexF = sorted_edges[sorted_edges.length-1].getVertex2();
    if (!(vertexE.equals(vertexF) ) ) {
      console.error('hex boundaries do not match');
    }

    edge_loops.push(sorted_edges);
  }
  
  return edge_loops;
}











//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
                
      //            HEXMAP DATA STRUCTURE

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////

/*
  a HexMap is an array of hex positions (keys), 
  with content defined for each position (value)
  if no value is defined, the hex is not part of the map
  the areas of a HexMap are not necessarily contiguous
*/

//value can be anything, even an array. use as needed
export function HexMap() {

  this.hexes = new Map();
  this.values = new Map();
}

HexMap.prototype.set = function(hex,value) {
  let key = hex.getKey();
  this.hexes.set(key,hex);
  this.values.set(key,value);
}

HexMap.prototype.delete = function(hex) {
  if (this.containsHex(hex)) {
    let key = hex.getKey();
    this.hexes.delete(key);
    this.values.delete(key);
  }
}
HexMap.prototype.deleteAll = function() {
  this.values = new Map();
  this.hexes = new Map();
}

HexMap.prototype.getValue = function(hex) {
  var key = hex.getKey();
  return this.values.get(key) || false;

}
HexMap.prototype.get = HexMap.prototype.getValue;

HexMap.prototype.getHex = function(key) {

  if (key === 0) {
    return new Hex(0,0);
  }
  //else, reverse Szudzik's function
  var z = key;
  var f = Math.floor(Math.sqrt(key));
  var f2 = Math.pow(f,2);
  var Q = ((z-f2)<f)?(z-f2):(f);
  var R = ((z-f2)<f)?(f):(z-f2-f);

  var q = isEven(Q)?(Q/2):((Q+1)/-2);
  var r = isEven(R)?(R/2):((R+1)/-2);

  return new Hex(q,r);
};
HexMap.prototype.size = function() {
  return this.values.size;
}
HexMap.prototype.getNeighbors = function(hex) {
  let all_neighbors = hex.getNeighbors();
  let neighbors_on_map = [];
  for (let neighbor of all_neighbors) {
    if (this.containsHex(neighbor)) {
      neighbors_on_map.push(neighbor);
    }
  }
  return neighbors_on_map;
}

HexMap.prototype.popHex = function() {
  if (this.size() <= 0)
    return;

  let hex = this.getHexes().next().value;
  this.delete(hex);
  return hex;
}
HexMap.prototype.getRandomHex = function() {
  return [...this.hexes.values()][Math.floor(Math.random() * this.hexes.size)]
}
//returns a simple array of each hex contained in this map
HexMap.prototype.getHexes = function() {
  return this.hexes.values();
}
//HexMap getValues returns an array of each defined value
HexMap.prototype.getValues = function() {
  return this.values.values();
}

//HexMap contains: finds if the hex is part of the map 
//by checking if its value is defined
HexMap.prototype.containsHex = function(hex) {
  let key = hex.getKey()
  return this.values.has(key)
}

//HexMap containsKey: finds if the key is defined by 
//checking for the key directly 
HexMap.prototype.containsKey = function(key) {
  return this.values.has(key)
}





HexMap.prototype[Symbol.iterator] = function() {
   
}

//Following functions deal with submaps

HexMap.prototype.addSubmap = function(submap) {

  for (let hex of submap.getHexes()) {
      let value = submap.getValue(hex);
      this.set(hex, value);
  }
}

HexMap.prototype.getHexagonSubMap = function(origin,radius){
  var submap = new HexMap();
  //this doesn't do anything
  return submap;
}

//Returns a subset of hexes within the boundaries of the input
HexMap.prototype.getRectangleSubMap = function(qmin,qmax,rmin,rmax) {
  var submap = new HexMap();


  for (let r = rmin; r<=rmax; r++) {
    let currentr = r;
    if (!isEven(r)) currentr += 1;

    let qstart = this.getLineShift(currentr,rmax,qmin);
    let qend = this.getLineShift(currentr,rmax,qmax);

    let linemap = this.getLineSubMap(r, qstart, qend);
    submap.addSubmap(linemap);
  }
  return submap;
}

HexMap.prototype.getLineShift = function(r, rmax, q) {
  let step_shift = (rmax - r)/2;
  let q_shifted = Math.floor( q + step_shift);
  return q_shifted;
}

HexMap.prototype.getLineSubMap = function(r, qmin, qmax) {
  var submap = new HexMap();
  for (let q=qmin; q<qmax; q++) {
    let hex = new Hex(q,r);
    if (this.containsHex(hex)) {
      let value = this.getValue(hex);
      submap.set(hex, value);
    }
  }
  return submap;
}


function isEven(n) {
  return n%2==0;
}








////////////////////////////////////////////////////
////////////////////////////////////////////////////
////////////////////////////////////////////////////
                
      //            HEX LAYOUT

////////////////////////////////////////////////////
////////////////////////////////////////////////////
////////////////////////////////////////////////////

// POINT
// The Point class is a simple cartesian coordinate 
// with some helper functions

export function Point (x,y) {
  this.x = x;
  this.y = y;

  this.set = function(x,y) {
    this.x = x;
    this.y = y;
  }
  this.offset = function(xi,yi) {
    return new Point(this.x+xi,this.y+yi);
  }
  this.add = function(point) {
    return new Point(this.x+point.x,this.y+point.y);
  }
  this.invert = function() {
    return new Point(-this.x,-this.y);
  }
  this.scale = function(k) {
    return new Point(this.x*k,this.y*k);
  }
  this.getDifference = function(point) {
    return new Point(point.x-this.x,point.y-this.y);
  }

}


//  ORIENTATION
//the F numbers are the forward matrix xy = f*qr
//the b numbers are the backwards matrix qr = b*xy
//start_angle defines the first corner of the hexagon 

function Orientation(_f0,_f1,_f2,_f3,
                     _b0,_b1,_b2,_b3,
                     _start_angle) {
  this.f0=_f0; 
  this.f1=_f1;
  this.f2=_f2;
  this.f3=_f3;
  this.b0=_b0;
  this.b1=_b1;
  this.b2=_b2;
  this.b3=_b3;
  this.start_angle=_start_angle;
}

//Pointy orientation has hexes with neighbors directly to the left and right
const orientation_pointy = new Orientation(Math.sqrt(3.0), Math.sqrt(3.0)/2.0, 0.0, 
                                           3.0/2.0,  Math.sqrt(3.0)/3.0, -1.0/3.0, 
                                           0.0, 2.0/3.0, 0.5 );

//Flat orientation has hexes with neighbors directly above and below
const orientation_flat = new Orientation(  3.0/2.0, 0.0, Math.sqrt(3.0)/2.0, 
                                            Math.sqrt(3.0), 2.0/3.0, 0.0, 
                                            -1.0/3.0, Math.sqrt(3.0)/3.0, 0.0 );

function getOrientation(string) {
  if (string == 'orientation_flat') {
    return orientation_flat;
  }
  return orientation_pointy;
}

//The HexLayout class relates hex coordinates to world coordinates
//It positions the virtual grid points in space


export function HexLayout (orientation_string, size, origin) {
  
  this.orientation = getOrientation(orientation_string);
  this.size = size;     //point object
  this.origin = origin; //point object

}

//   HEX AND PIXEL RELATIONS
HexLayout.prototype.hexToPoint = function(hex) {
  var ori = this.orientation;
  var x = (ori.f0 * hex.getQ() + ori.f1 * hex.getR()) * this.size.x;
  var y = (ori.f2 * hex.getQ() + ori.f3 * hex.getR()) * this.size.y;
  return new Point(this.origin.x + x, this.origin.y + y);
}

HexLayout.prototype.pointToHex = function(point) {
  var ori = this.orientation;
  var pt = new Point((point.x - this.origin.x)/this.size.x,
          (point.y - this.origin.y)/this.size.y);
  var q = ori.b0 * pt.x + ori.b1 * pt.y;
  var r = ori.b2 * pt.x + ori.b3 * pt.y;
  return new Hex(q,r);
}
HexLayout.prototype.pointsToHexes = function(points) {
  var hexes = [];
  var i=0;
  for ( let point of points) {
    hexes[i] = this.pointToHex(point);
    i++;
  }
  return hexes;
}



