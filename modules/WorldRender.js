
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
import {HexMap} from './u/Hex.js'
import Hex from './u/Hex.js'
import HexRender from './HexRender.js'
import {RenderStyle} from './ViewRender.js'
import TileRender from './TileRender.js'
import Events from './u/Events.js'


export default function WorldRender (world, render) {
  
  var hex_render = new HexRender(render, world.getLayout() );
  var tile_render = new TileRender(world, hex_render);

  var changed_hexes = new HexMap();
  for (let hex of world.getHexes()) {
    changed_hexes.set(hex,true);
  }

  Events.on('tile_changed', (e)=>watchChangedHexes(e.detail.world, e.detail.hex));

  this.clear = function() {
    hex_render.clear();
  }



  function watchChangedHexes(changed_world, hex) {
    
    if (changed_world.sameAs(world))
      if (world.containsHex(hex))
        changed_hexes.set(hex,true);
  }


  this.drawBigHex = function(radius) {

    let big_corners = [];
    let center = new Hex(0,0);

    for (let corner of center.getNeighbors()) {
      big_corners.push(hex_render.hexToPoint(Hex.multiply(corner,world.radius)));
    }

    let style = new RenderStyle();
    style.fill_color = "#005";
    hex_render.render.drawPolygon(big_corners, style);
  }


  this.drawChanged = function(max = 100) {

    while (max) {

      if (world.getChangedHexes().length == 0) 
        break;

      let next = changed_hexes.popHex(); 

      if (next instanceof Hex)
        drawTile(next)

      max--;
    }
  }

  function drawTile(hex) {

    let tile = world.getTile(hex);

    tile_render.drawTile(hex, tile)
  }


}