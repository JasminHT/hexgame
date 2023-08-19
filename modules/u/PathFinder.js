//-------1---------2---------3---------4---------5---------6---------7--------8

import PriorityQueue from './PriorityQueue.js'
import Hex from './Hex.js'

//PathFinder cell used for mapping paths
//Tracks the previous cell and total path cost
//on 5e path.from the origin to cell
//it take maps as arguments as returns maps as 'visited'
export default function PathFinder(stepCostFunction, getNeighborFunction, stopFunction) {

  //stepCostFunction must be          function(map, coordinate1, coordinate2)
  //getNeighborFunction must be       function(map, coordinate)
  //stopFunction is optional, must be function(map, coordinate1, coordinate2, (maybe origin))

  var visited = new Map();
  var origins = [];
  var map_explored = false;

  //setup 3 functions
  if (!stopFunction)
    var stopFunction = function(map, coordinate1, coordinate2, origin) {return false;};

  //call exploreMap first before calling the other four
  this.exploreMap = function(map, origin, max_cost=10, callback) {
    initVisited(origin);
    rangeFind(map, max_cost, null, callback);
    map_explored = true;
  }
  //Return a function which can be used many times
  this.getCost = function(target) {
    if (!map_explored)
      console.error('Pathfinder must call "exploreMap" at least once')
    return currentCell(target).path_cost;
  };

  //Return a function which can be reused to find the path
  this.getPath = function(target) {
    if (!map_explored)
      console.error('Pathfinder must call "exploreMap" at least once')
    return targetPathfind(target);
  };

  //Returns a function which can be used many times to find range 
  this.getRange = function(max_cost) {
    if (!map_explored)
      console.error('Pathfinder must call "exploreMap" at least once')
    return getRangeArray(max_cost);
  };

    //Returns a function which can be used many times to find range 
  this.getTree = function(max_cost) {
    if (!map_explored)
      console.error('Pathfinder must call "exploreMap" at least once')
    return getRangeTree(max_cost);
  };




  


  function PathFinderCell(coord, previous_coord, path_cost) {
    this.coord = coord;
    this.previous_coord = previous_coord;
    this.path_cost = path_cost;
  };




  //Creates a new map of the visited cells
  function initVisited(origin) {
    visited = new Map();
    origins = [];

    if (Array.isArray(origin)) {

      for (let position of origin) {
        setVisited( position, makeOriginCell(position) );
        origins.push(position);
      }
    } else {
      setVisited( origin, makeOriginCell(origin) );
      origins.push(origin);
    }
  };

  function getOriginArray() {
    return origins;
  }
 
  function makeOriginCell(coord) {
    return new PathFinderCell(coord, undefined, 0);
  };

  //Modifies the pathfinder array result to be returned
  function currentCell(coord) {
    return visited.get(coord.getKey()) || false;
  } ;

  function setVisited(coord, value) {
   visited.set(coord.getKey(), value); 
  };
 

  function hasCell(coord) {
    return visited.has(coord.getKey()); 
  };

  function calculateCost(map, cost_so_far, coord, previous_coord) {
    
    let step_cost = stepCostFunction(map, previous_coord, coord, getOriginArray());
    return cost_so_far + step_cost;
  };

  function makeNeighborCell(map, previous_cell) {

    return function(coord) {
      let previous_coord = previous_cell.coord;
      let cost = calculateCost(map, previous_cell.path_cost, coord, previous_coord);
      return new PathFinderCell(coord, previous_coord, cost);
    };
  };


  //Requires a pathfinded 'visited' array, returns an array of cells
  //recursive
  function calculatePath(origin, target) {
    
    if (origin.equals(target)) {
      return [ makeOriginCell(origin) ];
    }

    //find path to the hex before target using function
    let current_cell = currentCell(target);
    let previous_coord = current_cell.previous_coord;

    let partial_path = calculatePath(origin, previous_coord);
    let full_path = partial_path.push(current_cell);

    return full_path;
  };



  //Return the cells worth revisiting for pathfinding
  function getCellsToRevisit(cells) {

    return cells.filter( (cell) => considerNewCell(cell) );
  };

  //higher order function
  function cellIsWithinCost(max_cost) {

    return function(cell) {
      return !(movementCostExceeded(cell.path_cost, max_cost));
    }
  };


  function cellIsPassable(map) {

    return function(cell) {
      let coord = cell.coord;
      return ( stepCostFunction(map, cell.previous_coord, coord, getOriginArray() ) != undefined );
    };
  };


  
  //Returns true if there is the movement is not exceeded
  function movementCostExceeded(cost, max_cost) {
    
    if (cost === undefined )
      return true;

    if (cost == 'NaN')
      return true;

    if (max_cost < 0 )
      return false;

    if (cost <= max_cost)
      return false;

    return true;
  };


  
  //Returns true if the new cell should be added in
  function considerNewCell(new_cell) {

    //new cells are always added
    //if (!hasBeenVisited(new_cell)) {
      //return true;
    //}   
    //revisited cells are added if better than before
    let current_cell = currentCell(new_cell.coord);
    if (!current_cell)
      return true;

    return newCellIsBetter(current_cell, new_cell);
  };


  function hasBeenVisited(cell) {
    return hasCell( cell.coord );
  };

  function newCellIsBetter(cell, new_cell) {
    return (new_cell.path_cost < cell.path_cost);
  };

  function getGoodNeighbors(map, coord, max_cost) {

    let current_cell = currentCell( coord );
    let neighbor_coords = getNeighborFunction( map, current_cell.coord );
    let neighbor_cells = neighbor_coords.map( makeNeighborCell(map, current_cell) );
    let passable_cells = neighbor_cells.filter( cellIsPassable(map) );
    let cells_in_range = passable_cells.filter( cellIsWithinCost(max_cost));
    let new_cells_to_add = getCellsToRevisit(cells_in_range); 
    return new_cells_to_add;
  };



















  //recursive step of exploring the map
  function rangeFind(map, max_cost, target = null, callback) {
    //console.trace();
    //console.time('rangeFind')
    if (target)
      var coords_to_check = new PriorityQueue(   (coord1, coord2) => (currentCell(coord1).path_cost+Hex.distance(coord1,target) < 
                                                                      currentCell(coord2).path_cost+Hex.distance(coord2,target)) );  
    else
      var coords_to_check = new PriorityQueue(   (coord1, coord2) => (currentCell(coord1).path_cost < currentCell(coord2).path_cost) );  

    for (let origin of origins)
      coords_to_check.push(origin);
      
    //console.time('all')


    //RUN THIS IN THE BACKGROUND, ASYNCHRONOUSLY, AND THEN CALLBACK
    while (!coords_to_check.isEmpty())
      checkNextCell(coords_to_check, map, max_cost, target)
    //callback();
  };

  var coords_checked = 0;
  function checkNextCell(coords_to_check, map, max_cost, target = null) {

    coords_checked++;

    let coord = coords_to_check.pop();

    //do not look further if stop function triggers
    let previous_coord = currentCell(coord).previous_coord;

    if ( previous_coord && (stopFunction(map, previous_coord, coord, origins))  )
      return;

    //Do not look at paths that pass through the target
    if (target && target.equals(coord))
      return;
    

    //Add the neighbors of this cell
    let neighbors = getGoodNeighbors(map, coord, max_cost);

    for (let cell of neighbors){
      setVisited(cell.coord, cell); 
      coords_to_check.push(cell.coord)
    }
  } 









  //Returns an array of coordinates of each cell that was visited 
  function getRangeArray(max_cost) {
    var coord_array = [];
    for (let cell of visited.values()) {
      if (cell.path_cost <= max_cost) {
        coord_array.push( cell.coord ); 
      }
    }
    return coord_array;
  };


  //Returns an array of coordinates of each cell that was visited, and the cell that leads to them 
  function getRangeTree(max_cost) {
    return visited;
  };
 
  //returns an array containing only the coordinates on the path to the target
  function targetPathfind(target) {
    //console.time('targetPathfind')
    let path_array = [];

    if (!hasCell(target)) 
      return false;
    
    //trace path back from target to origin
    let coord = target;
    while (currentCell(coord).previous_coord) {
      path_array.push(coord);
      coord = currentCell(coord).previous_coord;
    }

    path_array.push(coord);
    //console.timeEnd('targetPathfind')
    return path_array;
  };

  
}

