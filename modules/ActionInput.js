///////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
                              
 //             ACTION INPUT

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
////////////////////////////////////////////////////////


//Receives input and affects actions
//Launches actions from a single hex_selected origin

//Dependencies
import Hex from './u/Hex.js'
import ActionButtons from './ActionButtons.js'
import Events from './u/Events.js'

import {listContainsHex} from './u/Hex.js'



export default function ActionInput(world_origin) {
  
  var hex_selected;
  var action_buttons = new ActionButtons('action-buttons');


  this.clickHex = clickHex;
  this.selectNothing = selectNothing;
  this.getHexSelected = getHexSelected
  this.getActorSelected = getActorSelected
  this.getActionSelected = getActionSelected

  Events.on('hex_clicked', (event) => {clickHex(event.detail.world, event.detail.hex_clicked)} );



  //-------1---------2---------3---------4---------5---------6--------7---------8--------
  
 
  //The hex clicked might be outside the world
  //each world has 1 actor represented by the HEX SELECTED

  //world and hex may be different from the world_origin
  function clickHex(world_clicked, hex_clicked) {

    if (!world_clicked.containsHex(hex_clicked))
      return;

    if (anActorIsSelected() ) 
      clickWithSelection(world_clicked, hex_clicked);
    else
      clickWithNoSelection(world_clicked, hex_clicked);
  };



  function selectHex(hex) {

    let actor = world_origin.getActor(hex);

    if (hex && actor && world_origin.containsHex(hex)) {
      hex_selected = hex;
      action_buttons.showButtonsFor( world_origin, actor, hex );
    }
    else
      selectNothing();
  };


  function selectNothing() {
    hex_selected = null;
  };

  function aHexIsSelected() {
    if (hex_selected)
      return true;
  };

  function getHexSelected()  {
    if (hex_selected)
      return hex_selected;
    else
      return false;
  };

  function anActorIsSelected() {
    if (!hex_selected) 
      return false;

    var maybe_actor = world_origin.getActor(getHexSelected());
    if (maybe_actor) {
      return (maybe_actor.selectable);
    } else {
      return false;
    }
  };

  function getActorSelected() {
    if (anActorIsSelected()) {
      return world_origin.getActor(getHexSelected());
    } else {
      return false;
    }
  };

  function getActionSelected() {
    if (anActorIsSelected()) {
      let actor = getActorSelected();
      let action = action_buttons.getActionSelected(actor);
      return action;
    } else {
      return false;
    }
  };

  function clickWithNoSelection(world_clicked, target) {
    selectHex(target);
  };


  function clickWithSelection(world_clicked, target) {
    
    let actor = getActorSelected();
    let action = action_buttons.getActionSelected(actor);

    if (action && action.sky_action && action.infinite_range) 
      clickInsideRange(world_clicked, target);   //when clicking another world with an infinite_range action, this will be triggered (but the hex is wrong)
    else if (world_origin.sameAs(world_clicked) && action.canTarget(world_origin, actor, hex_selected, target)) 
      clickInsideRange(world_origin, target);
    else if (world_origin.sameAs(world_clicked))
      clickOutsideRange(world_origin, target);

  };

  //clickInsideRange(world, actor, origin, target, targetworld = world )
  function clickInsideRange(world_clicked, target) {  

    let origin = hex_selected;
    let actor = getActorSelected();
    let action = action_buttons.getActionSelected(actor);

    if (action.requirement(world_origin, actor, origin)) {

      action.doAction(world_clicked, actor, origin, target);

      if (action.nextSelection == 'self')
        action_buttons.showButtonsFor(world_origin, actor, origin);

      if (action.nextSelection == 'target') 
        selectHex(target); 

      if (action.nextSelection == 'new_unit' && world.unitAtLocation(target) )
        selectHex(target); 

    }

    
  };


  function clickOutsideRange(world, target) {

    if (world.unitAtLocation(target)) {
      selectNothing();
      clickHex(world,target);
    }
  };
}