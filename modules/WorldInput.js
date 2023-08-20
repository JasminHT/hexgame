////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
//////                                          
//////              WORLD INPUT
//////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////


import Hex from './u/Hex.js'
import {Point, HexLayout, HexMap} from './u/Hex.js'
import ActionInput from './ActionInput.js';
import Events from './u/Events.js'


//Ideally, events triggered by a WorldInput would only affect a single World
//Multiple WorldInputs can be created side-by-side, one for each world, and they will get along
export default function WorldInput(world, view) {

  this.getWorld = () => world;


  //this is where the world's unit controller is created
  var action_input = new ActionInput(world); 
  var hex_hovered = new Hex();
  var hex_hovered_previous = new Hex();

  this.getActionInput = () => action_input
  this.getHexHovered = () => hex_hovered

  //Event listeners
  Events.on('canvas_click', function(e){
    clickScreenEvent(e.detail.click_pos, 'mouse');
  }); 
  Events.on('canvas_touch', function(e){
    clickScreenEvent(e.detail.click_pos, 'touch');
  }); 
  Events.on('canvas_hover', function(e){
    hoverEvent(e.detail.mousepos);
  });

  document.addEventListener('keydown', logKey);






  //React to keys affecting units in this world
  function logKey(event) {
    //console.log(event.keyCode);

    if (event.keyCode === 187 || event.keyCode === 27) { // escape
        action_input.selectNothing();
        //Events.emit('hex_hovered_changed', {world, hex_hovered});
    }
    return false;
  }



  //React to the mouse hovering at screen_position
  function hoverEvent(screen_position) {
  
    //get the hex being hovered by the mouse
    var world_position = view.screenToWorld(screen_position);
    hex_hovered = world.getHex(world_position);

    //if the mouse moved to a new hex in this world, emit an event
    if ( !hex_hovered.equals(hex_hovered_previous) )
      if (world.containsHex(hex_hovered))
        Events.emit('hex_hovered_changed', {world, hex_hovered});

    //remember the currently hovered hex
    hex_hovered_previous = hex_hovered;
  }



  //React to the screen being clicked at screen_position
  function clickScreenEvent(screen_position, device_type) {
    
    if (action_input != undefined) {

      var world_position = view.screenToWorld(screen_position);
      let hex_clicked = world.getHex(world_position);

      let didnt_move = hex_hovered.equals(hex_hovered_previous)

      if (device_type == "mouse" || didnt_move) {

        if (world.containsHex(hex_clicked))
          Events.emit('hex_clicked', {world, hex_clicked});  //This is emitted once for every world, with hex_clicked in different coordinate systems
      }

      if (world.containsHex(hex_hovered))
        Events.emit('hex_hovered_changed', {world, hex_hovered});
      
    }
  }



}


