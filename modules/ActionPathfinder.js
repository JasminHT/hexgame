


  /////////////////////////////////////////////////////////
                    // ACTION PATHFINDER SETTINGS //
  /////////////////////////////////////////////////////////

import AsyncPathFinder from './u/AsyncPathFinder.js'


export default function ActionPathfinder(action) {



  //create a pathfinder to explore the area around the unit
  AsyncPathFinder.call(this, stepCostFunction, getNeighborsFunction, stopFunction);
  this.action = action;
  

  //The StopFunction determines which steps makes the pathfinding end, for example embarking into water
  //It does not determine which steps are IMPOSSIBLE, those are determined in the step cost function
  function stopFunction(world, hex, next_hex, origins = null) {
    
    //make origins into an array if it is only a single hex
    if (origins && !Array.isArray(origins))
      origins = [origins];

    let this_tile = world.getTile(hex);
    let next_tile = world.getTile(next_hex);

    //climbing from water to land
    if (this_tile.onWater() && next_tile.onLand()) {

      if (action.stop_on_coast && (world.noCitiesInArea(next_hex, 0) || !action.disembark_at_cities)  )
        return true;
    }

    //leaving a river

    //entering a river from land (except the river tip tile)
    if (!this_tile.onRiver() && next_tile.onRiver() && this_tile.onLand() 
      && next_tile.onLand() && world.noCitiesInArea(next_hex, 0)) {
      
      if (action.stop_on_rivers)
        return true;
    }

    
    //stepping from land to water, without a river      
    if (this_tile.onLand() && next_tile.onWater() && !this_tile.leavingRiver(next_tile) && !this_tile.enteringRiver(next_tile)) { 

      //stop if you must stop_on_water
      if (action.stop_on_water)
        return true;
    }

    
    
    return false;
  }









  //NEIGHBORS FUNCTION (for pathfinder)
  function getNeighborsFunction(world, hex) {
    return world.getNeighbors(hex);
  }








  //STEP COST FUNCTION (for pathfinder)
  function stepCostFunction(world, hex, next_hex, origins) {
    var next_tile = world.getTile(next_hex);
    var this_tile = world.getTile(hex);

    let cost = 1;

    if (action.sky_action) {
      return 1;
    }

    // COST IS UNDEFINED FOR THE FOLLOWING IMPOSSIBLE ACTIONS:

    if (next_tile.onClouds())
      if (!action.can_explore)
        return undefined;

    if (next_tile.onMountains())
      return undefined;

    if (next_tile.onWater()) 
      if (!action.can_water)
        return undefined;

    if (next_tile.onSand())
      if (!action.can_desert)
        return undefined;

    //walking on land, no river
    if (this_tile.onLand() && next_tile.onLand() && !this_tile.alongRiver(next_tile)) 
      if (!action.can_land) 
        return undefined;


    //stepping out of a river
    if (this_tile.onRiver() && !next_tile.onRiver()) 
      if (action.stay_on_rivers)
        return undefined;

    //stepping onto a river from dry land
    if( !this_tile.onRiver() && next_tile.onRiver()) 
      if (!action.river_only && !action.can_river)
        return undefined;

    //entering a deep sea tile
    if (next_tile.onOcean()) 
      if (!action.can_ocean)
        return undefined;
    
    //climbing into water, but not from a river
    if (this_tile.onLand() && next_tile.onWater() && !this_tile.enteringRiver(next_tile) && !this_tile.leavingRiver(next_tile)) {

      //cannot water
      if (!action.can_water)
        return undefined;

      //can embark at any city
      if ( !action.coastal_start && action.embark_at_cities) {
        if (world.noCitiesInArea(hex,0))
          return undefined;
      }

      //coastal starts cannot enter water except from their start position
      if ( action.coastal_start && !action.embark_at_cities) {
        for (let origin of origins) {
          if (hex.equals(origin))
            continue;
          else
            return undefined;
        }
      }

    }

    //climbing from water to land without a river
    if (this_tile.onWater() && next_tile.onLand() && !this_tile.enteringRiver(next_tile) && !this_tile.leavingRiver(next_tile)) {
      if (action.no_climbing_ashore)
        return undefined;
    }

    //if not along a river
    if (!this_tile.alongRiver(next_tile) ) {
      if (action.river_only)
        return undefined;
    }

    //if along a river
    if (this_tile.alongRiver(next_tile) ) {
      if (!action.can_river || (action.stop_on_rivers && !action.stay_on_rivers ))
        return undefined;
    }
    


    // IF ACTION IS POSSIBLE, DETERMINING THE COST:
    if (this_tile.onWater() && next_tile.onWater())
      cost= 1;

    if (this_tile.onWater() && next_tile.onWater() && action.slow_in_water)
      cost = 2;

    if (this_tile.onWater() && next_tile.onLand() && action.slow_in_water)
      cost = 2;

    if (this_tile.onLand() && next_tile.onWater() && action.slow_in_water)
      if (world.noCitiesInArea(hex,0))
        cost = 10;
      else
        cost = 1;

    if ((this_tile.roadConnected(next_tile) && (action.can_use_roads) ))
      if (action.double_road_speed )
        cost = 0.01;




    


    return cost;
  }


}

