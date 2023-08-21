//-------1---------2---------3---------4---------5---------6---------7---------8

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
//////                                          
//////              WORLD
//////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////


//A hex-shaped array of tiles, with each tile having some information inside them

//Dependencies
import Hex from './u/Hex.js'
import {Point, HexLayout, HexMap} from './u/Hex.js'
import MapGenerator from './MapGenerator.js'
import RiverGenerator from './RiverGenerator.js'
import BonusList from './BonusList.js'
import Unit from './Unit.js'
import Tile from './Tile.js'
import Events from './u/Events.js'


var land_tiles = [
'ocean',
'coast',
'sand',
'grass','grass',
'forest','forest','forest','forest',
'hills','hills','hills','hills','hills',
'mountains','mountains','mountains','mountains','mountains','mountains',
'ice','ice','ice','ice','ice','ice','ice','ice','ice','ice','atmosphere','ice',
'clouds'
];

var world_ids = 0;

export default function World(radius, type, origin) {

  this.radius = radius;
  this.type = type;
  this.id = world_ids++;
  this.tiles_changed = [];

  //configure world dimensions
  if (type == 'system') {
    let scale = 60;
    var tile_size = new Point(35*scale, 35*scale);  
    if (!origin)
      var origin = new Point(0,0);
    this.layout = new HexLayout('orientation_flat', tile_size, origin);  
  } else {// == 'planet'
    let scale = 1;
    var tile_size = new Point(35*scale, 35*scale);  
    if (!origin)
      var origin = new Point(15*10*80, 0);  
    this.layout = new HexLayout('orientation_pointy', tile_size, origin);  
  }


  this.world_map = new HexMap();

  if (type == 'system') {
    
    this.world_map = new MapGenerator().makeSystemMap(radius);
    //for (let hex of Hex.circle(new Hex(0,0), 3))
    let hex = new Hex(0,0)
    this.createUnit(hex, 'star');
    //create resources map
    this.resources = new HexMap();
    this.generateSystemResources();
    this.clearClouds();

  } else {

    //create land map
    this.world_map = new MapGenerator('perlin').makeWorldMap(radius);
    //this.makeCloudsEverywhere();
    for (let hex of this.world_map.getHexes()) {
      this.tileChanged(hex);
    }


    //create units map
    this.resources = new HexMap();
    this.generateResources();

    if (type=='dust') {

    }


    if (type=='earth') {
      this.world_map = new RiverGenerator(this.world_map).getMap();

    }

  }



}

World.prototype.sameAs = function(other_world) {
  return this.id == other_world.id;
}
World.prototype.getTileName = function(elevation) {
  return land_tiles[elevation]
}

World.prototype.getZoom = function() {
  return this.layout.size.x/35;
}

World.prototype.getLayout = function() {
  return this.layout;
}

World.prototype.containsHex = function(hex) {
  return this.world_map.containsHex(hex);
}
World.prototype.hasHex = function(hex) {
  return this.world_map.containsHex(hex);
}
World.prototype.getHex = function(world_position) {
  var hex = Hex.round(this.layout.pointToHex(world_position));
  return hex;
}


World.prototype.getPoint = function(hex) {
  return this.layout.hexToPoint(hex);
}


World.prototype.setHex = function(hex,value) {
  this.world_map.set(hex, value);
}


World.prototype.getHexes = function() {
  return this.world_map.getHexes();
}

World.prototype.tileCount = function() {
  return this.world_map.size();
}



















////////////////////////////////////////////////////
///////////
///////////         WORLD MAP BASIC FUNCTIONS
///////////
////////////////////////////////////////////////////


World.prototype.getTile = function(hex) {
  return this.world_map.getValue(hex);
}

World.prototype.getNeighbors = function(hex) {
  return this.world_map.getNeighbors(hex);
}

World.prototype.getRandomHex = function() {
  return this.world_map.getRandomHex();
}

World.prototype.getActor = function(hex) {
  return this.getUnit(hex);
}

World.prototype.getUnit = function(hex) {
  if (this.containsHex(hex))
    return this.getTile(hex).getUnit();
}

World.prototype.getChangedHexes = function() {
  return this.tiles_changed;
}

World.prototype.tileChanged = function(hex,reason) {
  let world = this;
  Events.emit('tile_changed', {world, hex});
    this.tiles_changed.push(hex);
}


World.prototype.createUnit = function(hex, unit_type) {

    let new_unit = new Unit(unit_type, this);
    this.addUnit(hex, new_unit);
    return new_unit;
}

World.prototype.addUnit = function(hex, unit) {
  this.tileChanged(hex,'addunit');
  unit.setWorld(this)
  this.getTile(hex).addUnit(unit);
}

World.prototype.destroyUnit = function(hex) {
  this.tileChanged(hex,'destroyunit');
  this.getTile(hex).removeUnit();
}




World.prototype.buildRoad = function(hexarray, road_level) {
  let previous_hex;

  if (!road_level)
      road_level = 1;

  for (let hex of hexarray) {
    let tile = this.getTile(hex)
    if (previous_hex && tile) {
      this.addRoadTile(previous_hex, hex, road_level);
      this.clearClouds(hex,1);

    }
    previous_hex = hex;
  }
}


