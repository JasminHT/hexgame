

/////////////////////////////////////////////////////////
                  // UNIT COMMAND //
/////////////////////////////////////////////////////////


function UnitCommand(map, units) {
  this.map = map;
  this.units = units;

}
UnitCommand.p = UnitCommand.prototype;

UnitCommand.p.commandUnit = function(unit, hex, new_hex) {
  var unit_there = this.units.get(new_hex);

  //Do the unit's action if there is something there
  if (unit_there) {
    this.commandUnitToOtherUnit(unit, hex, new_hex);
  
  //Move the unit there if there is nothing
  } else {  

    this.commandUnitToGround(unit, hex, new_hex);

  }
}

//Move the unit from one hex to another hex
UnitCommand.p.commandUnitToGround = function(unit, hex, new_hex) {

  //if the unit has an action to create more units
  if (unit.hasComponent('ground_action_create_unit')) {
    this.groundActionCreateUnit(unit, new_hex);

  //if the unit has an action to change the terrain
  } else if (unit.hasComponent('ground_action_change_terrain')) {
    this.groundActionChangeTerrain(unit, new_hex);

  //Move player if unit is a player
  } else {
    this.groundActionMoveUnit(unit, hex, new_hex);
  }
}

UnitCommand.p.groundActionCreateUnit = function(unit, new_hex) {
  var new_unit_type = unit.ground_action_create_unit;
  if (unit.hasComponent('resources') && unit.resources.food >= 30) {
    unit.resources.food -= 30;
    this.units.set(new_hex, new Unit(new_unit_type));
  }
}

UnitCommand.p.groundActionChangeTerrain = function(unit, new_hex) {
  var current_terrain_value = this.map.getValue(new_hex).elevation;
  var new_terrain_value = unit.ground_action_change_terrain.new_value;
  var affectable_terrain_value = unit.ground_action_change_terrain.affectable_value;

  if (current_terrain_value == affectable_terrain_value) {
    let tile = this.map.getValue(new_hex);
    tile.elevation = new_terrain_value;
  } else {

    //move unit to the new position
    this.moveUnit(current_hex,new_hex);
  }
}

UnitCommand.p.groundActionMoveUnit = function(unit, current_hex, new_hex) {
  //move unit to the new position if you have enough food
  if (unit.hasComponent('resources') ) {
    if (unit.resources.food >= 1) { 
      unit.resources.food -= 1;
      this.moveUnit(current_hex,new_hex);
    } else {
      this.units.remove(current_hex);
    }
  }
}

//Does the current_hex unit's action unto the new_hex unit
UnitCommand.p.commandUnitToOtherUnit = function(unit, current_hex,target_hex) {

  //get both units
  var active_unit = this.units.get(current_hex);
  var target_unit = this.units.get(target_hex);

  //nothing happens

}

UnitCommand.p.commandUnitToSelf = function(unit, hex) {

  if (unit.hasComponent('self_action_grow')) {

    if (unit.resources.wood >= unit.getGrowCost() ) {
      unit.resources.wood -= unit.getGrowCost();
      unit.cityRadius++;
      unit.capacity.food *= 2;
      unit.capacity.wood *= 2;
      unit.capacity.stone *= 2;
    }

  } 

  //Become another unit if the action is defined
  else if (unit.hasComponent('self_action_become_unit')) {
    var type = unit.self_action_become_unit.type;
    var cost = unit.self_action_become_unit.cost;
    var cost_resource = unit.self_action_become_unit.resource;

    if (unit.resources[cost_resource] >= cost) {
      unit.resources[cost_resource] -= cost;

    
      //keep resources component
      if (unit.resources != undefined) {
        var resources = unit.resources;
      }
      this.units.remove(hex);
      this.units.set(hex, new Unit(type) );

      new_unit = this.units.get(hex);


      if (new_unit.hasComponent('range')) {
        new_unit.findRange(this.map, hex);
      }  
      if (resources != undefined) {
        new_unit.resources = resources;
      }
    }


  } else {
    this.selectHex('none');
  }

}

UnitCommand.p.moveUnit = function(current_hex,next_hex) {
  //calculate movements remaining
  var the_unit = this.units.get(current_hex);
  var max_movement = the_unit.movement_left;
  
  //find the path to destination
  var costFunction = the_unit.stepCostFunction.bind(the_unit);
  var neighborFunction = the_unit.getNeighborsFunction.bind(the_unit);
  var costFinder = PathFinder.getCostFinder(costFunction,neighborFunction);
  var cost = costFinder(this.map, current_hex, next_hex, max_movement);
  
  //OPTION A: movement reduces
  //substract it from the movement remaining
  //the_unit.increaseComponent('movement_left', -cost);

  //OPTION B: movement never runs out
  the_unit.setComponent('movement_left', max_movement);
  
  //update the map
  this.units.remove(current_hex);
  this.units.set(next_hex, the_unit);
}