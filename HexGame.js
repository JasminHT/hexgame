/* MAIN GAME FILE */
//-------1----------2---------3---------4---------5---------6---------7--------8

// Here is where all the javascript modules should be combined
// Avoid all cross-dependencies!
// Allow modules to be interconnected at this level
//////////////////////////// CREATING THE GAME //////////////////////////////

//---------------HTML5 Canvas elements-----------
//define the screen which can be drawn on
var real_canvas = document.getElementById('mycanvas');

var canvas = document.createElement("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//Interface for rendering on the Canvas
var canv_draw = new CanvasDraw(canvas);
var real_canv_draw = new CanvasDraw(real_canvas);
//Interface for receiving input from the page
var canv_input = new CanvasInput(real_canvas);

//-----------Game Engine elements-------------
//A moveable point of view into the game world
var view = new View(canvas);
//Has functions for drawing to the screen
var renderer = new Renderer(canv_draw, view);
var real_renderer = new Renderer(real_canv_draw, view);

//-------------Game-specific elements------------
//Contains a world map, units, and resources
var world = new World(35);// <-- model
//Has functions for drawing hexes to the screen
var hex_renderer = new HexRenderer(renderer, world.getLayout() );
var real_hex_renderer = new HexRenderer(real_renderer, world.getLayout() );

var world_renderer = new WorldRenderer(world, hex_renderer);  	//<---view  
//Receives input for the game
var game_input = new GameInput(world, view);     //<--controller
//draws mouse interactions
var hud_renderer = new HUDRenderer(world, game_input, real_hex_renderer);
hud_renderer.clearButtons();
//hud_renderer.update_function();

//world.clearClouds();

canv_input.windowResize();

////////////////////////// DRAWING TO THE CANVAS //////////////////


function step(timestamp) {
  drawScreen();
  window.requestAnimationFrame(step);
}
window.requestAnimationFrame(step);



function updateWorldRender() {

  //canv_draw.clear();
  world_renderer.drawWorld(); 

}

function drawScreen() {

  //clear the real canvas
  real_canv_draw.clear();

  //copy the temporary canvas to the real canvas
  var screen_context = real_canvas.getContext('2d');
  screen_context.drawImage(canvas, 0, 0);

  //draw the HUD on top
  hud_renderer.drawHUD();

}

////////////////////////////////////////////////////// EVENT LISTENERS ////////////////////////////////////////
canv_input.registerEvents();
