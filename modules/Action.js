

///////////////////////////////////////////
//
//            UNIT ACTIONS
//
////////////////////////////////////

import ActionPathfinder from './ActionPathfinder.js'
import Hex from './u/Hex.js'
import {listContainsHex} from './u/Hex.js'

//All actions inherit from this action
export default function Action() {

  //default action settings
  this.minimum_elevation = 2;
  this.maximum_elevation = 13;
  this.min_distance = 1;
  this.max_distance = 1;

  this.nextSelection = "self";
  this.extra_description = "";

  this.can_explore = true;

  this.also_build_road = true;

  this.cloud_clear = 0;
  this.multi_target = false;
  this.destroy_resource = true;
  this.collect_resource = true;
  this.infinite_range = false;
  this.sky_action = false;


  this.can_use_roads = false;
  this.double_road_speed = false;

  this.slow_in_water = false;

  this.can_desert = true;
  this.river_only = false;
  this.can_river = false;
  this.can_water = false;
  this.can_ocean = false;
  this.can_land = true;
  this.stop_on_rivers = false;
  this.stop_on_water = false;
  this.stop_on_coast = false;
  this.no_climbing_ashore = false;


  this.coastal_start = false;
  this.embark_at_cities = false;
  this.disembark_at_cities = false;
  this.can_leave_rivers_on_first_step = true;

  this.takes_city_pop = false; //true makes resources LOCAL, false makes resources GLOBAL

  //evaluates if a target can receive an action
  this.targetFilterFunction = function(world, actor, target) {    return true;  }

  //evaluates if the action will be displayed in the list
  this.activation = function(world, actor, position) {    return true;  }

  //evaluates if the action will be enabled in the list
  this.requirement = function(world, actor, position) {    return true;  }

  //additional effects of the action, which happen after the default ones
  this.preEffect = function(world, actor, position, target) {  }
  this.effect = function(world, actor, position, target) {  }

  this.getDescription = function() {    
    if (this.cost > 0)
      return this.description+" (-"+this.cost+")";
    else
      return this.description;  
  }

  this.getExtraDescription = function() {    return this.extra_description;  }






  /////////////////////////////////////////////////////////
                    // ACTION EFFECTS //
  /////////////////////////////////////////////////////////

  this.doAction = function(world, actor, position, target) {

    //this part is messy, I don't need pathfinding on long-distance actions, for example
    let pathfinder = new ActionPathfinder(this);
    let tree = pathfinder.getTree( world, position, this.max_distance);

    let targets = this.getTargets(world, actor, position); //make a new range array because I'm going to sort it
    let action = this;
      

    if (targets.length <= 0 && !this.infinite_range)
      return;

    //Either do a single action or do the action on all targets
    if (this.multi_target) {

      //do actions in order from closest to furthest, with a preference for land tiles
      targets.sort((a, b) => (world.onWater(a) && world.onLand(b)) ? 1 : -1);
      targets.sort((a, b) => (tree.currentCell(a).path_cost > tree.currentCell(b).path_cost) ? 1 : -1);
      

      let counter = 0;
      let step_time = 500;

      function stepByStep() {
        let hex = targets[counter];
        if (action.targetFilterFunction(world, actor, hex)) {
          action.doSingleAction(world, actor, position, hex);
        } else {
          step_time = 20;
        }
        counter++;
        if (counter < targets.length)
          setTimeout(stepByStep, step_time);
        step_time = 500;
      }
      stepByStep();


    } else { //single target
      action.doSingleAction(world, actor, position, target);
    }
    
    //just to highlight the range again
    this.highlightRange(world, actor, position);


  };


  this.canTarget = function(world, actor, position, target) {
    let targets = this.getTargets(world, actor, position);

    if (Array.isArray(targets))
      return listContainsHex(target, targets);
    else 
      return false;
  }



  this.doSingleAction = function(world, actor, position, target) {

    world.clearClouds(target, this.cloud_clear);

    //preEffect defined by individual actions
    this.preEffect(world, actor, position, target);

    //generic effects applied to all actions depending on their qualities listed below
    if (this.takes_city_pop)       
      actor.addPop(-this.cost);

    if (this.also_build_road)
      this.createRoad(world, position, target);

    if (this.new_unit_type) {
      world.createUnit(target, this.new_unit_type, actor);
      let new_unit = world.getUnit(target);
      this.clearAllRangeClouds(world, new_unit, target);
    }

    if (this.collect_resource) {
      if (world.hasResource(target)) {
        actor.addPop(1);
      }
    }

    if (this.destroy_resource) 
      world.destroyResource(target);

    //then do the action
    this.effect(world, actor, position, target);

    if (this.after_action && this.after_action.multi_target)
      this.after_action.doAction(world, actor, target);

    //this appears twice
    if (this.collect_resource ) 
      if (world.hasResource(target)) 
        world.getUnit(position).addPop(1);

    if (this.transfer_pop)
      if (world.getUnit(target) && world.getUnit(target).pop) {
        actor.addPop(world.getUnit(target).pop);
        world.getUnit(target).pop = 0;
      }


  }

  this.clearAllRangeClouds = function(world, new_actor, position) {
    for (let action of actor.getActions()) {
      if (action.activation(world, new_actor, position)) {
        let range = action.getRange(world, new_actor, position);
        for (let hex of range) 
          world.clearClouds(hex);
      }
    }
  }



  this.getRange = function(world, actor, position) {

    if (this.infinite_range) {
      world.clearClouds();
      return [];
    }     

    if (this.sky_action) {
      var action_range = Hex.circle(position, this.max_distance);
    } else {
      let pathfinder = new ActionPathfinder(this);
      var action_range = pathfinder.getRange( world, position, this.max_distance, this.min_distance );
    }

    return action_range;
  };

  this.highlightRange = function(world, actor, position) {
    let action_range = this.getRange(world, actor, position);
    world.highlightRange(action_range, 'brown');
  }

  this.getTargets = function(world, actor, position) {

    let action_range = this.getRange(world, actor, position);

    let suitable_targets = action_range.filter((target) => this.targetFilterFunction(world, actor, target));

    return suitable_targets;
  };



  this.getPath = function(world, origin, target, extra_max_distance) {

    if (this.sky_action)
      return undefined;

    let max_distance = extra_max_distance || this.max_distance;
    let min_distance = this.min_distance;

    let pathfinder = new ActionPathfinder(this);
    var actionPath = pathfinder.getPath( world, origin, target, max_distance );

    return actionPath;
  };



  this.createRoad = function(world, origin, target, road_level = 1) {

    var actionPath = this.getPath(world,origin,target,20);

    if (actionPath instanceof Array)
      world.buildRoad(actionPath, road_level);
  }


}

  //Modifies the pathfinder array result to be returned
  Map.prototype.currentCell = function(hex) {
    return this.get(JSON.stringify(hex));
  } ;




 














