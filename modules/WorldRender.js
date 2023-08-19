
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

           //WORLD RENDERER

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////



import CanvasDraw from './u/CanvasDraw.js'
import World from './World.js'
import Unit from './Unit.js'
import Hex from './u/Hex.js'
import HexRender from './HexRender.js'
import {RenderStyle} from './ViewRender.js'


export default function WorldRender (world, render) {
  
  this.hex_render = new HexRender(render, world.getLayout() );
  this.world = world;

  this.render_portion = 1;

  var self = this; 

}

WorldRender.p = WorldRender.prototype;

WorldRender.p.clear = function() {
  this.hex_render.clear();
}



WorldRender.p.drawBigHex = function(radius) {

  let big_corners = [];
  let center = new Hex(0,0);

  for (let corner of center.getNeighbors()) {
    big_corners.push(this.hex_render.hexToPoint(Hex.multiply(corner,this.world.radius)));
  }

  let style = new RenderStyle();
  style.fill_color = "#005";
  this.hex_render.render.drawPolygon(big_corners, style);
}



















//TODO: What if instead of rendering in random waves, we only updates tiles that have changed!
//Still look at all hexes, but there is a flag when they have been modified.
//We only re-render if the flag has changed


WorldRender.p.drawSome = function(tile_layer, attempts, draws) {

  let hexes_drawn = 0;
  
  if (!attempts)
    var attempts = 100;

  while (attempts && draws) {

    if (this.world.getChangedHexes().length == 0) {
      break;
    }
    let next = this.world.getChangedHexes().shift();


    if (next instanceof Hex && this.drawTile(tile_layer, next)) {
      hexes_drawn++
      draws--; //draws measure the number of tiles actually drawn
    }
    attempts--; //attempts measure the number of tiles checked for changes

  }
}

WorldRender.p.drawTile = function(tile_layer, hex) {


  //Only draw changed tiles
  let tile = this.world.getTile(hex);
  if (tile.changed)
    tile.changed = false;
  else {
    return false;
  }



  switch (tile_layer) {
    case 'tiles':
      this.drawLand(hex);
      this.drawRiver(hex);
      this.drawRoad(hex);
      this.drawUnit(hex);
      this.drawResource(hex);
      break;
  }

  return true;
}


















WorldRender.p.getTile = function(hex) {
    return this.world.getTile(hex);
}

WorldRender.p.drawLand = function(hex) {

  let tile = this.getTile(hex);
  
  let purple = ['#924','#915','#925','#926','#936','#926','#924' ];
  let green = ['#228822','#226633', '#337744','#336633','#337722','#225533','#228822'];
  let brown = ['#421','#412','#431','#421','#412','#431','#421','#412','#431'];
  let blue = ['#216','#126','#114'];


  //draw clouds if not explored
  if (tile.hidden) {
    this.drawHex(hex, 32);
    return;
  }

  if (tile.elevation < 0)
    return;

  if (!tile.highlighted()) {
    this.drawHex(hex, tile.elevation);
    return;
  }

  if (tile.hasHighlight('brown') && tile.elevation < 2) {
    this.drawHex(hex, tile.elevation);
    //this.drawHex(hex, tile.elevation, blue[tile.elevation%7] );
    return;
  }

  if (tile.hasHighlight('green') && tile.elevation >= 2) {
    this.drawHex(hex, tile.elevation, green[tile.elevation%7] );
    return;
  }

  if (tile.hasHighlight('brown')) {
    this.drawHex(hex, tile.elevation, brown[tile.elevation%7] );
    return;
  }

  
}

WorldRender.p.drawHex = function(hex, elevation, color) {

  var style = new RenderStyle();  

  //analyze tile
  var height = Math.floor(elevation);
  style.fill_color = color_scale(height, this.world.type);
  if (color)
    style.fill_color = color;

  this.hex_render.drawHex(hex, style);
}

