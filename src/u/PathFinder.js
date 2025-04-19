//-------1---------2---------3---------4---------5---------6---------7--------8

import PriorityQueue from './PriorityQueue.js'
import Hex from './Hex.js'
import Events from './Events.js'

//PathFinder cell used for mapping paths
//Tracks the previous cell and total path cost
//on 5e path.from the origin to cell
//it take maps as arguments as returns maps
export default function PathFinder(stepCostFunction, getNeighborFunction, stopFunction) {

  //stepCostFunction must be          function(world, hex1, hex2)
  //getNeighborFunction must be       function(world, hex)
  //stopFunction is optional, must be function(world, hex1, hex2, (maybe origin))

  var tree = new Map();
  this.origins = [];
  this.exploring = false;
  var self = this;
  


  //setup 3 functions
  if (!stopFunction)
    var stopFunction = function(world, hex1, hex2, origin) {return false;};










//---------------MAIN EXPLORATION FUNCTIONS----------------------


  //should only be called once per action
  //otherwise the whole thing should be restarted clean
  this.startExploring = function(world, origins, max_cost=10) {

    this.world = world;
    this.exploring = true;
    this.max_cost = max_cost;

    this.initialize(world, origins);

    //begin an infinite loop here:
    stepByStepPathfinding();

  }

  function stepByStepPathfinding() {

    if (self.hexes_to_check.isEmpty()){
      setTimeout(stepByStepPathfinding, 30);
    } else {
      for (let i=0;i<10;i++) {
        if (!self.hexes_to_check.isEmpty())
          checkNextCell()
      }
      setTimeout(stepByStepPathfinding, 10);
    }
    
  }

  this.initialize = function(world, origin) {

    self.origins = [];
    tree = new Map();
    this.world = world;
    this.hexes_to_check = new PriorityQueue(   
      (hex1, hex2) => (currentCell(hex1).path_cost < currentCell(hex2).path_cost) 
    );


    if (Array.isArray(origin)) {

      for (let position of origin) {
        updateTree( position, makeOriginCell(position) );
        self.origins.push(position);
      }
    } else {
      updateTree( origin, makeOriginCell(origin) );
      self.origins.push(origin);
    }

    for (let origin of self.origins)
      recheckHex(origin);
  };


  //Function called repeatedly for every hex, and called again when something changes
  function checkNextCell() {

    let hex = self.hexes_to_check.pop();
    let previous_hex = currentCell(hex).previous_hex;

    self.world.untag(hex, 'pathfinding')

    //do not look further if stop function triggers
    if ( previous_hex && (stopFunction(self.world, previous_hex, hex, self.origins))  )
      return;    

    //Add the neighbors of this cell to the tree
    let neighbors = getGoodNeighbors(hex, self.max_cost);
    for (let cell of neighbors) {
      updateTree(cell.hex, cell); 
      recheckHex(cell.hex)
    }
  } 
















  //---------------INSTANT FUNCTIONS----------------------------

  //Return a function which can be used many times
  this.getCost = function(target) {
    if (!this.exploring)
      console.error('Pathfinder must call "explore Map" at least once')
    return currentCell(target).path_cost;
  };

  //Returns a function which can be used many times to find range 
  this.getRange = function(max_cost) {
    if (!this.exploring)
      console.error('Pathfinder must call "explore Map" at least once')
    return getRangeArray(max_cost);
  };
















  // -------------- ASYNC CALLBACK FUNCTIONS -------------------------------------

  //Called when any cell is updated
  function triggerCallbacks(cell) {
    if (self.rangeCallback)
      self.rangeCallback(cell);

    if (self.targetCallback) {
      self.targetCallback(cell);
    }

    if (self.targetDynamicCallback) {
      self.targetDynamicCallback(cell);
    }
    if (self.targetDynamicCallback2) {
      self.targetDynamicCallback2(cell);
    }

    if (self.pathCallback) {
      self.pathCallback(cell)
    }
    if (self.pathCallback2) {
      self.pathCallback2(cell)
    }
  }

  this.getRangeAsync = function(max_cost, callback) {
    //Adds a callback function to be triggered anytime a cell is added
    self.rangeCallback = function(cell) {
        if (cell.path_cost <= max_cost) 
          callback( cell.hex ); 
      }
  }

  //this would be better if it could add multiple callbacks
  //then each callback would take care of deleting itself
  //when its function is achieved
  this.getPathAsync = function(target, callback) {

    let potential_path = findPath(target);
    if (potential_path instanceof Array) {
      callback(potential_path);
      return;
    }

    self.pathCallback = function(cell) {
      if (cell.hex.equals(target)) {
        callback(findPath(cell.hex));
        self.pathCallback = null;
      }
    }
  }
  this.getPathAsync2 = function(target, callback) {

    let potential_path = findPath(target);
    if (potential_path instanceof Array) {
      callback(potential_path);
      return;
    }

    self.pathCallback2 = function(cell) {
      if (cell.hex.equals(target)) {
        callback(findPath(cell.hex));
        self.pathCallback2 = null;
      }
    }
  }
  //calls a callback function whenever it finds an array
  this.getTargetsAsync = function(max_cost, preFilteredCallback) {

    self.targetCallback = function(cell){
      if (cell.path_cost <= max_cost)
        preFilteredCallback( cell.hex ); 
    }
  }

  //maintains the mutant_array as having all the targets
  this.getTargetsDynamic = function(max_cost, preFilteredCallback) {

    //function for future cells to be checked
    self.targetDynamicCallback = function(cell) {
      if (cell.path_cost <= max_cost) {
        preFilteredCallback( cell.hex ); 
      }
    }

    //check cells that already exist
    for (let cell of tree.values()) {
      self.targetDynamicCallback(cell);
    }
  }
  this.getTargetsDynamic2 = function(max_cost, preFilteredCallback) {

    //function for future cells to be checked
    self.targetDynamicCallback2 = function(cell) {
      if (cell.path_cost <= max_cost) {
        preFilteredCallback( cell.hex ); 
      }
    }

    //check cells that already exist
    for (let cell of tree.values()) {
      self.targetDynamicCallback2(cell);
    }
  }

  //This is triggered by Events when a tile changes
  this.tileChanged = function( world,hex ) {
    
    if (!world.sameAs(self.world))
      return;

    if (hasCell(hex)) {
      recheckHex(hex);

      for (let neighbor of getNeighborFunction(hex))
        if (hasCell(neighbor))
          recheckHex(neighbor);

    }

  }














  //-----------------------------SMALL PATHFINDING FUNCTIONS---------------------


  function Cell(hex, previous_hex, path_cost) {
    this.hex = hex;
    this.previous_hex = previous_hex;
    this.path_cost = path_cost;
  };


  function getOriginArray() {
    return self.origins;
  }
 
  function makeOriginCell(hex) {
    return new Cell(hex, undefined, 0);
  };

  function currentCell(hex) {
    return tree.get(hex.getKey()) || false;
  } ;

  function previousCell(hex) {
    if ( currentCell(hex) )
      if (currentCell(hex).previous_hex)
        if (hasCell(currentCell(hex).previous_hex))
          return currentCell(currentCell(hex).previous_hex);
    return false;
  }

  //function called approximately ONCE per cell, as the pathfinder progresses
  function updateTree(hex, cell) {

    //Draw black lines on the world map for debug purposes
    if (cell.previous_hex instanceof Hex)
      self.world.showPathfinding(hex, cell.previous_hex)

    tree.set(hex.getKey(), cell); 
    
    triggerCallbacks(cell);

  };

  function recheckHex(hex) {

    //avoiding duplicates
    for (let other_hex of self.hexes_to_check.getArray())
      if (other_hex.equals(hex))
        return;

    //if not duplicate, add it
    if (self.world.containsHex(hex)) {
      self.hexes_to_check.push(hex);
      self.world.tag(hex,'pathfinding')
    }
  }
 

  function hasCell(hex) {
    if (hex instanceof Hex)
      return tree.has(hex.getKey()); 
    else
      return false;
  };

  function calculateCost(cost_so_far, hex, previous_hex) {
    
    let step_cost = stepCostFunction(self.world, previous_hex, hex, getOriginArray());
    return cost_so_far + step_cost;
  };

  function makeNeighborCell(previous_cell) {

    return function(hex) {
      let previous_hex = previous_cell.hex;
      let cost = calculateCost(previous_cell.path_cost, hex, previous_hex);
      return new Cell(hex, previous_hex, cost);
    };
  };

  //Return the cells worth revisiting for pathfinding
  function getCellsToRevisit(cells) {

    return cells.filter( (cell) => considerNewCell(cell) );
  };

  //Returns true if the new cell should be checked again
  function considerNewCell(new_cell) {

    //new cells are always added
    if (neverSeen(new_cell))
      return true;

    let current_cell = currentCell(new_cell.hex);
    if (!current_cell)
      return true;

    //cells are added if better than before
    return (new_cell.path_cost < current_cell.path_cost);

  };

  //higher order function
  function cellIsWithinCost(max_cost) {

    return function(cell) {
      return !(movementCostExceeded(cell.path_cost, max_cost));
    }
  };


  function cellIsPassable() {

    return function(cell) {
      return ( stepCostFunction(self.world, cell.previous_hex, cell.hex, getOriginArray() ) != undefined );
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

  function neverSeen(cell) {
    return !hasCell( cell.hex );
  };

  function newPathIsShorter(cell, new_cell) {
    return (new_cell.path_cost < cell.path_cost);
  };

  function getGoodNeighbors(hex, max_cost) {

    let current_cell = currentCell( hex );
    if (!current_cell)
      return [];

    let neighbor_hexes = getNeighborFunction( hex );
    let neighbor_cells = neighbor_hexes.map( makeNeighborCell(current_cell) );
    let passable_cells = neighbor_cells.filter( cellIsPassable() );
    let cells_in_range = passable_cells.filter( cellIsWithinCost(max_cost));
    let new_cells_to_add = getCellsToRevisit(cells_in_range); 
    return new_cells_to_add;
  };































  //Returns an array of every hex explored
  function getRangeArray(max_cost) {
    var hex_array = [];
    for (let cell of tree.values()) {
      if (cell.path_cost <= max_cost) {
        hex_array.push( cell.hex ); 
      }
    }
    return hex_array;
  };



 
  //returns an array containing only the hexes on the path to the target
  function findPath(target) {
    let path_array = [];
    let max = 200;

    if (!hasCell(target)) 
      return [];

    //trace path back from target to origin
    let hex = target;
    while (currentCell(hex).previous_hex && max) {
      max--;

      let previous_hex = currentCell(hex).previous_hex
      let previous_cell = currentCell(previous_hex);

      if (previous_cell && previous_cell.previous_hex && previous_cell.previous_hex.equals(hex)) {
        console.error('loop in pathfinder')
        self.world.tag(previous_hex,'error')
        self.world.tag(hex,'error')
        return [];
      }

      path_array.push(hex);
      hex = previous_hex;
    }

    path_array.push(hex);

    return path_array;
  };

  
}

