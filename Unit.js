//-------1---------2---------3---------4---------5---------6---------7--------8
// Dependencies:
//   PathFinder.js
//
//           GENERIC UNIT --------------------//

function Unit(unit_type) {
  
  this.setType(unit_type);
  this.selectable = true;

};

Unit.prototype.addAction = function( action ) {
  if (!this.actions) {
    this.actions = [];
  }
  this.actions.push( action );
}

Unit.prototype.setResourceStores = function(food, wood, stone) {
  this.resources = {'food':food, 'wood':wood, 'stone':stone};
}


Unit.prototype.setType = function(unit_type) {
  this.type = unit_type;

  switch (unit_type) {

  case 'village':
    this.setGraphic('white',5);
    this.addAction( new actionGetResource());
    this.addAction( new actionCreateQueensChamber());
    this.addAction( new actionCreateFishingCenter());
    break;

  case 'queens-chamber':
    this.setGraphic('white',3);
    this.addAction( new actionCreateCamp());
    break;

  case 'fishing-center':
    this.setGraphic('lightblue',3);
    this.addAction( new actionGoFishing());
    break;


  case 'fish':
    this.setGraphic('lightblue',1);
    this.setResource('food',1);
    this.setResource('fish',1);
    break;
  case 'food':
    this.setGraphic('yellow',2);
    this.setResource('food',1);
    break;
  case 'wood':
    this.setGraphic('brown',2);
    this.setResource('wood',1);
    this.setResource('forest',1);
    break;
  case 'stone':
    this.setGraphic('grey',2);
    this.setResource('stone',1);
    break;
  case 'route':
    this.setGraphic('green',3);
    this.setResource('route',1);
    break;
  case 'unknown':
    this.setGraphic('purple',2);
    this.setResource('unknown',1);
    this.setResource('food',2);
    break;

  case 'terrain':
    this.elevation = 0;
    this.wind = 0;
    break;
  default:
    this.setGraphic('yellow',2);
    break;
  }
}

Unit.prototype.setResource = function(type, value) {
  if (!this.resources)
    this.resources = [];
  this.resources[type] = value;
  //this.resource_value = value;
}

Unit.prototype.hasDefinedRange = function() {
  return this.hasOwnProperty('range');
}




///////////////////////////////////////////
//
//            RESOURCE DISPLAY COMPONENT
//
////////////////////////////////////

Unit.prototype.setGraphic = function(color,size) {
  this.color = color;
  this.size = size;
}

/////////////////////////////////////////
//
//               RESOURCE GATHERING COMPONENT
//
/////////////////////////////////////////////

Unit.prototype.setCitySize = function(size) {
  this.cityRadius = size;
}






