
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
  //this.hover_action = new actionGrowRoots(2);
  //this.hover_action.actor = this.actor;

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
    return true;//world.onLand(target);
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
      //this.after_action = new actionGrowRoots( target_pop );
      //this.after_action.actor = this.actor;
    }
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

  this.collect_resource = true; //should be true but 'takes city pop' relies on cost
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
      world.highlightHex(hex, 'green');
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





























export function actionExpandAll() {
  Action.call(this);

  this.name = "villagessss";
  this.new_unit_type = 'colony';
  this.can_use_roads = true;
  this.double_road_speed = true;

  this.can_land = true;
  this.can_river = true;
  this.stop_on_rivers = true;

  this.coastal_start = false;
  this.can_water = false;
  this.stop_on_coast = false;
  this.stop_on_water = false;
  this.slow_in_water = true;
  this.no_climbing_ashore = false;

  this.transfer_pop = true;

  this.multi_target = true;

  this.nextSelection = "self";
  this.min_distance = 0;
  this.max_distance = 200000;

  this.also_build_road = true;
  this.hover_radius = 1;

  this.cloud_clear = 7;

  this.cost = -1;

  this.collect_resource = true;


  
  this.description = "Expansion";
  this.extra_description = "Collect all land resources";

  this.targetFilterFunction = function(world, actor, target) {
    return !world.unitAtLocation(target) && world.noUnitTypeInArea (target,1, 'colony');
  }
  this.effect = function(world, actor, position, target) {
    for (let hex of world.getHexes()) {
      let tile = world.getTile(hex);

      if (world.countRoads(hex) >= 3)
        if (tile.onLand() && !world.unitAtLocation(hex))
          world.createUnit(hex, 'village');
    }

    for (let hex of Hex.circle(target,2)){
      let tile = world.getTile(hex);
      if (tile.onLand())
        tile.elevation = 3+Math.floor(Math.random()*4);
    }

  }
  

}














































/*

                   OLD ACTIONS FROM city-style


*/

function cutRiver(world, position) {
  let tile = world.getTile(position);
  let step_time = 300;

  if (tile.onRiver()) {
    var water_level = tile.river.water_level;
    stepByStepCutRiver();
  }

  

  function stepByStepCutRiver() {   
    
    tile.river.water_level -= Math.floor(2*water_level/3);
    tile = world.getTile(tile.river.downstream_hex);

    if (tile.river.downstream_hex)
      setTimeout(stepByStepCutRiver, step_time);

  }
}




/*
//This action transforms the unit into a camp
function actionHydroDam() {
  Action.call(this);

  this.minimum_elevation = 2;

  this.name = "hydro-dam";
  this.min_distance = 0;
  this.max_distance = 10;
  this.hover_radius = 0;
  this.cloud_clear = 0;
  this.river_only = true;
  this.stop_on_rivers = false;

  this.also_build_road = false;

  this.destroy_resource = false;

  this.cost = -4;

  this.multi_target = false;

  this.description = "Hydro Dam";
  this.extra_description = "Dam the river to get lots of resources";

  this.targetFilterFunction = function(world, actor, position, target) {
    return world.isUpstreamOf(target, position) /*&& position.equals(world.getTile(target).river.downstream_hex);
  }

  this.activation = function(world, actor, position) {
    return world.onRiver(position);
  }


  this.effect = function(world,actor,position,target) {
    actor.pop += 4;
    this.hydroDam(world, position);
  }
}*/
/*
function hydroDam = function(world, target) {
    

    let tile = world.getTile(target);
    if (world.getTile(target).river.upstream_hexes) {
      for (upstream of world.getTile(target).river.upstream_hexes) {
        if (world.getTile(upstream).river.water_level >= 7)
          this.hydroDam(world, upstream);
        //setTimeout(function(){ self.hydroDam(world, upstream); }, 200);
      }
      
      //flood the tile
      tile.elevation = 1;     
      world.removeRoads(target);   
      if (!world.noUnitTypeInArea(target, 0, 'colony')) {
        world.getUnit(target).addPop(-1);
        if (!world.getResource(target).resources['unknown'])
          world.destroyResource(target);
        world.destroyUnit(target);
      }
      if (Math.random() <= 0.2)
        world.addResource(target, 'fish');


    } else {
      tile.elevation = 3+Math.floor(5*Math.random());
    }


}
*/




