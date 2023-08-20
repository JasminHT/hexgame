
import View from './View.js'
import ViewRender from './ViewRender.js';
import WorldRender from './WorldRender.js';
import WorldInput from './WorldInput.js';
import HUDRender from './HudRender.js';
import Events from './u/Events.js';



export default function GameRender(system, worlds, world_inputs, view) {

  let render = new ViewRender('canvas', view);
  let layers = [];
  let hud_renders = [];

  layers.push(new LayerRender(system))
  for (let world of worlds) 
    layers.push(new LayerRender(world))


  for (let world_input of world_inputs) 
    hud_renders.push( new HUDRender(world_input.getWorld(), world_input, render) );


  function clear() {
    for (let layer of layers)
      layer.clear();
  }

  function updateLayers() {
    for (let layer of layers) {
      layer.drawTiles();
    }
  }


  function draw() {

    render.clear();

    //blit the temporary canvases to the final canvas
    for (let layer of layers) {
      layer.blit('canvas', view)
    }

    //draw the HUD on top
    for (let hud of hud_renders)
      hud.drawHUD();

  }

  function loop(callback, time) {
    let then = new Date().getTime();

    function step() {

      let now = new Date().getTime();

      //if the required time hasnt elapsed yet, wait till next frame
      if (now-then < time) { 
       //window.requestAnimationFrame(step);
       //return;
      }

      callback();

      //now = then = new Date().getTime();
      window.requestAnimationFrame(step);
    }
    step();
  }

  this.startDrawing = function() {
    loop(draw, 30);
    loop(updateLayers, 60); 
  }


  Events.on('click', updateLayers);
  Events.on('canvas_resize', updateLayers);
  //updateLayers();
}

















var layer_ids = 1;

function LayerRender(world) {

  let canvas_name = 'canvas_'+layer_ids;
  layer_ids++;

  this.temp_canvas = this.createCanvas(canvas_name);

  let tilesize = world.layout.size.x;
  let worldwidth = 4*tilesize*world.radius;
  let canvaswidth = 4*35*world.radius;

  //a canvas is created large enough to draw the whole world
  this.temp_canvas.width = canvaswidth;
  this.temp_canvas.height = canvaswidth;

  //a view is created to fit the world into that canvas
  this.full_view = new View(canvas_name);
  this.full_view.setInput(
    world.layout.origin.x-worldwidth/2, 
    world.layout.origin.y-worldwidth/2, 
    worldwidth, 
    worldwidth
    ); //world coordinates
  this.full_view.setOutput(0, 0, canvaswidth, canvaswidth);  //canvas coordinates

  //this temp world render draws the entire layer into a full-sized canvas
  //later on, it must blit a section of this canvas to the final canvas
  var render = new ViewRender(canvas_name, this.full_view);
  this.world_render = new WorldRender(world, render); 
}

LayerRender.prototype.createCanvas = function(canvas_name) {
  let canvas = document.createElement('canvas');
  canvas.id = canvas_name;
  canvas.style.display = 'none';
  document.body.appendChild(canvas)
  return canvas;
}

LayerRender.prototype.RenderFromTempCanvasToScreen = function(canvas_name, view) {
  let blitview = new View(canvas_name);

  blitview.setInput(
    this.full_view.worldToScreen( view.getPosition() ).x,
    this.full_view.worldToScreen( view.getPosition() ).y,
    this.full_view.worldToScreen1D( view.getInputSize().x ),
    this.full_view.worldToScreen1D( view.getInputSize().y ),
  );

  return new ViewRender(canvas_name, blitview);
}

LayerRender.prototype.blit = function(canvas_name, view) {
  let render = this.RenderFromTempCanvasToScreen(canvas_name, view);
  render.blitCanvas(this.temp_canvas);
}

var attempt_count = 500;
var draw_count = 200;
LayerRender.prototype.drawTiles = function() {
  this.world_render.drawSome(attempt_count, draw_count);
}

LayerRender.prototype.clear = function () {
  this.world_render.clear();
}