World.prototype.addRoadTile = function(hex1, hex2, road_level) {

  this.tileChanged(hex1,'road');
  this.tileChanged(hex2,'road');


  if (!road_level)
    road_level = 1;

  let world = this;

  function addRoadHalf(hexA, hexB) {

    let tile1 = world.getTile(hexA);
    if (!tile1.road_to) {
      tile1.road_to = new HexMap();
    }

    let new_road = true;

    if ( tile1.road_to.containsHex(hexB) )
      new_road = false;

    if (new_road) {
      tile1.road_to.set(hexB, road_level);

    } else {
      let current_road_level = tile1.road_to.getValue(hexB);
      if (current_road_level < 32) 
        tile1.road_to.set(hexB, current_road_level+road_level );
    } 

    
  }


  addRoadHalf(hex2, hex1);
  addRoadHalf(hex1, hex2);

}

World.prototype.countRoads = function(hex) {
  let count = 0;
  if (this.getTile(hex).road_to)
    count += this.getTile(hex).road_to.size();
  return count;

}

World.prototype.getRoadLevel = function(hex1,hex2) {

  let tile1 = this.getTile(hex1);
  let tile2 = this.getTile(hex2)

  if (!tile1.roadConnected(tile2))
    return 0;

  if (tile1.road_to)
    return tile1.road_to.getValue(hex2);
  else 
    return 0;
}

World.prototype.biggestRoad = function(hex) {
  let road_level = 0;
  for (let hex2 of this.getNeighbors(hex))
    road_level = Math.max(road_level, this.getRoadLevel(hex,hex2));    
  return road_level

}



World.prototype.removeRoads = function(hex) {
  this.tileChanged(hex);
  this.getTile(hex).road_to = null;

}

World.prototype.getResource = function(hex) {
  return this.resources.get(hex);
}

World.prototype.hasResource = function(hex, resource_type = 'food') {
  if (this.getResource(hex))
    return (this.getResource(hex).resources[resource_type] > 0);
  else
    return false;
}

World.prototype.destroyResource = function(hex) {
  this.tileChanged(hex,'destroy');
  this.resources.delete(hex);
  if (this.getResource(hex))
    this.total_resources -= 1;
}

World.prototype.tileExists = function(hex) {
  return (this.world_map.containsHex(hex))
}
World.prototype.tileIsRevealed = function(hex) {
  return (this.world_map.containsHex(hex) && !this.getTile(hex).hidden);
}


World.prototype.getRectangleSubMap = function(qmin, qmax,rmin, rmax) {
  return this.world_map.getRectangleSubMap( qmin, qmax,rmin, rmax);
}













///////////////////////////////////////////////////
//
//            MAP ANALYSIS FUNCTION
//
///////////////////////////////////////////////////

World.prototype.unitAtLocation = function(hex) {
  return (this.containsHex(hex) && this.getUnit(hex) instanceof Unit);
}

World.prototype.countUnits = function(hexarray, unit_type, minimum_count) {

  let count = 0;

  for (let hex of hexarray) {
    if (this.getUnit(hex) && this.getUnit(hex).type == unit_type)
      count++;
  }

  return (count >= minimum_count) 


}

World.prototype.countResources = function(hexarray, resource_type) {
  let count = 0;


  for (let hex of hexarray) {
    if (this.getResource(hex) && 
      this.getResource(hex).resources &&
        this.getResource(hex).resources[resource_type])
      count++;
  }

  return count;
}




World.prototype.nearRiver = function(tile, max_distance) {
  for (let hex of Hex.circle(tile.hex, max_distance)) {
    let neighbor = this.getTile(hex)
    if (neighbor && neighbor.onRiver())
        return true;
  }
}














World.prototype.countLand = function(position, radius, minimum) {
  let count = 0;

  for (let neighbor of Hex.circle(position,radius)) {
    if (this.getTile(neighbor).onLand())
      count++;

    if (count > minimum)
      return true;
  }

  return false;
}

World.prototype.nearCoast = function(position, min_tiles, max_tiles) {
  let count = 0;
  let max = 6;
  let min = 1;

  if (max_tiles)
    max = max_tiles;

  if (min_tiles)
    min = min_tiles;

  for (let neighbor of position.getNeighbors()) {

    if (this.getTile(neighbor) && 
        this.getTile(neighbor).elevation <= 1)
      count++;
  }

  return (count <= max && count >= min) 
}

//'unit' is overlooked, leave it undefined to avoid that
World.prototype.noCitiesInArea = function(position, radius, position_to_ignore) {
  return this.noUnitTypeInArea(position, radius, 'city', position_to_ignore);
}


//'unit' is overlooked, leave it undefined to avoid that
World.prototype.noUnitTypeInArea = function(position, radius, unit_type, position_to_ignore) {
  let area = Hex.circle(position, radius);
  for (let hex of area) {
    //skip position_to_ignore
    if (position_to_ignore && hex.equals(position_to_ignore))
      continue;
    
    //returns false if a city is here
    if (this.containsHex(hex) ) 
      if (this.getUnit(hex) instanceof Unit)
        if (this.getUnit(hex).type==unit_type)
         return false;
  }
  //no cities
  return true;
}