function actionCreateX(distance) {
  Action.call(this);

  this.minimum_elevation = 2;

  this.name = "thing-by-land";
  this.type = "target";
  this.target = "land";
  this.new_unit_type = 'city';

  this.nextSelection = "target";
  this.min_distance = 0;
  this.max_distance = distance;

  this.also_build_road = true;
  this.hover_radius = 3;

  this.cloud_clear = 6;
  this.cost = 4;

  this.can_use_roads = true;

  this.description = "New X";
  this.extra_description = "";

  this.targetFilterFunction = function(world, actor, target) {

    return world.getTile(target).onLand() && world.noCitiesInArea(target,5);
  }
}

//This action transforms the unit into a camp
export function actionCreateCity(distance) {
  actionCreateX.call(this);

  this.minimum_elevation = 2;

  this.name = "city-by-land";
  this.new_unit_type = 'city';

  this.cloud_clear = 6;
  this.cost = 4;

  this.can_use_roads = false;

  this.description = "New city (-4 ants)";
  this.extra_description = "Click somewhere to create a new city";

  this.targetFilterFunction = function(world, actor, target) {
    return world.getTile(target).onLand() && world.noCitiesInArea(target,5);
  }

}

function actionCreateCityBySea(distance) {
  actionCreateCity.call(this);
  this.name = 'city-by-sea';
  this.minimum_elevation = 0;
  this.maximum_elevation = 5;
  this.min_distance = 0;
  this.max_distance = distance;
  this.also_build_road = false;
  this.stop_elevation_up = 2;
  this.can_use_roads = false;

  this.targetFilterFunction = function(world, actor, target) {
    return !world.unitAtLocation(target) && world.getTile(target).onLand() 
           && world.noCitiesInArea(target,5) && world.nearCoast(target);
  }
  this.effect = function(world, actor, position, target) {
    world.unitAtLocation(target).can_move = false;
  }
}




//This action transforms the unit into a camp
function actionCreateAirport(distance) {
  actionCreateX.call(this);

  this.name = "airport";
  this.new_unit_type = 'airport';

  this.min_distance = 2;

  this.hover_radius = 1;
  this.cloud_clear = 3;
  this.cost = 6;
  
  this.description = "Airport (-6 ants)";
  this.extra_description = "";

  this.targetFilterFunction = function(world, actor, target) {
    return world.getTile(target).onLand() && world.noCitiesInArea(target,1);
  }
}


//This action transforms the unit into a camp
function actionCreateVillage(distance) {
  actionCreateX.call(this);

  this.name = "village";
  this.new_unit_type = 'village';

  this.hover_radius = 1;
  this.cloud_clear = 3;
  this.cost = 2;
  
  this.description = "Village (-2 ants)";
  this.extra_description = "";

  this.targetFilterFunction = function(world, actor, target) {
    return world.getTile(target).onLand() && world.noCitiesInArea(target,1) && world.noUnitTypeInArea(target, 1, 'village');
  }
}


//This action transforms the unit into a camp
function actionCreateRiverDock(distance) {
  actionCreateX.call(this);

  this.name = "create-river-dock";
  this.new_unit_type = 'river-dock';
  this.can_use_roads = true;

  this.hover_radius = 0;

  this.can_river = true;
  this.stop_on_rivers = true;

  this.cloud_clear = 3;
  this.cost = 2;
  
  this.description = "River docks (-2 ants)";
  this.extra_description = "Can gather all resources on a river";

  this.targetFilterFunction = function(world, actor, target) {
    return world.getTile(target).onRiver() && !world.unitAtLocation(target);
  }
  this.activation = function(world, actor, position) {
    return world.nearRiver(position, 2);
  }
}


//This action transforms the unit into a camp
function actionCreateExpeditionCenter() {
  actionCreateX.call(this);

  this.name = "expedition-center";
  this.new_unit_type = 'expedition-center';

  this.min_distance = 1;
  this.max_distance = 1;
  this.hover_radius = 0;

  this.cost = 4;
  this.cloud_clear = 5;

  this.description = "Expedition Center (-4)";
  this.extra_description = "Explore the area 10 tiles away.<br>Can create cities further away.";

  this.targetFilterFunction = function(world, actor, target) {
    return !world.unitAtLocation(target) && !world.noCitiesInArea(target,1);
  }
  this.activation = function(world, actor, position) {
    return !world.countUnits(Hex.circle(position, 1), 'expedition-center', 1);
  }

}