WorldRender.p.drawRiver = function(hex) {

  let tile = this.getTile(hex)
  if (tile.hidden) return;

  let water_draw_level = 7;
  let max_draw_level = 150;

  if (tile.river) {

    //downstream river first
    let downstream_hex = tile.river.downstream_hex;
    let water_level = tile.river.water_level;
    if (downstream_hex instanceof Hex && water_level >= water_draw_level)
      this.hex_render.drawCenterLine(hex, downstream_hex, Math.floor(Math.sqrt(Math.min(water_level,max_draw_level)*9)), '#22D', 'half only' );

    //upstream rivers next
    let upstream_hexes = tile.river.upstream_hexes;
    if (upstream_hexes instanceof Array) {
      for (let upstream_hex of upstream_hexes) {
        if (!this.getTile(upstream_hex).river)
          continue;
        let up_level = this.getTile(upstream_hex).river.water_level;
        if (up_level >= water_draw_level)
          this.hex_render.drawCenterLine(hex, upstream_hex, Math.floor(Math.sqrt(Math.min(up_level,max_draw_level)*9)), '#22D', 'half only' );
      }
    }
  }
}

WorldRender.p.drawRoad = function(hex) {

  let tile = this.getTile(hex);
  if (tile.hidden) return;
  
  let self = this;  
  let road_style = 'half only'
  let road_color = '#040';


  if (tile.road_to) 
    drawRoadHalf(tile.road_to)

  function drawRoadHalf(road_to) {
    for (let to of road_to.getHexes()) {
      
      let road_size = road_to.getValue(to);

      if (road_size < 1) 
        continue;

      if (road_size > 8) 
        road_color = 'saddlebrown'; 
      
      self.hex_render.drawCenterLine(hex, to, 3+road_size*2, road_color, 'half only');
    }
  }
}

WorldRender.p.drawUnit = function(hex) {

  let unit = this.world.getUnit(hex);
  if (unit)
    this.drawEntity(hex, unit);
}

WorldRender.p.drawResource = function(hex) {

  let resource = this.world.getResource(hex);
  if (resource && resource.resources)
    this.drawEntity(hex, resource);
}

//units and resources are both "unit" objects
WorldRender.p.drawEntity = function(hex, unit) {
  
  let tile = this.getTile(hex)
  if (tile.hidden) return;

  let view = this.hex_render.render.view;

  var position = this.hex_render.hexToPoint(hex);
 
  var unit_style = new RenderStyle();
  unit_style.fill_color = unit.color;


  if (unit.type == 'unknown')
    unit_style.fill_color = "rgba("+(128+127*this.ocillate(1000))+","+(255*this.ocillate(1000))+","+(128-128*this.ocillate(1000))+",1)";

  let zoom = view.getZoom();
  let size = 10*unit.size*this.world.getZoom();


  //large units
  if (unit.size > 4 || (unit.pop && unit.pop > 9))
    this.hex_render.drawHex(hex, unit_style);
  
  //medium units
  if (unit.pop && unit.pop >= 2 && unit.pop <= 9) {
    this.hex_render.render.drawDot(position, Math.min(size, 1.5*size/zoom ), unit_style);
  }

  
  if (this.world.biggestRoad(hex) <= 8) {
    
    //small units
    if (unit.pop && unit.pop < 2 && unit.size <= 4) 
        this.hex_render.render.drawDot(position, Math.min(size/2, 1.5*size/2/zoom ), unit_style);
    //resources and colonies
    if (!unit.pop && unit.size <= 4)
      this.hex_render.render.drawDot(position, Math.min(size, 1.5*size/zoom ), unit_style);
  }


  
  //draw a number on the unit
  if (unit.pop && unit.pop >= 2) {
    let text_style = new RenderStyle();
    let zoom = view.getZoom();
    text_style.text_size = Math.min(45, 1.5*45/zoom );
    let text = unit.pop;      
    this.hex_render.render.drawText(text, position, text_style, true);
  }

};

WorldRender.prototype.ocillate = function(length) {
  let time = new Date().getTime()%length;
  let value = 2*Math.abs(time/length-0.5);
  return value;
}



















