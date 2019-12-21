


  /////////////////////////////////////////////////////////
                    // ACTION PATHFINDER SETTINGS //
  /////////////////////////////////////////////////////////

 function ActionPathfinder(action) {

    this.action = action;

    //get the movement functions
    let self = this;
    var stepCostFunction = self.stepCostFunction.bind(self); 
    var neighborFunction = self.getNeighborsFunction.bind(self);
    var stopFunction = self.stopFunction.bind(self); 

    //create a pathfinder to explore the area around the unit
    PathFinder.call(this, stepCostFunction, neighborFunction, stopFunction);
 }










 ActionPathfinder.prototype.getPathfinder = function() {
  return this.pathfinder;
 }

  //STOP FUNCTION (for pathfinder)
  ActionPathfinder.prototype.stopFunction = function(world, hex, next_hex, origins = null) {
    
    //make origins into an array if it is only a single hex
    if (origins && !Array.isArray(origins))
      origins = [origins];

    let this_tile = world.getTile(hex);
    let next_tile = world.getTile(next_hex);

    //climbing from water to land
    if (world.onWater(hex) && world.onLand(next_hex)) {

      if (this.action.stop_on_coast)
        return true;
    }


    //entering a river from land (except the river tip tile)
    if (!world.onRiver(hex) && world.onRiver(next_hex) && world.onLand(hex) 
      && world.onLand(next_hex) && world.noUnitTypeInArea(next_hex, 0, 'city') && next_tile.river.water_level != 7 ) {
      
      if (this.action.stop_on_rivers)
        return true;
    }

    
    //stepping from land to water, without a river      
    if (world.onLand(hex) && world.onWater(next_hex) && !world.leavingRiver(hex, next_hex) && !world.enteringRiver(hex,next_hex)) { 

      if (this.action.stop_on_water)
        return true;

      let is_coastal_start = false;
      if (this.action.coastal_start)
        for (let origin of origins) {
          if (Hex.equals(hex,origin))
            is_coastal_start = true;
        }
        if (is_coastal_start)
          return true;
    }

    
    
    return false;
  }









  //NEIGHBORS FUNCTION (for pathfinder)
  ActionPathfinder.prototype.getNeighborsFunction = function(world, hex) {
    return world.world_map.getNeighbors(hex);
  }








  //STEP COST FUNCTION (for pathfinder)
  ActionPathfinder.prototype.stepCostFunction = function(world, hex, next_hex, origins) {
    var next_tile = world.getTile(next_hex);
    var this_tile = world.getTile(hex);



    //going into clouds
    if (next_tile.hidden)
      if (!this.action.can_explore)
        return undefined;

    //going into moutains
    if (next_tile.elevation > 13)
      return undefined;

    if (world.onWater(next_hex)) {
      if (!this.action.can_water)
        return undefined;


    }


    //walking on land, no river
    if (world.onLand(hex) && world.onLand(next_hex) && !world.alongRiver(hex, next_hex)) {
      if (!this.action.can_land) {
        return undefined;
      }
    }

    //stepping onto a river from dry land
    if( !world.onRiver(hex) && world.onRiver(next_hex) && world.noUnitTypeInArea(next_hex, 0, 'city') && next_tile.river.water_level != 7) {
      if (!this.action.river_only && !this.action.can_river)
        return undefined;
    }

    //climbing into ocean, but not from a river
    if (world.onLand(hex) && world.onWater(next_hex) && !world.enteringRiver(hex, next_hex) && !world.leavingRiver(hex, next_hex)) {
      
      //coastal starts cannot enter water except from their start position
      if ( this.action.coastal_start )
        for (let origin of origins) {
          if (Hex.equals(origin, hex))
            continue;
          else
            return undefined;
        }

      else if (!this.action.can_water)
        return undefined;
    }

    //climbing from water to land without a river
    if (world.onWater(hex) && world.onLand(next_hex) && !world.enteringRiver(hex, next_hex) && !world.leavingRiver(hex, next_hex)) {
      if (this.action.no_climbing_ashore)
        return undefined;
    }

    //if not along a river
    if (!world.alongRiver(hex, next_hex) ) {
      if (this.action.river_only)
        return undefined;
    }

    //if along a river
    if (world.alongRiver(hex, next_hex) ) {
      if (!this.action.can_river || this.action.stop_on_rivers)
        return undefined;
    }
    


    let cost = 1;



    if (world.onWater(hex) && world.onWater(next_hex))
      cost*= 0.5;

    if (world.onWater(next_hex) && this.action.slow_in_water)
      cost = 100;

    if (world.onWater(hex) && world.onLand(next_hex) && this.action.slow_in_water)
      cost = 200;

    if (world.onLand(hex) && world.onWater(next_hex) && this.action.slow_in_water)
      if (world.noCitiesInArea(hex,0))
        cost = 10;
      else
        cost = 1;

    if ((world.areRoadConnected(hex,next_hex) && (this.action.can_use_roads) )) {
      cost = 0.5;
      if (this.action.double_road_speed)
        cost = 0;

    }


    return cost;
  }




