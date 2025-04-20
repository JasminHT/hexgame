//-------1----------2---------3---------4---------5---------6---------7--------8

import CanvasDraw from './src/u/CanvasDraw.js';
import CanvasInput from './src/u/CanvasInput.js';
import Events from './src/u/Events.js'
import Hex from './src/u/Hex.js'
import View from './src/View.js';
import {Point} from './src/u/Hex.js'


import GameRender from './src/GameRender.js'
import WorldInput from './src/WorldInput.js';
import World from './src/World.js';
import Unit from './src/Unit.js';
import Score from './src/Score.js';
import ViewInput from './src/ViewInput.js';


//---------------HTML5 Canvas elements-----------

var canvas       = document.getElementById("canvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


//Starts listening for events from the canvas
var canv_input = new CanvasInput('canvas');


//-------------Game-specific elements------------

//Contains a world map, units, and resources
let score = new Score(0);

let earth_radius = 65;
let earth_location = new Point(35*10*80, 0);
var earth = new World( earth_radius, 'dust', earth_location, );
earth.makeCloudsEverywhere();

let mars_radius = 80;
let mars_location = new Point(35*8*72+127, 0);
var mars = new World( mars_radius,'earth', mars_location )


let system_radius = 10;
var system = new World(system_radius, 'system');
 

//-----------Game Engine elements-------------
//A moveable point of view into the game world
var view = new View('canvas');
var view_input = new ViewInput(view); 


//Receives input for the game
//var space_game_input = new GameInput(system, view);


//Has functions for drawing to the screen
//renders the worlds in the order they are listed
let worlds = [earth, mars];

//Create a bunch more worlds!
/*for (let i=0; i<20; i++) {
  let new_world_location = system.getPoint(system.getRandomHex());
  let radius = 25;
  let new_world = new World(radius, 'dust', new_world_location);
  new_world.clearClouds()
  worlds.push(new_world);
}*/


var world_inputs = [];
for (let world of worlds) {
  let world_input = new WorldInput(world, view);
  world_inputs.push(world_input)
}


var game_render = new GameRender(system, worlds, world_inputs, view);



//-----------Initialize the game map----------


//Put the first city in a random position on the "equator" ring
var start_hex = new Hex(0,0);
for (var hex of Hex.ring(new Hex(0,0), earth_radius/2 )) {
  let tile = earth.getTile(hex)
  if (tile.onLand() && !tile.onRiver()) 
    if (earth.countLand(hex, 1,3))
      start_hex = hex;
}

let first_city =  new Unit('city');
earth.destroyResource(start_hex);
earth.addUnit(start_hex, first_city);
first_city.pop = 5;

//for some reason I need to invert the starting hex 
let start_point = earth.getPoint( start_hex.multiply(-1) );
view.setCenter( start_point );

//clear some clouds
earth.clearClouds(start_hex, 6);
//mars.clearClouds(new Hex(0,0), 100)





//-----------Start animation loop----------


game_render.startDrawing();