///////////////////////////////////////////////////
//
//            RESOURCE GENERATION FUNCTIONS
//
///////////////////////////////////////////////////


World.prototype.generateUnknown = function() {
  let count=8;
  while(count > 0) {
    let random_hex = this.getRandomHex();
    if (this.getTile(random_hex).elevation < 1)
      continue;
    if (this.getTile(random_hex).elevation > 15)
      continue;
    this.addResource(random_hex, 'unknown');
    count--;
  }
}

World.prototype.addResource = function(hex, type) {
  this.tileChanged(hex,'resource');
  this.resources.set(hex, new Unit(type) );
  this.total_resources += 1;
}

World.prototype.addLocalResource = function(hex) {
  this.tileChanged(hex,'resource');
  let terrain = this.getTile(hex);

  if (terrain.river && terrain.river.water_level >= 7) {
      this.addResource(hex, 'fish' );
      return;
    }

    switch (terrain.elevation) {
      case 1: //coasts
        this.addResource(hex, 'fish' );
        break;
      case 3: //grass
      case 4: 
        this.addResource(hex, 'food');
        break;
      //forest
      case 5: 
      case 6: 
      case 7: 
      case 8: 
        this.addResource(hex, 'wood');
        break;
      case 9: //hills
      case 10: 
      case 11: 
        //resources.set(hex, new Unit('stone'));
        break;
    }

}

World.prototype.generateResources = function() {
  for (let hex of this.world_map.getHexes() )  {

    
    //only 20% of the land gets resources
    if (Math.random() < 0.8) 
      continue;

    this.addLocalResource(hex);
  }
}

World.prototype.generateSystemResources = function() {


  for (let hex of this.world_map.getHexes() )  {

    let terrain = this.getTile(hex);
    
    //only 20% of the land gets these resources
    if (Math.random() < 0.8) {
      continue;
    }
    if ((hex.distanceToCenter() >= this.radius*0.4) 
      && (hex.distanceToCenter() <= this.radius*0.5) 
      || (hex.distanceToCenter() >= this.radius*0.9)) {
      this.addResource(hex, 'asteroid');
    }


    //only 1% of land gets these resources
    if (Math.random() < 0.97) {
      continue;
    }
    if (Math.random() < hex.distanceToCenter()/(this.radius)) {
      continue;
    }

    //sometimes a gas giant
    if (Math.random() < 0.3) {
      this.resources.set(hex, new Unit('giant'));
      for (let neighbor of hex.getNeighbors()) {
        if (Math.random() < 0.3) {
          this.addResource(neighbor, 'planet');
        }
      }
      continue;
    }

    //otherwise a rocky planet
    this.addResource(hex, 'planet'); 
  }
}

World.prototype.makeCloudsEverywhere = function() {
  for (let hex of this.world_map.getHexes()) {
      let tile = this.getTile(hex);
      tile.hidden = true;
          this.tileChanged(hex,'cloud')
  }
}

World.prototype.clearClouds = function(position, radius) {

  let world = this;

  if (!position) {
    for (let hex of this.world_map.getHexes()) {
      let tile = this.getTile(hex);
      tile.hidden = false;
      Events.emit('tile_revealed', {world, hex});
    }
    return;
  }

  if (!radius) {
    this.world_map.get(position).hidden = false;
    Events.emit('tile_revealed', {world, position});
    return;
  }


  for (let hex of Hex.circle(position, radius)) {
    if (this.world_map.containsHex(hex)) {
      let tile = this.getTile(hex);
      tile.hidden = false;
      Events.emit('tile_revealed', {world, hex});
    }
  }
  return;
}
















////////////////////////////////////////////////
/////        UI PERFORMANCE FUNCTION          //
////////////////////////////////////////////////

  World.prototype.highlightHex = function(hex, color) {

    let tile = this.getTile(hex);
    tile.addHighlight(color);
    this.clearClouds(hex,3);

  }

  /*
  World.prototype.highlightRange = function(original_range, color) {

    let range = original_range.concat(); //makes a copy of the array, in case it gets modified later
    let counter = 0;
    let step_time = 100;
    let world = this;

    function stepByStepHighlight() {
        let hex = range[counter];
          
        if (counter >= range.length)
          return;
        if (!world.containsHex(hex))
          return;

        let tile = world.getTile(hex);

        //skip tiles if already the right color
        if (tile.hasHighlight(color)) {
          counter++;
          stepByStepHighlight();
        } else {

          //color the tile with the new color
          world.highlightHex(hex,color);

          //go to the next tile in 100ms
          counter++;
          if (counter < range.length)
            setTimeout(stepByStepHighlight, step_time);
        }

      }
      stepByStepHighlight();

  }
*/







  ////////////////////////////////////////////////
/////        BONUS-RELATED FUNCTION          //
////////////////////////////////////////////////

World.prototype.bonusEnabled = function(bonus_name) {
  return this.bonus_list.bonusEnabled(bonus_name);
}

