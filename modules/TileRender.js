
import {RenderStyle} from './ViewRender.js'
import Hex from './u/Hex.js'

export default function TileRender(world, hex_render) {


  this.drawTile = function(hex, tile) {
    
    //draw clouds if not explored
    if (tile.hidden) {
      drawHex(hex, 32);

    } else {
      drawLand(hex, tile);
      drawRiver(hex, tile);
      drawRoad(hex, tile);
      drawUnit(hex, tile);
      drawResource(hex, tile);
    }
  }


  function getTile(hex, tile) {
      return world.getTile(hex);
  }

  function drawLand(hex, tile) {
    
    let purple = ['#924','#915','#925','#926','#936','#926','#924' ];
    let green = ['#228822','#226633', '#337744','#336633','#337722','#225533','#228822'];
    let brown = ['#421','#412','#431','#421','#412','#431','#421','#412','#431'];
    let blue = ['#216','#126','#114'];

    if (tile.elevation < 0)
      return;

    //normal tiles
    if (!tile.highlighted()) {
      drawHex(hex, tile.elevation);
      return;
    }

    if (tile.hasHighlight('brown') && tile.elevation < 2) {
      //drawHex(hex, tile.elevation);
      drawHex(hex, tile.elevation, blue[tile.elevation%7] );
      return;
    }

    if (tile.hasHighlight('green') && tile.elevation >= 2) {
      drawHex(hex, tile.elevation, green[tile.elevation%7] );
      return;
    }

    if (tile.hasHighlight('brown')) {
      drawHex(hex, tile.elevation, brown[tile.elevation%7] );
      return;
    }

    
  }

  function drawHex(hex, elevation, color) {

    var style = new RenderStyle();  
    style.fill_color = color || color_palette(elevation, world.type);
    hex_render.drawHex(hex, style);
  }

  function drawRiver(hex, tile) {

    let min_draw_level = 7;
    let max_draw_level = 150;

    if (tile.river) {

      //downstream river first
      let downstream_hex = tile.river.downstream_hex;
      drawHalfRiver(hex, downstream_hex, tile)

      //upstream rivers next
      let upstream_hexes = tile.river.upstream_hexes;
      if (upstream_hexes instanceof Array) {
        for (let upstream_hex of upstream_hexes) {
          let upstream_tile = getTile(upstream_hex);
          if (!upstream_tile.river)
            continue;
          drawHalfRiver(hex, upstream_hex, upstream_tile)
        }
      }
    }

    function drawHalfRiver(hex, other_hex, tile) {
      let water_level = tile.river.water_level;
      if (other_hex instanceof Hex && water_level >= min_draw_level){
        let line_width = Math.floor(Math.sqrt(Math.min(water_level, max_draw_level)*9));
        hex_render.drawCenterLine(hex, other_hex, line_width, '#22D', 'half only' );
      }
    }
  }

  function drawRoad(hex, tile) {

    let road_style = 'half only'
    let road_color = '#040';
    road_color = 'saddlebrown';

    if (tile.road_to) 
      for (let to of tile.road_to.getHexes())
        drawRoadHalf(to)

    function drawRoadHalf(to) {

      let road_size = tile.road_to.getValue(to);

      if (road_size < 1) 
        return;

      if (road_size > 8) 
        road_color = 'saddlebrown'; 
      
      hex_render.drawCenterLine(hex, to, 3+road_size*2, road_color, 'half only');
    }

  }

  function drawUnit(hex, tile) {

    let unit = tile.getUnit(hex)
    if (unit)
      drawEntity(hex, tile, unit);
  }

  function drawResource(hex, tile) {

    let resource = world.getResource(hex);
    if (resource && resource.resources)
      drawEntity(hex, tile, resource);
  }

  //units and resources are both "unit" objects
  function drawEntity(hex, tile, unit) {

    let view = hex_render.render.view;

    var position = hex_render.hexToPoint(hex);
   
    var unit_style = new RenderStyle();
    unit_style.fill_color = unit.color;


    if (unit.type == 'unknown')
      unit_style.fill_color = "rgba("+(128+127*ocillate(1000))+","+(255*ocillate(1000))+","+(128-128*ocillate(1000))+",1)";

    let zoom = view.getZoom();
    let size = 10*unit.size*world.getZoom();


    //large units
    if (unit.size > 4 || (unit.pop && unit.pop > 9))
      hex_render.drawHex(hex, unit_style);
    
    //medium units
    if (unit.pop && unit.pop >= 2 && unit.pop <= 9) {
      hex_render.render.drawDot(position, Math.min(size, 1.5*size/zoom ), unit_style);
    }

    
    if (world.biggestRoad(hex) <= 8) {
      
      //small units
      if (unit.pop && unit.pop < 2 && unit.size <= 4) 
          hex_render.render.drawDot(position, Math.min(size/2, 1.5*size/2/zoom ), unit_style);
      //resources and colonies
      if (!unit.pop && unit.size <= 4)
        hex_render.render.drawDot(position, Math.min(size, 1.5*size/zoom ), unit_style);
    }


    
    //draw a number on the unit
    if (unit.pop && unit.pop >= 2) {
      let text_style = new RenderStyle();
      let zoom = view.getZoom();
      text_style.text_size = Math.min(45, 1.5*45/zoom );
      let text = unit.pop;      
      hex_render.render.drawText(text, position, text_style, true);
    }

  };





















  function getWindArrowCharacter(direction) {
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

  function ocillate(length) {
    let time = new Date().getTime()%length;
    let value = 2*Math.abs(time/length-0.5);
    return value;
  }

  //colors of different tiles depending on height

  function color_palette(i, colortype) {

    i = Math.floor(i);

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
                      '#CCC','#CCC','#CCC','#CCC','#CCC','#CCC','#CCC','#CCC','#CCC','#CCC','#CCC','#CCC', //ice
                      '#EEE']; //clouds
                        return colors[i];


    case 'earth' : var colors = 
                      ['#115','#22D','#994', //ocean coast sand 0 1 2
                      '#282','#163', //grass 3 4
                      '#363','#242','#232','#231', //forest 5 6 7 8
                      '#321','#312','#331', //hills 9 10 11 12 13
                      '#412','#422',
                      '#777', '#777','#777', //mountains 14 15 16
                      '#888','#888','#888', //mountains 17 18 19
                      '#CCC','#CCC','#CCC','#CCC','#CCC','#CCC','#CCC','#CCC','#CCC','#CCC','#0552','#CCC', //ice //atmosphere
                      '#EEE']; //clouds
                        return colors[i];



    case 'rock' : var colors = ['#115','#22D','#443', //ocean coast sand 0 1 2
                      '#333','#444','#413937', //grass 3 4 5
                      '#333','#444','#414241', //forest  6 7 8
                      '#474047','#404740','#404747', //hills 9 10 11 12 13
                      '#585951','#484951',
                      '#BBB', '#BBB','#BBB', //mountains 14 15 16
                      '#CCC','#DDD','#EEE', //mountains 17 18 19
                      '#CCC','#CCC','#CCC','#CCC','#CCC','#CCC','#CCC','#CCC','#CCC','#CCC','#CCC','#CCC', //ice
                      '#EEE']; //clouds
                      return colors[i];

    default:
    case 'mars' : var colors = ['#222','#222','#BBB', //DUST SCALE
                      '#B1B6B4', '#B1B5B2','#B5B2B7', //grass 3 4 5
                      '#B1B5B6', '#B2B6B','#B6B7B5', //forest  6 7 8
                      '#B1B2B3', '#B4B1B3','#B5B1B4', //hills 9 10 11 12 13
                      '#B6B1B2', '#B4B1B4',
                      '#B4B4B8', '#B4B1B8','#B1B6B7', //mountains 14 15 16
                      '#CCC','#DDD','#EEE', //mountains 17 18 19
                      '#CCC','#CCC','#CCC','#CCC','#CCC','#CCC','#CCC','#CCC','#CCC','#CCC','#CCC','#CCC', //ice
                      '#EEE']; //clouds
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


}