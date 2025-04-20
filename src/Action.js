

///////////////////////////////////////////
//
//            UNIT ACTIONS
//
////////////////////////////////////

import ActionPathfinder from './ActionPathfinder.js'
import Hex from './u/Hex.js'
import {listContainsHex} from './u/Hex.js'
import Events from './u/Events.js'

//All actions inherit from this action
export default function Action() {
  
  let self = this;

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

  this.new_unit_type = null; //create a unit on the target
  this.replace_unit = false; //replace pre-existing units


  this.can_use_roads = false;
  this.double_road_speed = false; //moves along roads are free

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

    if (self.infinite_range) {

      self.doSingleAction(world, actor, position, target);

    } else {

      if (!self.pathfinder)
        self.updatePathfinding(world, position, null, this.max_distance);


      //multi-target actions start from the clickpoint and find their own targets to affect
      //single-target actions affect the click-point directly
      if (self.multi_target)
        self.getTargetsDynamic(world, actor, position, (hex)=>self.doSingleAction(world, actor, target, hex) );
      else     
        self.doSingleAction(world, actor, position, target);
    }

    self.highlightRangeAsync(world, position);    



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
      this.actor.addPop(-this.cost);

    if (this.also_build_road)
      this.createRoadAsync(world, position, target);

    if (this.new_unit_type) {
      if (this.replace_target || !world.unitAtLocation(target)) {
        world.destroyUnit(target);
        world.createUnit(target, this.new_unit_type);
        let new_unit = world.getUnit(target);
      }
    }

    if (this.collect_resource) {
      if (world.hasResource(target)) {
        this.actor.addPop(1);
        world.tag(target, 'green');
        Events.emit('score_increase', {points: 1} );
      }
    }

    if (this.destroy_resource) 
      world.destroyResource(target);

    //then do the action
    this.effect(world, actor, position, target);

    if (this.after_action && this.after_action.multi_target){
      this.after_action.doAction(world, actor, target);
    }

    //this appears twice
    if (this.collect_resource ) 
      if (world.hasResource(target)) {
        world.getUnit(position).addPop(1);
      }

    if (this.transfer_pop)
      if (world.getUnit(target) && world.getUnit(target).pop) {
        this.actor.addPop(world.getUnit(target).pop);
        world.getUnit(target).pop = 0;
      }



  }










  //Pathfinding stuff
  //Should all of this be moved to ActionPathfinder?


  this.initialize = function(world, origin) {
    if (!this.pathfinder)
      this.updatePathfinding(world, origin);
      else 
      this.pathfinder.initialize(world, origin);  


    
  }
  //sets a callback for when a new hex is added by the pathfinder
  this.getRangeAsync = function(world, position, callback) {
    
    if (this.infinite_range)
      return;

    if (this.sky_action) {
      for (hex of Hex.circle(position, this.max_distance))
        callback(hex);
    } else {
      this.pathfinder.getRangeAsync( this.max_distance, callback );
    }

    this.updatePathfinding(world, position);
  }


  this.highlightRangeAsync = function(world, position) {

    if (!this.pathfinder)
      this.pathfinder = new ActionPathfinder(this);

    let callback = function(hex) {world.tag(hex, 'brown');}
    this.getRangeAsync(world, position, callback);

    this.updatePathfinding(world, position);
  }



  this.getTargets = function(world, actor, position) {

    if (this.infinite_range) {
      world.clearClouds();
      return [];
    }     

    if (this.sky_action) {
      var action_range = Hex.circle(position, this.max_distance);
    } else {
      var action_range = this.pathfinder.getRange( this.max_distance );
    }

    let suitable_targets = action_range.filter((target) => this.targetFilterFunction(world, actor, target));
    return suitable_targets;
  };

  this.getTargetsAsync = function(world,actor,origin,callback) {

    if (!this.pathfinder)
      this.pathfinder = new ActionPathfinder(this);

    let self=this;

    function filteredCallback(hex) {
      if (self.targetFilterFunction(world,actor,hex))
        callback(hex);
    }

    this.pathfinder.getTargetsAsync( this.max_distance, filteredCallback );
    this.updatePathfinding(world,origin);

  }

  this.getTargetsDynamic = function(world, actor, origin, callback) {
    if (!this.pathfinder)
      this.pathfinder = new ActionPathfinder(this);

    let self=this;

    let filteredCallback = function(hex) {
      if (self.targetFilterFunction(world,actor,hex))
        callback(hex);
    }

    this.pathfinder.getTargetsDynamic( this.max_distance, filteredCallback );
    this.updatePathfinding(world, origin);
  }

  this.getTargetsDynamic2 = function(world, actor, origin, callback) {
    if (!this.pathfinder)
      this.pathfinder = new ActionPathfinder(this);

    let self=this;

    let filteredCallback = function(hex) {
      if (self.targetFilterFunction(world,actor,hex))
        callback(hex);
    }

    this.pathfinder.getTargetsDynamic2( this.max_distance, filteredCallback );
    this.updatePathfinding(world, origin);
  }


  this.getPathAsync = function(world, origin, target, callback) {

    if (this.sky_action)
      return;

    this.pathfinder.getPathAsync( target, callback );
    this.updatePathfinding(world, origin);
  }

  this.getPathAsync2 = function(world,origin,target, callback) {

    if (this.sky_action)
      return;

    this.pathfinder.getPathAsync2( target, callback );
    this.updatePathfinding(world, origin);
  }

  //store an explored pathfinding map, can be reused as needed
  //ASYNCHRONOUS PATHFINDING: launch a pathfinding mission, which will be done in little steps
  this.updatePathfinding = function(world, origin) {

    if (!this.pathfinder)
      this.pathfinder = new ActionPathfinder(this);

    if (this.pathfinder.exploring)
      return false;

    this.pathfinder.startExploring(world, origin, this.max_distance);
  }


  this.createRoadAsync = function(world, origin, target, road_level = 1) {



    function roadCallback(action_path) {

      if (action_path instanceof Array) {
        world.buildRoad(action_path, road_level);
      }
    }

    this.getPathAsync(world, origin, target, roadCallback);


  }



  this.tileChanged = function(world,hex) {
    if (!this.pathfinder)
      this.updatePathfinding(world, hex);

    this.pathfinder.tileChanged(world,hex)
  }
}




 
















