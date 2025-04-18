/////////////////////////////////////////////////////
//              Functions about Tooltips
/////////////////////////////////////////////////////

function clearTooltip() {
  document.getElementById('tooltip').innerHTML = "";
}

function getTooltip() {
  return document.getElementById('tooltip').innerHTML;
}

function addTooltip(message) {
  document.getElementById('tooltip').innerHTML += message;
}




export default function updateTooltip(world, hex) {
  clearTooltip();
  
  //skip hidden and out-of-bounds hexes
  if (!hex) 
    return;
  if (!world.tileIsRevealed(hex)) {
    addTooltip("clouds");
    return;
  }

  //HOVERING OVER THINGS
  addTooltipUnit(world, hex);
  //if (!getTooltip())
  addTooltipResource(world, hex);
  //if (!getTooltip())
  addTooltipTile(world, hex);

}

function addTooltipUnit(world, hex) {
  let unit = world.getUnit(hex);
  if (unit && unit.hasOwnProperty('size'))
    addTooltip(unit.type+", ");
}

function addTooltipResource(world, hex) {
  let resource = world.getResource(hex);
  if (resource && resource.resources) 
    addTooltip(resource.type+", ");
}

function addTooltipTile(world, hex) {
  let tile = world.getTile(hex);
  if (tile && tile.hasOwnProperty('elevation')) {
    addTooltip(world.getTileName(tile.elevation)+", ");
  }
  if (tile.river) {
    addTooltip('river '+tile.river.water_level);
  }
}