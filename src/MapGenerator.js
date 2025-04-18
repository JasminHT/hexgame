//-------1---------2---------3---------4---------5---------6---------7---------8
/*
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
                
                      MAP GENERATOR

    Creates a randomized world map using the HexMap struct 
    -method: What generation algorithm to use
    -size: the radius of the map in hexes


///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////*/

import Hex from './u/Hex.js'
import {HexMap} from './u/Hex.js'
import PerlinTileGenerator from './TileGenerator.js'
import RiverGenerator from './RiverGenerator.js'
import Tile from './Tile.js'

export default function MapGenerator(map_type) {
  
  var map = new HexMap();
  var radius = 0;


  this.makeWorldMap = function(new_radius) {

    radius = new_radius;
    map = new HexMap();

    var tile_gen = new PerlinTileGenerator();
    var cloud_gen = new PerlinTileGenerator();

    //Create a giant hexagon
    for (let hex of Hex.circle(new Hex(0,0), radius)) {
      setElevation(hex, tile_gen.generateElevation(hex.q, hex.r));
      setWind(hex, tile_gen.generateWind(hex.q, hex.r));
      setClouds(hex, cloud_gen.generateElevation(hex.q, hex.r));
    }


    //fine tune the map
    addWaterRim(0.1);
    roundDown();
    addShallowWater();
    addIceRim();

    //trim coasts
    trimPoints(1, [1,2,3,4,5,6,7], 2, 0 );

    //trim oceans
    trimPoints(0, [0], 2, 1 );

    //map = new RiverGenerator(map).getMap();
    //addFjords();\

    perfectCircle();

    return map;
  }




  this.makeSystemMap = function(new_radius) {
    
    map = new HexMap();
    radius = new_radius;


    var hex = new Hex(0,0);
    //contains the position and content of each tile
    var value = {}; 

    // Iterates over the giant hexagon
    var qmin = -radius;
    var qmax = radius;
    for (var q = qmin; q <= qmax; q++) {
      var rmin = Math.max(-radius, -q - radius);
      var rmax = Math.min(+radius, -q + radius);

      for (var r = rmin; r <= rmax; r++) {
        
        //put in map
        hex = new Hex(q,r);
        setElevation(hex, -1);
      }
    }

    return map;
  }






  function getTile(hex) {
    return map.getValue(hex);
  }

  function setElevation(hex, new_value) {

    var current_tile = getTile(hex);

    if (current_tile instanceof Tile) {
      current_tile.elevation = new_value;  
    } else {
      var new_tile = new Tile(hex, new_value);
      map.set(hex, new_tile)
    }
  }
    

  function getElevation(hex) {
    if (map.containsHex(hex)) 
      return getTile(hex).elevation;
    else 
      return 0;
  }

  function setWind(hex,new_value) {
    var current_tile = getTile(hex);
    if (current_tile instanceof Tile) {
      current_tile.wind = new_value;  
    } else {
      //get value
      var new_tile = new Tile(hex);
      new_tile.wind = new_value;
      map.set(hex,new_tile)
    }
  }


  function setClouds(hex, new_value) {
    var current_tile = getTile(hex);
    if (current_tile instanceof Tile)
      if (new_value > 3)
        current_tile.hidden = true;
      else
        current_tile.hidden = false;  

  }




  function setVariable(hex,variable,new_value) {
    var current_tile = getTile(hex);
    if (current_tile instanceof Tile) {
      current_tile[variable] = new_value;  
    } else {
      //get value
      var new_tile = new Tile(hex);
      new_tile[variable] = new_value;
      map.set(hex,new_tile)
    }
  }







  







  function perfectCircle() {
    for (let hex of map.getHexes())
      if (Math.abs(hex.toDist()) > radius )
        map.delete(hex)
  }

  function addFjords() {
    for (let hex of map.getHexes())
      if (map.get(hex).river && map.get(hex).river.water_level > 150)
        setElevation(hex, 1);
  }

  function roundDown() {
    var value;
    for (let hex of map.getHexes()) {
      value = Math.floor(getElevation(hex));
      setElevation(hex,value);
    }
  }

  //this function is used to eliminate thin strips of random tiles
  //if tile is land_type and doesn't have the required_neighbor_count of required_neighbor_types, it becomes new_land_type
  function trimPoints(land_type, required_neighbor_types, required_neighbor_count, new_land_type) {


    //this function will run over the entire map multiple times, as long as at least 5 tiles change per run
    do {

      var tiles_modified = 0;

      //run this code on each hex
      for (let hex of map.getHexes()) {

        //if the tile is of land_type
        if (getElevation(hex) != land_type) 
          continue;
          
        //count the neighbors of type required_neighbor
        let count = 0;
        for (let neighbor of hex.getNeighbors())
          if (required_neighbor_types.includes(getElevation(neighbor))) 
            count++;

        //if the count is not at least required_neighbor_count
        if (count < required_neighbor_count) {
          setElevation(hex, new_land_type);
          tiles_modified++;
        }

      }

    } while (tiles_modified > 5) 
  } 

  //Adds water in the ratio from the edge of the map
  function addWaterRim(rim_size) {

    //run this code on each hex
    for (let hex of map.getHexes()) {
    
      var distance_to_center = hex.toDist();
      var distance_to_edge = radius - distance_to_center;
      var rim_length = rim_size*radius;
      
      //define new value and insert
      let elevation = getElevation(hex);
      elevation *= 1-Math.pow((rim_length/distance_to_edge),2);
      elevation = Math.max(elevation,0)
      setElevation(hex, elevation);
    }
  }

  function addIceRim() {

    for (let hex of map.getHexes()) {  

      //Mottled rim
      if (hex.toDist() > radius-5 && Math.random() < 0.5) 
        setElevation(hex, 30);

      //Solid rim
      if (hex.toDist() >= radius-2) 
        setElevation(hex, 30);
    }

  }



  function addShallowWater() {

    for (let hex of map.getHexes()) {
      
      //only affect deep water tiles
      if (getElevation(hex) != 0)
        continue;

      //check its neighbors
      for (let neighbor of hex.getNeighbors()) {

        if (!map.containsHex(neighbor))
          continue;

        if (getElevation(neighbor) > 1) 
          setElevation(hex,1);

      }
    }
  }






}