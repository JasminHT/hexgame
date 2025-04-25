
import Hex from './u/Hex.js'
import Action from './Action.js'

//this function is currently set out to be an all-encompassing action that can 
// -capture a single resource
// -create a small settlement of 1 radius (equivalent to village+lighthouse)
// -expand an existing settlement to more radius (up to 5)

export default function actionExpand(distance) {
  Action.call(this);

  this.name = "city-by-land-2";
  this.cost = 2;
  this.takes_city_pop = true;

  this.nextSelection = 'self';

  this.new_unit_type = 'city';
  this.hover_action = new actionGrowRoots(1);
  this.hover_action.actor = this.actor;

  this.can_river = true;
  this.stop_on_rivers = true;

  this.can_leave_rivers_on_first_step = true;
  this.stop_on_river_exit = true;

  this.stop_on_coast = true;
  this.can_water = true;
  this.can_ocean = true;
  this.embark_at_cities = true;
  this.disembark_at_cities = true;

  this.slow_in_water = true;

  this.min_distance = 0;
  this.max_distance = distance;

  this.hover_radius = 3;

  this.destroy_resource = true;
  this.collect_resource = true;

  this.cloud_clear = 2;

  this.also_build_road = true;
  this.can_use_roads = true;
  this.double_road_speed = true;

  this.description = "Expand";
  this.extra_description = "Click a brown tile to grow there";

  this.targetFilterFunction = function(world, actor, target) {
    return world.getTile(target).onLand();
  }

  this.preEffect = function(world, actor, position, target) {

    //Clicking a city: GROW IT
    if (world.unitAtLocation(target) && world.getUnit(target).pop /*&& world.getUnit(target).pop < 11*/) {
      world.getUnit(target).pop++;
    }
  }


  this.effect = function(world, actor, position, target) {

    //Collect resources around new node
    if (world.unitAtLocation(target)) {
      let target_pop = world.getUnit(target).pop;
      this.after_action = new actionGrowRoots( target_pop );
      this.after_action.actor = this.actor;
    }
    world.clearClouds(target,5); 
  }
}





export function actionGrowRoots(max_distance) {
  Action.call(this);

  this.name = "grow-roots";
  this.min_distance = 1;
  this.max_distance = max_distance;
  this.hover_radius = 0;
  this.cloud_clear = 2;

  this.can_water = true;
  this.can_ocean = true;
  this.can_river = true;
  this.stop_on_rivers = true;
  this.stop_on_water = false;
  this.stop_on_coast = true;

  this.no_climbing_ashore = true;
  this.coastal_start = true;

  this.also_build_road = true;
  this.can_use_roads = false;
  this.double_road_speed = false;

  this.collect_resource = true;
  this.destroy_resource = true;

  this.multi_target = true;



  this.description = "Claim resources";
  this.extra_description = "Get all the food";

  this.targetFilterFunction = function(world, actor, target) {
    if (world.unitAtLocation(target)) 
      return false;

    if (!world.hasResource(target, 'food') )
      return false;

    return true;
  }


  this.effect = function(world,actor,position,target) {
    //actor.addPop(1);
    world.createUnit(target, 'village');
    for (let hex of Hex.circle(target, 2))
      world.tag(hex, 'green');
  }
}





export function actionExpandByAir(max_distance) {
  actionExpand.call(this);

  this.name = 'city-by-air';
  this.minimum_elevation = 0;
  this.maximum_elevation = 20;
  this.min_distance = 0;
  this.also_build_road = false;
  this.can_use_roads = false;
  this.sky_action = true;

  this.collect_resource = false;

  this.cost = 0;

  this.cloud_clear = 5;

  this.description = "Seed";
  this.extra_description = "Click any tile to launch a seed there";

  if (max_distance)
    this.max_distance = max_distance;
  else
    this.infinite_range = true;

  this.targetFilterFunction = function(world, actor, target) {
    let tile = world.getTile(target);
    if (!tile) return false;

    return tile.onLand() && !tile.onIce() && !tile.onMountains();
  }

}




//This action transforms the unit into a camp
export function actionMove(max_distance) {
  Action.call(this);

  this.minimum_elevation = 2;

  this.name = "move-city";
  this.can_use_roads = true;
  this.double_road_speed = true;

  this.nextSelection = "target";
  this.min_distance = 0;
  if (max_distance)
    this.max_distance = max_distance;

  this.also_build_road = true;
  this.hover_radius = 3;

  this.hover_action = new actionGrowRoots(3);
  this.hover_action.actor = this.actor;
  this.after_action = this.hover_action;

  this.cloud_clear = 6;

  this.collect_resource = true;
  this.destroy_resource = true;

  this.cost = 4;

  this.description = "Rebase";
  this.extra_description = "Move your central node somewhere else";

  this.targetFilterFunction = function(world, actor, target) {
    let tile = world.getTile(target);
    return tile.onLand() &&  
    (!world.unitAtLocation(target) || !world.noUnitTypeInArea(target, 0, 'colony') ) && 
    ( world.hasResource(target, 'food')  ) ;
  }

  //If ACTIVATION returns true, and the selected unit has this action, the action will appear in its menu, greyed out
  this.activation = function(world, actor, position) {
    return (actor.can_move);
  }

  //if REQUIREMENT also returns true, then the button will no longer be grayed out
  this.requirement = function(world, actor, position) {
    return (actor.can_move);
  }

  this.effect = function(world, actor, position, target) {

    actor.moveActionToTop(this);
    world.addUnit(target, actor);

    world.destroyUnit(position);
    world.createUnit(position, 'city');
    
  }

}

