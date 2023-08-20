
 export default function Tile(hex, elevation=0) {

  this.hex = hex;
  this.elevation = elevation;
  this.wind = 0;
  this.highlights = [];
  this.hidden = false; //should be a highlight

  this.addUnit = function(unit) {
    this.unit = unit;
  }
  this.getUnit = function() {
    return this.unit;
  }
  this.removeUnit = function() {
    this.unit = null;
  }

  this.addHighlight = function(color) {
    this.highlights[color] = true;  }
  this.hasHighlight = function(color) {
    return (this.highlights[color] == true);
  }
  this.highlighted = function() {
    return Object.keys(this.highlights).length > 0
  }
  this.setElevation = function(elevation) { 
    this.elevation=elevation;
  }

  this.sameAs = (tile2) => this.hex.equals(tile2.hex);
  this.riverStart = () => this.river_stars_here
  this.onRiver = () => this.river && this.river.water_level > 7;
  this.onOcean = () => this.elevation == 0;
  this.onSand = () => this.elevation == 2;
  this.onLand = () => this.elevation >= 2;
  this.onMountains = () => this.elevation > 13 && this.elevation < 20;
  this.onClouds = () => this.hidden;
  this.onWater = () => !this.onLand();
  this.onIce = () => this.elevation >= 20;

  this.roadConnected = function(tile2) {


    if (this.road_to)
      for (let to1 of this.road_to.getHexes())
        if (tile2.hex.equals(to1))
          return true;

    if (tile2.road_to)
      for (let to2 of tile2.road_to.getHexes())
        if (this.hex.equals(to2))
          return true;

    //else
    return false;

  }

  this.sameRiverAs = function(tile2) {
    return this.onRiver() && tile2.onRiver() 
            && this.river.name == tile2.river.name;
  }

  this.leavingRiver = function(tile2) {
    return (this.onRiver() && this.onWater() && 
            tile2.riverStarts() && 
            tile2.river.name == this.river.name);
  }
  this.enteringRiver = function(tile2) {
    return tile2.leavingRiver(this);
  }
  this.isUpstreamOf = function(tile2) {
    if (!this.sameRiver(tile2))
      return false;

    if (this.riverStart())
      return false;

    if (tile2.getHex().equals(this.river.downstream_hex) )
      return true;

    return this.isUpstreamOf(this.getTile(this.river.downstream_hex), this);

  }
  this.alongRiver = function(tile2) {
    return (this.sameRiverAs(tile2) && 
          (tile2.hex.equals(this.river.downstream_hex) ||
          this.hex.equals(tile2.river.downstream_hex))
          );
  }


}

