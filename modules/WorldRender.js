
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
import TileRender from './TileRender.js'


export default function WorldRender (world, render) {
  
  this.hex_render = new HexRender(render, world.getLayout() );
  this.world = world;
  this.tile_render = new TileRender(world, this.hex_render);

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


WorldRender.p.drawSome = function(attempts, draws) {

  let hexes_drawn = 0;
  
  if (!attempts)
    var attempts = 100;

  while (attempts && draws) {

    if (this.world.getChangedHexes().length == 0) {
      break;
    }
    let next = this.world.getChangedHexes().shift();


    if (next instanceof Hex && this.drawTile(next)) {
      hexes_drawn++
      draws--; //draws measure the number of tiles actually drawn
    }
    attempts--; //attempts measure the number of tiles checked for changes

  }
}

WorldRender.p.drawTile = function(hex) {


  //Only draw changed tiles
  let tile = this.world.getTile(hex);
  if (tile.changed)
    tile.changed = false;
  else {
    return false;
  }



  this.tile_render.drawTile(hex, tile)


  return true;
}


















