//-------1---------2---------3---------4---------5---------6---------7---------8
/*/////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
                
      //          PERLIN CONFIGURATION

      A configuration object for the Perlin Tile Generator and Map Generator

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////*/


import SimplexNoise from './u/Noise.js'
import Hex from './u/Hex.js'


export function PerlinConfiguration (config_name) {
  
  this.base;
  this.scales;
  this.weights;

  

  this.getLength = function() {
    return Math.min( this.scales.length, this.weights.length );
  }

  this.setConfigAlgorithmically = function(base,
                                           scale_initial, 
                                           scale_ratio,
                                           weight_initial, 
                                           weight_ratio)     {
    //reset values
    this.base = base;
    this.scales = [];
    this.weights = [];
    var i = 0;

    //fill the scale and weight values
    while (Math.pow(scale_ratio,i) < 1) {
      this.scales[i] = scale_initial*Math.pow(scale_ratio,i);
      this.weights[i] = weight_initial*Math.pow(weight_ratio,i);
      i++;
    }
  }

  this.setConfig = function(config_name) {
    switch (config_name) {
    case 'continents':
      this.scales = [0.00001, 0.001, 0.008,  0.014,0.025,0.083,0.151,0.272,0.489,0.881];
      this.weights = [16, 16, 16,    11.2,  7.84,  5.48,  3.84,  2.69,  1.88, 1.32];
      this.base = 4;


      break;
    /*case 'fractal':
      this.scales = [0.001, 0.01, 0.1,  1];//,  0.2 ];//, 0.1,  0.05, 0.025, 0.012, 0.006, 0.003, 0.001];
      this.weights = [32, 16, 8,   4];//,    2   ];//,   8,    12,   4,     3,     2,     1,     1,   ];
      this.base = 5;
      break;*/

    case 'fractal':
      this.scales = [ 0.04, 0.1, 0.1, 0.5,  1 ];//, 0.1,  0.05, 0.025, 0.012, 0.006, 0.003, 0.001];
      this.weights = [8 ,   2,   2,   1,    1  ];//,   8,    12,   4,     3,     2,     1,     1,   ];
      this.base =5;
      break;

    case 'bigpatches':
      this.scales = [ 0.04, 0.1, 0.1];//, 0.1,  0.05, 0.025, 0.012, 0.006, 0.003, 0.001];
      this.weights = [8 ,   2,   2  ];//,   8,    12,   4,     3,     2,     1,     1,   ];
      this.base =5;
      break;

    case 1:
      this.scales = [  0.02, 0.1, 1, ];
      this.weights = [ 8, 1, 1];
      this.base = 2;
      break;

    case 2: //ocean planet
      this.scales = [  0.02, 0.1, 1, ];
      this.weights = [ 8, 5, 5];
      this.base = -1;
      break;

    case 3: //crater with rivers planet
      this.scales = [  0.02, 0.1, 1, ];
      this.weights = [ 8, 1, 1];
      this.base = 7;
      break;

    case 4: //small islands
      this.scales = [  0.1, 0.5, 1, ];
      this.weights = [ 7, 2, 1];
      this.base = -1;
      break;

    case 5: //small continents
      this.scales = [  0.1, 0.5, 1, ];
      this.weights = [ 6, 3, 0.5];
      this.base = 3;
      break;

    case 6: //large continents, frilly coasts
      this.scales = [  0.03, 0.5, 1, ];
      this.weights = [ 6, 3, 0.5];
      this.base = 4;
      break;

    case 7:
      this.scales = [ 0.04, 0.1, 0.1, 0.5,  1 ];
      this.weights = [8 ,   2,   2,   1,    1  ];
      this.base = 5;
      break;

    case 'default':
    case 'perlin':
    default:
      this.scales = [0.02,0.1,0.2,0.5,1.0,2.0];
      this.weights = [16,8,4,2,1,0.5];
      this.base = 4;
    }
  }

  this.setConfig(config_name);
}








/*/////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
                
      //            TILE GENERATOR

      Creates a single randomized tile, using different algorithms
      Those tiles can be assembled by different map generators


//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////*/


//TileGenerator is not an interface, no abstract classes in Javascript
export function TileGenerator() {
}

TileGenerator.prototype.generateElevation = function(x,y) {

}




export function RandomTileGenerator() {
  TileGenerator.call(this);
  var range = 10;

  this.generateElevation = function(x,y) {
    var value = 1+1*Math.floor((range+2)*Math.random());
    if (value >= range) 
      {value = range;}
    return value;
  }
}
RandomTileGenerator.prototype = Object.create(TileGenerator.prototype);




export default function PerlinTileGenerator() {

  TileGenerator.call(this); 
  //var config = new PerlinConfiguration(1+Math.floor(Math.random()*20 ));
  var config = new PerlinConfiguration('perlin');
  var simplex = new SimplexNoise();  

  var sand_config = new PerlinConfiguration('big_patches');
  var sand_simplex = new SimplexNoise();  


  var tile_x;
  var tile_y;
  var tile_weight;

  
  this.generateElevation = function(x,y) {

    //add up all the perlin values
    var total = config.base;
    for (var i = 0; i < config.getLength(); i++ ) {
      tile_x = config.scales[i]*x;
      tile_y = config.scales[i]*y;
      tile_weight = config.weights[i];
      total += Math.floor(simplex.noise(tile_x, tile_y)*tile_weight);
    }
    if (total == 2)
      total = 3;

    //add patches of desert
    var sand_chance = sand_config.base;
    for (var i = 0; i < sand_config.getLength(); i++ ) {
      tile_x = sand_config.scales[i]*x;
      tile_y = sand_config.scales[i]*y;
      tile_weight = sand_config.weights[i];
      sand_chance += Math.floor(sand_simplex.noise(tile_x, tile_y)*tile_weight);
    }
    if (sand_chance >= 9 && total > 1 && total < 12)
      total = 2;

    //shallow water for anything between these numbers
    //if (total < 1 && total > -7) 
      //{total = 1;}

    //cutoff underwater to ocean
    if (total < 0) 
      {total = 0;}

    //more flatlands, and more mountain heights
    //total = Math.pow((total+1)/6,2);

    //shallow water availability (between 0 and 1)
    //total += 0.75;


    return total;
  }

  this.generateWind = function(x,y) {
    var wind = Hex.spiralDirection(x,y);
    return wind;
  }
}
PerlinTileGenerator.prototype = Object.create(TileGenerator.prototype);
