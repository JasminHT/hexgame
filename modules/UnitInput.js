///////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
                              
 //             ACTOR INPUT

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
////////////////////////////////////////////////////////


//Receives input and affects actors inside a single World

//Dependencies
import Hex from './u/Hex.js'
import ActionButtons from './ActionButtons.js'
import Events from './u/Events.js'

import {listContainsHex} from './u/Hex.js'



export default function UnitInput(world) {
  
  var hex_selected;
  var action_buttons = new ActionButtons('action-buttons');
  let unit_input = this;

  this.clickHex = clickHex;
  this.selectNothing = selectNothing;
  this.getHexSelected = getHexSelected
  this.getActorSelected = getActorSelected
  this.getActionSelected = getActionSelected

  //Events.on('hex_clicked', (event) => clickHex(event.detail) );



  //-------1---------2---------3---------4---------5---------6--------7---------8--------
  
 
  //The hex clicked might be outside the world
  //for local actions, this will do nothing
  //for sky_actions that have a long range, this
  //When clicking, the Actor and Target should be able to be in different worlds.

  //Is it possible to bridge the gap between worlds with events?
  //Actor triggers an action, sends an event, the other worldInput receives the event, and initiates the action?

  function clickHex(hex) {

    if (anActorIsSelected() ) 
      clickWithSelection(hex);
    else
      clickWithNoSelection(hex);
  };



  function selectHex(hex) {

    action_buttons.unselectActions();
    let actor = world.getActor(hex);

    if (hex && actor) {
      hex_selected = hex;
      action_buttons.showButtonsFor( world, actor, hex );
    }
    else
      selectNothing();
  };


  function selectNothing() {
    hex_selected = null;
    //action_buttons.showButtonsFor(world, getActorSelected(), getHexSelected());
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

    var maybe_actor = world.getActor(getHexSelected());
    if (maybe_actor) {
      return (maybe_actor.selectable);
    } else {
      return false;
    }
  };

  function getActorSelected() {
    if (anActorIsSelected()) {
      return world.getActor(getHexSelected());
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

  function clickWithNoSelection(target) {
    selectHex(target);
  };


  //clickWithSelection EVENT (world, actor, action, target)
  function clickWithSelection(target) {
    
    let actor = getActorSelected();
    let action = action_buttons.getActionSelected(actor);

    if (action && action.sky_action && action.infinite_range) 
      clickInsideRange(target);   //when clicking another world with an infinite_range action, this will be triggered (but the hex is wrong)
    else if (action.canTarget(world, actor, hex_selected, target)) 
      clickInsideRange(target);
    else
      clickOutsideRange(target);

  };

  //clickInsideRange(world, actor, origin, target, targetworld = world )
  function clickInsideRange(target) {  

    let origin = hex_selected;
    let actor = getActorSelected();
    let action = action_buttons.getActionSelected(actor);

    if (action.requirement(world, actor, origin)) {

      action.doAction(world, actor, origin, target);

      if (action.nextSelection == 'self')
        action_buttons.showButtonsFor(world, actor, origin);

      if (action.nextSelection == 'target') 
        selectHex(target); 

      if (action.nextSelection == 'new_unit' && world.unitAtLocation(target) )
        selectHex(target); 

    }
  };


  function clickOutsideRange(target) {

    if (world.unitAtLocation(target)) {
      selectNothing();
      clickHex(target);
    }
  };
}