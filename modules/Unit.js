//-------1---------2---------3---------4---------5---------6---------7--------8
// Dependencies:
//   PathFinder.js
//
//           GENERIC UNIT --------------------//


var unit_id_incrementer = 1000;

import actionExpand from './ActionList.js';
import {actionGrowRoots,actionMove,
         actionGoFishing,actionCreateLighthouse,
        actionExpandAll,actionCreateCity,actionCreateHarbor,actionExpandByAir} from './ActionList.js'


export default function Unit(unit_type, world) {
  
  this.selectable = true;
  this.world = world;

  this.pop = 0;

  this.id = unit_id_incrementer++;
  this.actions = [];

  this.setType(unit_type);
};




Unit.prototype.addPop = function(pop_amount) {
  this.pop += pop_amount;
}

Unit.prototype.getPop = function() {
  return this.pop;
}

Unit.prototype.getActions = function() {
  return this.actions;
}

Unit.prototype.addAction = function( action ) {
  action.actor = this;
  this.actions.push( action );
}

Unit.prototype.getActions = function() {
  return this.actions;

}

Unit.prototype.moveActionToTop = function( action) {
  for (let i=this.actions.length-1;i>=0; i--) {
    if (this.actions[i].name == action.name)
      this.actions.splice(i, 1);
  }
  this.actions.unshift(action);
}


Unit.prototype.setGraphic = function(color,size) {
  this.color = color;
  this.size = size;
}

Unit.prototype.setResource = function(type, value) {
  if (!this.resources)
    this.resources = [];
  this.resources[type] = value;
}

Unit.prototype.setWorld = function(world) {
  this.world = world;
}















//DEFINITION OF UNIT TYPES
Unit.prototype.setType = function(unit_type) {
  this.type = unit_type;

  let city_color = 'saddlebrown';

  switch (unit_type) {

    case 'city':
      this.name = "City";
      this.pop =  1;
      this.setGraphic(city_color,4);
      this.can_move = true;
      this.addAction( new actionExpand(10));
      this.addAction( new actionExpandByAir());
      this.addAction( new actionMove(10) );
      //this.addAction( new actionExpandAll() );
      break;

    case 'village':
      this.name = "Village";
      this.setGraphic('#040',2);
      this.addAction( new actionExpand(5));
      break;

    case 'colony':
      this.name = "Colony";
      this.setGraphic(city_color,1);
      this.setResource('colony',1);
      break;

    case 'fishing-boat':
      this.name = "Fishing boat";
      this.setGraphic('white',2);
      this.setResource('colony',1);
      break;











    ////// city-themed units
    case 'old-village':
      this.name = "Village";
      this.pop = 2;
      this.transfer_pop = true;
      this.setGraphic('white',4);
      
      let actionGetResource2 = new actionGetResource(2, false);
      actionGetResource2.name = 'another-name';
      actionGetResource2.description = 'Get one extra resource';
      actionGetResource2.extra_description = 'Can reach 2 tiles away<br>But only once';

      this.addAction( new actionGetResource(1, true));
      this.addAction( actionGetResource2 );
      this.addAction( new actionCreateRiverDock(1));
      this.addAction( new actionCreateLighthouse(1));
      //this.addAction( new actionCreateVillage(4));
      break;

    case 'old-lighthouse':
      this.name = "Lighthouse";
      this.pop = 2;
      this.transfer_pop = true;
      this.setGraphic('lightblue',4);
      this.addAction( new actionGoFishing(3));
      break;

    case 'old-expedition-center':
      this.name = "Expedition Center";
      this.pop = 4;
      this.setGraphic('pink',5);
      this.addAction( new actionCreateCity(12));
      this.council_connected = false;
      break;

    case 'old-river-dock':
      this.name = "River dock";
      this.pop = 2;
      this.transfer_pop = true;
      this.setGraphic('grey',4);
      this.addAction( new actionCollectRiverFish(12));
      break;

    case 'old-airport':
      this.name = "Airport";
      this.pop = 6;
      this.setGraphic('grey',6);
      this.addAction( new actionCreateCityByAir());
      break;



    case 'old-harbor':
      this.name = "Harbor";
      this.pop = 4;
      this.transfer_pop = true;
      this.setGraphic('brown',5);
      this.addAction( new actionCreateCityBySea(15));
      this.addAction( new actionCreateLighthouse(10));
      break;


    case 'old-fishing-boat':
      this.name = "Fishing boat";
      this.setGraphic('white',3);
      this.setResource('colony',1);
      break;
  /////// END OF OLD UNITS














    //RESOURCE units
    case 'fish':
      this.setGraphic('lightblue',1);
      this.setResource('food',1);
      this.setResource('fish',1);
      break;
    case 'food':
      this.setGraphic('#888',1);
      this.setResource('food',1);
      break;
    case 'wood':
      this.setGraphic('#aaa',1);
      this.setResource('food',1);
      this.setResource('forest',1);
      break;
    case 'stone':
      this.setGraphic('grey',2);
      this.setResource('stone',1);
      break;

    case 'unknown':
      this.setGraphic('purple',2);
      this.setResource('unknown',1);
      this.setResource('food',2);
      break;


    //SPACE-themed units
    case 'star':
      this.setGraphic('yellow',8);
      this.setResource('food',5);
      break;
    case 'earth':
      this.setGraphic('blue',3);
      this.setResource('food',5);
      break;
    case 'asteroid':
      this.setGraphic('grey',1);
      this.setResource('food',5);
      break;
    case 'planet':
      this.setGraphic('brown',3);
      this.setResource('food',3);
      break;
    case 'giant':
      this.setGraphic('red',5);
      this.setResource('food',5);
      break;
    default:
      this.setGraphic('yellow',2);
      break;
  }
}




