var getWindArrowCharacter = function(direction) {
    switch (direction) {
        case 0: return 8594; break;
        case 1: return 8599; break;
        case 2: return 8598; break;
        case 3: return 8592; break;
        case 4: return 8601; break;
        case 5: return 8600; break;
        default: return 8635;
    }
}


//colors of different tiles depending on height

var color_scale = function (i, colortype) {

  if (!colortype)
    var colortype = "earth";



  switch (colortype) {

  case 'earth2': var colors = 
                    ['#005','#00D','#AA3', //ocean coast sand 0 1 2
                    '#080','#062', //grass 3 4
                    '#052','#042','#032','#020', //forest 5 6 7 8
                    '#310','#310','#320', //hills 9 10 11 12 13
                    '#310','#310',
                    '#777', '#777','#777', //mountains 14 15 16
                    '#888','#888','#888', //mountains 17 18 19
                    '#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF', //ice
                    '#CCC']; //clouds
                      return colors[i];


  case 'earth' : var colors = 
                    ['#115','#22D','#994', //ocean coast sand 0 1 2
                    '#282','#163', //grass 3 4
                    '#363','#242','#232','#231', //forest 5 6 7 8
                    '#321','#312','#331', //hills 9 10 11 12 13
                    '#412','#422',
                    '#777', '#777','#777', //mountains 14 15 16
                    '#888','#888','#888', //mountains 17 18 19
                    '#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#0552','#FFF', //ice
                    '#CCC']; //clouds
                      return colors[i];



  case 'rock' : var colors = ['#115','#22D','#443', //ocean coast sand 0 1 2
                    '#333','#444','#413937', //grass 3 4 5
                    '#333','#444','#414241', //forest  6 7 8
                    '#474047','#404740','#404747', //hills 9 10 11 12 13
                    '#585951','#484951',
                    '#BBB', '#BBB','#BBB', //mountains 14 15 16
                    '#CCC','#DDD','#EEE', //mountains 17 18 19
                    '#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF', //ice
                    '#CCC']; //clouds
                    return colors[i];

  default:
  case 'mars' : var colors = ['#222','#222','#BBB', //DUST SCALE
                    '#B1B6B4', '#B1B5B2','#B5B2B7', //grass 3 4 5
                    '#B1B5B6', '#B2B6B','#B6B7B5', //forest  6 7 8
                    '#B1B2B3', '#B4B1B3','#B5B1B4', //hills 9 10 11 12 13
                    '#B6B1B2', '#B4B1B4',
                    '#B4B4B8', '#B4B1B8','#B1B6B7', //mountains 14 15 16
                    '#CCC','#DDD','#EEE', //mountains 17 18 19
                    '#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF', //ice
                    '#CCC']; //clouds
                      return colors[i];

  }


}


function darker(col) {
  return LightenDarkenColor(col, -0.7);
}

function lighter(col) {
  return LightenDarkenColor(col, 0.3);
}

function LightenDarkenColor(col,amt) {
    var usePound = false;
    if ( col[0] == "#" ) {
        col = col.slice(1);
        usePound = true;
    }

    if (col.length == 3)
      col = ""+col[0]+col[0]+col[1]+col[1]+col[2]+col[2];

    var num = parseInt(col,16);

    if (amt >= 0)
      {var r = (num >> 16); r=r+(255-r)*amt;}
    else
      {var r = (num >> 16); r=-r*amt;}

    if ( r > 255 ) r = 255;
    else if  (r < 0) r = 0;

    if (amt >= 0)
      {var b = ((num >> 8) & 0x00FF); b=b+(255-b)*amt;}
    else
      {var b = ((num >> 8) & 0x00FF);  b=-b*amt;}

    if ( b > 255 ) b = 255;
    else if  (b < 0) b = 0;

    if (amt >= 0)
      {var g = (num & 0x0000FF); g=g+(255-g)*amt;}
    else 
      {var g = (num & 0x0000FF);  g=-g*amt;}

    if ( g > 255 ) g = 255;
    else if  ( g < 0 ) g = 0;

    r = Math.floor(r);
    g = Math.floor(g);
    b = Math.floor(b);

    return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
}