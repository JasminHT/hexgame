
/////////////////////////////////////////
//
//               CIVILIZATION
//
/////////////////////////////////////////////

function Civilization() {
  this.selectable = true;
  this.type = Math.floor(Math.random()*5)+1;
  this.id = Math.floor(Math.random()*10000);
  this.name = this.generateName();
  this.generateColors();

    //this.addAction( new actionMove() );

}

Civilization.prototype.setType = function(type) {
  this.type = type;
  this.name = this.generateName();
}
var color_index = -1;

Civilization.prototype.generateColors = function() {

  let colors = ['#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#42d4f4', 
               '#f032e6', '#bfef45', '#fabebe', '#469990', '#e6beff', '#9A6324', '#fffac8', 
               '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#a9a9a9', '#ffffff', '#000000'];

  color_index++;
  if (color_index > colors.length)
    color_index = -1;

  console.log(color_index);
  this.fill_color = colors[color_index];
  //this.fill_color = "hsla(".concat(Math.floor(360*Math.random())).concat(",100%,50%,0.3)"); 
  this.line_color = "hsla(".concat(Math.floor(360*Math.random())).concat(",100%,50%,1)");
}

Civilization.prototype.generateName = function() {
  let vowels = ['a','e','i','o','u','a','e','i','o','u', 'an','ou','in','eu'];
  let consonants = ['b','d','f','g','h','j','k','l','m','n','p','r','s','t','v',
                    'b','d','f','g','h','j','k','l','m','n','p','r','s','t','v','w','x','z'];
  let double_consonants = ['p','br','ch','cr','sk','pl','fl','gr','sm','th'];
  function v(){return vowels[Math.floor(Math.random()*vowels.length)]}
  function c(){return consonants[Math.floor(Math.random()*consonants.length)]}
  function cc(){return double_consonants[Math.floor(Math.random()*double_consonants.length)]}
  if (this.type == 1)
    return v()+c()+v()+c()+v()+'nian';
  if (this.type == 2)
    return c()+v()+c()+'ese';
  if (this.type == 3)
    return v()+c()+c()+'ec';  
  if (this.type == 4)
    return c()+v()+c()+v()+c()+v()+c()+'al';
  if (this.type == 5)
    return c()+v()+cc()+'ish';
}


Civilization.prototype.createUnit = function(unit_type, capital_position) {
  
  let new_unit = new Unit( unit_type );
  new_unit.civ = this;
  new_unit.setGraphic('white',3);
  new_unit.capital_position = capital_position;
  return new_unit;
}




WorldRenderer.p.drawCivTiles = function(hexarray) {
  let civ_tile_arrays = [];
    
  //collect all civ tiles into arrays for each civilization
  for (hex of hexarray) {
    if (this.getTile(hex).hidden) continue;
    if (!this.getTile(hex).civ) continue;
    if (!civ_tile_arrays[this.getTile(hex).civ.id])
      civ_tile_arrays[this.getTile(hex).civ.id] = [];
    civ_tile_arrays[this.getTile(hex).civ.id].push(hex);
  }

  //draw tile arrays
  if (!civ_tile_arrays)
    return;
  for (culture of civ_tile_arrays) {
    if (!(culture instanceof Array))
      continue;
    let civ = this.getTile(culture[0]).civ;    


    //draw the selected civ as yellow
    let selected_civ = game_input.unit_input.getActorSelected();
    if (selected_civ && selected_civ.name == civ.name) {
        let golden_civ = new RenderStyle();
        golden_civ.fill_color = "rgba(150,150,50,0.8)";
        golden_civ.line_color = "black";
        this.drawCivHexes(culture, golden_civ);
    } else {
        this.drawCivHexes(culture, civ);
    }

  }
  
}



WorldRenderer.p.drawCivTile = function(hex, tile) {
  
  var radius_style = new RenderStyle();
  radius_style.fill_color = tile.civ.fill_color;
  radius_style.line_color = tile.civ.line_color;
  this.hex_renderer.drawHex(hex, radius_style);
}
WorldRenderer.p.drawCivHexes = function(hexes, civ) {
  
  var radius_style = new RenderStyle();
  radius_style.fill_color = civ.fill_color;
  radius_style.line_color = civ.line_color;
  this.hex_renderer.drawHexes(hexes, radius_style);
}