//This action transforms the unit into a camp
export function actionCreateHarbor() {
  actionCreateX.call(this);

  this.name = "harbor";
  this.new_unit_type = 'harbor';

  this.max_distance = 3;
  this.hover_radius = 0;

  this.cloud_clear = 5;
  this.cost = 4;

  this.description = "Harbor (-4 ants)";
  this.extra_description = "Explore and settle the sea.";

  this.targetFilterFunction = function(world, actor, target) {
    return !world.unitAtLocation(target) && world.nearCoast(target, 1, 1);
  }
  this.activation = function(world, actor, position) {
    return world.countUnits(Hex.circle(position, 3), 'lighthouse', 1);
  }
  this.requirement = function(world, actor, position) {
    return world.countUnits(Hex.circle(position, 3), 'lighthouse', 1);
  }
}

export function actionCreateLighthouse(distance) {
  actionCreateX.call(this);

  this.minimum_elevation = 1;
  this.stop_elevation_up = 2;

  this.name = "lighthouse";
  this.new_unit_type = 'old-lighthouse';

  this.hover_radius = 5;

  this.cloud_clear = 5;
  this.cost = 2;

  this.can_use_roads = false;

  this.description = "Lighthouse (-2 ants)";
  this.extra_description = "Gather resources in coastal waters";

  this.targetFilterFunction = function(world, actor, target) {
    return (!world.unitAtLocation(target) && world.nearCoast(target,1,6) && world.getTile(target).onLand())
  }
}












function actionGetResource(max_distance, multi_target) {
  Action.call(this);

  this.minimum_elevation = 1;
  this.stop_elevation_down = 1;
  this.stop_on_rivers = true;
  this.can_river = true;

  this.name = "get";
  this.type = "target";
  this.target = "land";
  this.min_distance = 1;
  this.max_distance = max_distance;
  this.hover_radius = 0;

  this.single_use_remains = true;

  this.cloud_clear = 0;
  this.multi_target = multi_target;

  this.new_unit_type = 'colony';

  this.cost = -1;

  this.destroy_resource = false;

  this.description = "Collect resources";
  this.extra_description = "Get all resources up to "+this.max_distance+" tiles away.<br>City can no longer move.";

  this.targetFilterFunction = function(world, actor, target) {

    let tile = world.getTile(target);

    return (
           //dry land food tiles within 3 tiles of the city or...
           (tile.onLand() && !tile.onRiver() && world.hasResource(target, 'food') ) 
           ||
           //...or shallow water fish besides the city tile
           (tile.elevation == 1 && world.hasResource(target, 'food') )
           ||
           //...or river fish besides the city tile
           (tile.onRiver() && world.hasResource(target, 'food') )
           );
  }

  this.activation = function (world, actor, position, target) {

    return this.single_use_remains;

  }

  this.effect = function(world, actor, position, target) {
    this.single_use_remains = false;
    actor.can_move = false;
    actor.addPop(1);

  }


}





function actionCollectRiverFish(max_distance) {
  Action.call(this);

  this.minimum_elevation = 2;

  this.name = "collect-river-fish";
  this.type = "target";
  this.target = "land";
  this.min_distance = 1;
  this.max_distance = max_distance;
  this.hover_radius = 0;
  this.cloud_clear = 0;
  this.river_only = true;
  this.stop_on_rivers = false;

  this.also_build_road = true;

  this.destroy_resource = false;

  this.cost = -1;

  this.multi_target = true;
  this.new_unit_type = 'colony';

  this.description = "Harvest river";
  this.extra_description = "Get all the fish resources in this river";

  this.targetFilterFunction = function(world, actor, position, target) {
    let tile1 = world.getTile(target);
    let tile2 = world.getTile(position)
    return !world.unitAtLocation(target) && tile1.sameRiver(tile2)
         && world.hasResource(target, 'food') ;
  }

  this.activation = function(world, actor, position) {
    let tile1 = world.getTile(target);
    return tile1.onRiver();
  }


  this.effect = function(world,actor,position,target) {
    actor.addPop(1);
  }
}



export function actionGoFishing(max_distance) {
  Action.call(this);

  this.minimum_elevation = 1;
  this.maximum_elevation = 1;

  this.name = "fishing";
  this.type = "target";
  this.target = "land";
  this.min_distance = 1;
  this.max_distance = max_distance;
  this.hover_radius = 0;
  this.cloud_clear = 0;

  this.destroy_resource = false;

  this.cost = -1;

  this.multi_target = true;
  this.new_unit_type = 'fishing-boat';



  this.description = "Go fishing";
  this.extra_description = "Get all the sea resources up to "+this.max_distance+" tiles away";

  this.targetFilterFunction = function(world, actor, position, target) {
    return !world.unitAtLocation(target) && world.hasResource(target, 'food') ;
  }

  this.requirement = function(world, actor, position) {
    return world.nearCoast(position);
  }

  this.effect = function(world,actor,position,target) {
    actor.addPop(1);
  }
}

